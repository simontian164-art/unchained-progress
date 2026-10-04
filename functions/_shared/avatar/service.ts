// The digital model workflow, independent of Supabase and of any provider:
//   start    → check consent, profile, face photo, limits → record the attempt → send to provider
//   advance  → ask the provider (throttled) → on completion claim the job, save the image, mark ready
//   approve  → make it the profile's primary avatar; delete every other generated image
//   discard  → delete the image and forget the result
// Called by the `digital-model` Edge Function (user requests + background polling).
import type { AvatarGenerationProvider, ImageBytes } from "./provider.ts";
import { ProviderError } from "./provider.ts";
import type { ApiResult, AvatarStage, AvatarView, FailureCode, GenerationRow, GenerationStatus } from "./types.ts";
import { safeDetail } from "./bytes.ts";

export interface NewGeneration {
  user_id: string;
  profile_id: string;
  source_image_id: string;
  provider: string;
  provider_model: string;
  seed: number;
}

export type GenerationPatch = Partial<Omit<GenerationRow, "id" | "user_id" | "profile_id" | "created_at" | "updated_at">>;

/** Storage + database access. Implemented with Supabase clients in repo.ts, in memory in tests. */
export interface AvatarRepo {
  findProfile(userId: string): Promise<{ id: string; primaryAvatarId: string | null } | null>;
  findCurrentFacePhoto(userId: string, profileId: string): Promise<{ id: string; storagePath: string; mimeType: string } | null>;
  /** Read with the caller's own (RLS-scoped) client, so ownership is re-checked by the database. */
  downloadPhoto(path: string): Promise<Uint8Array>;
  countGenerationsSince(userId: string, sinceIso: string): Promise<number>;
  findActive(userId: string): Promise<GenerationRow | null>;
  findLatest(userId: string): Promise<GenerationRow | null>;
  find(userId: string, id: string): Promise<GenerationRow | null>;
  list(userId: string): Promise<GenerationRow[]>;
  /** Throws ActiveGenerationExists if the one-active-per-user index rejects it. */
  insert(row: NewGeneration): Promise<GenerationRow>;
  /**
   * Conditional update. Applies only when the row is in one of `from` (and, for `finalizing`, was last
   * touched before `staleBefore`). Returns the updated row, or null if the condition didn't match.
   */
  update(userId: string, id: string, patch: GenerationPatch, cond?: { from?: GenerationStatus[]; finalizingStaleBefore?: string }): Promise<GenerationRow | null>;
  saveResult(path: string, image: ImageBytes): Promise<void>;
  removeResults(paths: string[]): Promise<void>;
  setPrimary(userId: string, profileId: string, generationId: string | null): Promise<void>;
  signedUrl(path: string, seconds: number): Promise<string>;
}

export class ActiveGenerationExists extends Error {}

export interface Logger {
  (level: "info" | "warn" | "error", event: string, fields?: Record<string, string | number | boolean | null | undefined>): void;
}

export interface AvatarConfig {
  /** Generation attempts per user per rolling 24 h (each costs provider credits). */
  dailyLimit: number;
  /** A job still not done after this is failed as timed_out. */
  timeoutMs: number;
  /** A row stuck in 'queued' (the starting request died) is failed after this. */
  staleQueuedMs: number;
  /** Another worker's 'finalizing' claim is considered abandoned after this. */
  finalizeStaleMs: number;
  /** User status checks only reach the provider if nobody has asked it for this long. */
  providerCheckEveryMs: number;
  /** Retryable provider failures (overload, pipeline) are resubmitted until this many attempts. */
  maxAttempts: number;
  signedUrlSeconds: number;
}

export const DEFAULT_CONFIG: AvatarConfig = {
  dailyLimit: 8,
  timeoutMs: 10 * 60_000,
  staleQueuedMs: 2 * 60_000,
  finalizeStaleMs: 90_000,
  providerCheckEveryMs: 4_000,
  maxAttempts: 2,
  signedUrlSeconds: 10 * 60,
};

export interface AvatarDeps {
  repo: AvatarRepo;
  provider: AvatarGenerationProvider | null;
  log: Logger;
  now: () => Date;
  randomSeed: () => number;
  config: AvatarConfig;
}

const ACTIVE: GenerationStatus[] = ["queued", "processing", "finalizing"];
const SETTLED: GenerationStatus[] = ["ready", "failed", "discarded"];
const isActive = (g: GenerationRow) => ACTIVE.includes(g.generation_status);
export const isSettled = (g: GenerationRow) => SETTLED.includes(g.generation_status);

const ext = (mime: string) => (mime === "image/png" ? "png" : "jpg");
const age = (deps: AvatarDeps, iso: string | null) => (iso ? deps.now().getTime() - new Date(iso).getTime() : Infinity);
const short = (id: string) => id.slice(0, 8);

export function stageOf(g: GenerationRow): AvatarStage {
  switch (g.generation_status) {
    case "queued":
      return "preparing";
    case "processing":
      return g.provider_status === "processing" ? "preserving" : "building";
    case "finalizing":
      return "finalizing";
    default:
      return g.generation_status;
  }
}

export async function toView(g: GenerationRow, deps: AvatarDeps): Promise<AvatarView> {
  const v: AvatarView = { id: g.id, stage: stageOf(g), approved: g.approved_by_user, createdAt: g.created_at };
  if (g.source_image_id) v.sourceImageId = g.source_image_id;
  if (g.generation_status === "failed") v.failure = g.failure_code ?? "unknown";
  if (g.generated_at) v.generatedAt = g.generated_at;
  if (g.generation_status === "ready" && g.result_path) v.resultUrl = await deps.repo.signedUrl(g.result_path, deps.config.signedUrlSeconds);
  return v;
}

const err = (status: number, code: Extract<ApiResult, { ok: false }>["error"]["code"], message: string, limit?: number): ApiResult => ({ ok: false, status, error: { code, message, ...(limit ? { limit } : {}) } });

async function fail(g: GenerationRow, code: FailureCode, detail: string, deps: AvatarDeps): Promise<GenerationRow> {
  const out = await deps.repo.update(g.user_id, g.id, { generation_status: "failed", failure_code: code, provider_checked_at: deps.now().toISOString() }, { from: ACTIVE });
  const level = code === "provider_unavailable" ? "error" : code === "photo_unusable" || code === "content_blocked" ? "info" : "warn";
  deps.log(level, "avatar.failed", { gen: short(g.id), provider: g.provider, code, attempt: g.attempts, detail: safeDetail(detail) });
  return out ?? (await deps.repo.find(g.user_id, g.id)) ?? g;
}

async function submit(g: GenerationRow, photoPath: string, mime: string, seed: number, deps: AvatarDeps) {
  const t0 = deps.now().getTime();
  const bytes = await deps.repo.downloadPhoto(photoPath);
  const { jobId } = await deps.provider!.start({ faceImage: { bytes, mime }, seed });
  deps.log("info", "avatar.submitted", { gen: short(g.id), provider: g.provider, model: g.provider_model, attempt: g.attempts, ms: deps.now().getTime() - t0 });
  return jobId;
}

// ─── info ────────────────────────────────────────────────────────────────
export function getInfo(deps: AvatarDeps): ApiResult {
  return { ok: true, info: { available: !!deps.provider, processor: deps.provider ? { ...deps.provider.disclosure } : null, dailyLimit: deps.config.dailyLimit } };
}

// ─── start ───────────────────────────────────────────────────────────────
export async function startGeneration(userId: string, input: { consent?: unknown }, deps: AvatarDeps): Promise<ApiResult> {
  if (input.consent !== true) return err(400, "consent_required", "Confirm that this photo can be sent to build your model.");
  if (!deps.provider) return err(503, "unavailable", "Model generation isn't available right now.");
  const profile = await deps.repo.findProfile(userId);
  if (!profile) return err(409, "no_profile", "Create your Digital You profile first.");
  const photo = await deps.repo.findCurrentFacePhoto(userId, profile.id);
  if (!photo) return err(409, "no_face_photo", "Add a front face photo first.");

  // A double tap (or a second device) joins the generation already running instead of paying twice.
  const active = await deps.repo.findActive(userId);
  if (active) {
    const moved = await advance(active, deps);
    if (isActive(moved)) return { ok: true, generation: await toView(moved, deps) };
  }

  const since = new Date(deps.now().getTime() - 24 * 3600_000).toISOString();
  const used = await deps.repo.countGenerationsSince(userId, since);
  if (used >= deps.config.dailyLimit) {
    deps.log("info", "avatar.daily_limit", { used, limit: deps.config.dailyLimit });
    return err(429, "daily_limit", `You've made ${deps.config.dailyLimit} models today. Try again tomorrow.`, deps.config.dailyLimit);
  }

  // Unapproved results from earlier attempts are deleted: only the approved model is kept.
  await discardUnapproved(userId, null, deps);

  const seed = deps.randomSeed();
  let g: GenerationRow;
  try {
    g = await deps.repo.insert({ user_id: userId, profile_id: profile.id, source_image_id: photo.id, provider: deps.provider.id, provider_model: deps.provider.model, seed });
  } catch (e) {
    if (e instanceof ActiveGenerationExists) {
      const now = await deps.repo.findActive(userId);
      if (now) return { ok: true, generation: await toView(now, deps) };
    }
    throw e;
  }
  deps.log("info", "avatar.started", { gen: short(g.id), provider: g.provider, model: g.provider_model });

  try {
    const jobId = await submit(g, photo.storagePath, photo.mimeType, seed, deps);
    g = (await deps.repo.update(userId, g.id, { generation_status: "processing", provider_job_id: jobId, provider_status: "starting", provider_checked_at: deps.now().toISOString() }, { from: ["queued"] })) ?? g;
  } catch (e) {
    const pe = e instanceof ProviderError ? e : new ProviderError("unknown", false, safeDetail(e));
    g = await fail(g, pe.code, pe.detail, deps);
  }
  return { ok: true, generation: await toView(g, deps) };
}

// ─── advance: move one generation forward ────────────────────────────────
export async function advance(g: GenerationRow, deps: AvatarDeps, opts: { force?: boolean } = {}): Promise<GenerationRow> {
  if (isSettled(g)) return g;
  const { config } = deps;
  if (g.generation_status === "queued") {
    return age(deps, g.created_at) > config.staleQueuedMs ? fail(g, "timed_out", "stuck before reaching the provider", deps) : g;
  }
  // Past the time limit we still ask the provider once: a job that finished while nobody was polling
  // (app closed, background task ended) can still be saved instead of thrown away.
  const overdue = age(deps, g.created_at) > config.timeoutMs;
  if (g.generation_status === "finalizing" && !overdue && age(deps, g.updated_at) < config.finalizeStaleMs) return g; // someone else is saving it
  if (!opts.force && !overdue && g.generation_status === "processing" && age(deps, g.provider_checked_at) < config.providerCheckEveryMs) return g;
  if (!deps.provider || !g.provider_job_id) return fail(g, "provider_unavailable", "provider not configured", deps);

  let st;
  try {
    st = await deps.provider.status(g.provider_job_id);
  } catch (e) {
    const pe = e instanceof ProviderError ? e : new ProviderError("provider_busy", true, safeDetail(e));
    if (!pe.retryable) return fail(g, pe.code, pe.detail, deps);
    if (overdue) return fail(g, "timed_out", `no result within the time limit (${pe.detail})`, deps);
    deps.log("warn", "avatar.status_unavailable", { gen: short(g.id), detail: pe.detail });
    return (await deps.repo.update(g.user_id, g.id, { provider_checked_at: deps.now().toISOString() }, { from: ["processing"] })) ?? g;
  }

  if (st.phase === "queued" || st.phase === "running") {
    if (overdue) return fail(g, "timed_out", "no result within the time limit", deps);
    return (await deps.repo.update(g.user_id, g.id, { provider_status: st.rawStatus, provider_checked_at: deps.now().toISOString() }, { from: ["processing"] })) ?? g;
  }

  if (st.phase === "failed") {
    const f = st.failure ?? { code: "unknown" as FailureCode, retryable: false, detail: "failed" };
    if (f.retryable && g.attempts < config.maxAttempts) return retry(g, f.detail, deps);
    return fail(g, f.code, f.detail, deps);
  }

  // completed: claim it so only one worker saves the image
  const claimed = await deps.repo.update(g.user_id, g.id, { generation_status: "finalizing", provider_status: st.rawStatus }, { from: ["processing"], finalizingStaleBefore: new Date(deps.now().getTime() - config.finalizeStaleMs).toISOString() });
  if (!claimed) return (await deps.repo.find(g.user_id, g.id)) ?? g;
  const image = st.image!;
  const path = `${g.user_id}/avatars/${g.id}.${ext(image.mime)}`;
  try {
    await deps.repo.saveResult(path, image);
  } catch (e) {
    // put it back so the next check retries the save (the provider keeps the output for a while)
    deps.log("error", "avatar.save_failed", { gen: short(g.id), detail: safeDetail(e) });
    return (await deps.repo.update(g.user_id, g.id, { generation_status: "processing" }, { from: ["finalizing"] })) ?? claimed;
  }
  const ready = await deps.repo.update(g.user_id, g.id, { generation_status: "ready", result_path: path, result_mime: image.mime, generated_at: deps.now().toISOString(), provider_checked_at: deps.now().toISOString() }, { from: ["finalizing"] });
  if (!ready) {
    // discarded while we were saving: don't keep the file
    await deps.repo.removeResults([path]).catch(() => undefined);
    return (await deps.repo.find(g.user_id, g.id)) ?? claimed;
  }
  deps.log("info", "avatar.ready", { gen: short(g.id), provider: g.provider, attempt: g.attempts, bytes: image.bytes.length, ms: age(deps, g.created_at) });
  return ready;
}

async function retry(g: GenerationRow, detail: string, deps: AvatarDeps): Promise<GenerationRow> {
  deps.log("warn", "avatar.retrying", { gen: short(g.id), attempt: g.attempts, detail: safeDetail(detail) });
  const profile = await deps.repo.findProfile(g.user_id);
  const photo = profile ? await deps.repo.findCurrentFacePhoto(g.user_id, profile.id) : null;
  // only retry with the same photo the user chose
  if (!photo || photo.id !== g.source_image_id) return fail(g, "provider_busy", `${detail} (source photo changed; not retried)`, deps);
  const seed = deps.randomSeed();
  try {
    const next = { ...g, attempts: g.attempts + 1 };
    const jobId = await submit(next, photo.storagePath, photo.mimeType, seed, deps);
    return (await deps.repo.update(g.user_id, g.id, { provider_job_id: jobId, provider_status: "starting", attempts: next.attempts, seed, provider_checked_at: deps.now().toISOString() }, { from: ["processing"] })) ?? g;
  } catch (e) {
    const pe = e instanceof ProviderError ? e : new ProviderError("unknown", false, safeDetail(e));
    return fail(g, pe.code, pe.detail, deps);
  }
}

// ─── status ──────────────────────────────────────────────────────────────
export async function getStatus(userId: string, id: string | undefined, deps: AvatarDeps): Promise<ApiResult> {
  const g = id ? await deps.repo.find(userId, id) : await deps.repo.findLatest(userId);
  if (!g) return id ? err(404, "not_found", "That model doesn't exist.") : { ok: true, generation: null };
  const moved = await advance(g, deps);
  return { ok: true, generation: await toView(moved, deps) };
}

/** Background loop started after `start`: carries the job to the end even if the user leaves. */
export async function pollUntilSettled(userId: string, id: string, deps: AvatarDeps, opts: { intervalMs: number; maxMs: number; sleep: (ms: number) => Promise<void> }) {
  const t0 = deps.now().getTime();
  const maxRounds = Math.ceil(opts.maxMs / Math.max(1, opts.intervalMs)) + 1; // bound even if the clock misbehaves
  for (let round = 0; round < maxRounds && deps.now().getTime() - t0 < opts.maxMs; round++) {
    await opts.sleep(opts.intervalMs);
    const g = await deps.repo.find(userId, id);
    if (!g || isSettled(g)) return;
    const moved = await advance(g, deps, { force: true });
    if (isSettled(moved)) return;
  }
}

// ─── approve / discard ───────────────────────────────────────────────────
async function discardRow(g: GenerationRow, deps: AvatarDeps) {
  if (g.result_path) await deps.repo.removeResults([g.result_path]);
  await deps.repo.update(g.user_id, g.id, { generation_status: "discarded", result_path: null, result_mime: null, approved_by_user: false, approved_at: null });
}

/** Deletes the images of generations that aren't the approved model (except `keep`). */
async function discardUnapproved(userId: string, keep: string | null, deps: AvatarDeps) {
  for (const g of await deps.repo.list(userId)) {
    if (g.id === keep || g.approved_by_user || !g.result_path) continue;
    await discardRow(g, deps);
  }
}

export async function approve(userId: string, id: string, deps: AvatarDeps): Promise<ApiResult> {
  const g = await deps.repo.find(userId, id);
  if (!g) return err(404, "not_found", "That model doesn't exist.");
  if (g.generation_status !== "ready") return err(409, "not_ready", "This model isn't ready yet.");
  const profile = await deps.repo.findProfile(userId);
  if (!profile) return err(409, "no_profile", "Create your Digital You profile first.");
  // The previous primary model is replaced: delete its image rather than keep hidden copies.
  for (const other of await deps.repo.list(userId)) {
    if (other.id !== id && (other.approved_by_user || other.result_path)) await discardRow(other, deps);
  }
  const now = deps.now().toISOString();
  const out = (await deps.repo.update(userId, id, { approved_by_user: true, approved_at: now }, { from: ["ready"] })) ?? g;
  await deps.repo.setPrimary(userId, profile.id, id);
  deps.log("info", "avatar.approved", { gen: short(id), provider: g.provider });
  return { ok: true, generation: await toView(out, deps) };
}

export async function discard(userId: string, id: string, deps: AvatarDeps): Promise<ApiResult> {
  const g = await deps.repo.find(userId, id);
  if (!g) return err(404, "not_found", "That model doesn't exist.");
  if (g.approved_by_user) {
    const profile = await deps.repo.findProfile(userId);
    if (profile) await deps.repo.setPrimary(userId, profile.id, null);
  }
  await discardRow(g, deps);
  deps.log("info", "avatar.discarded", { gen: short(id), was_active: isActive(g), was_approved: g.approved_by_user });
  const out = await deps.repo.find(userId, id);
  return { ok: true, generation: out ? await toView(out, deps) : null };
}
