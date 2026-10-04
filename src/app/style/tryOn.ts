import { supabase } from "@/integrations/supabase/client";
import { IndexedDbKV } from "@/app/digital/localService";

export type GarmentCategory = "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";
export const CATEGORIES: GarmentCategory[] = ["tops", "bottoms", "outerwear", "shoes", "accessories"];

export interface Garment { id: string; category: GarmentCategory; image: string; title: string; source: "upload" | "url" | "curated"; createdAt: string }
export type JobStatus = "queued" | "processing" | "complete" | "failed";
export interface TryOnJob {
  id: string; providerJobId?: string; status: JobStatus; stage: number;
  avatarId: string; beforeImage: string; garmentIds: string[]; category: GarmentCategory;
  resultImage?: string; provider?: string; providerModel?: string; error?: string; createdAt: string; seen?: boolean;
}
export interface SavedLook { id: string; user_id: string; avatar_id: string; garment_ids: string[]; result_image: string; before_image: string; provider: string; provider_model: string; generated_at: string }

export const STAGES = ["FITTING LOOK", "ANALYZING GARMENT", "APPLYING FIT", "FINALIZING LOOK"];

// ── on-device store (accounts are off, so everything lives in this browser) ──
const kv = new IndexedDbKV("glowmax_style_lab_v1");
const listeners = new Set<() => void>();
export const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));
const emit = () => listeners.forEach((f) => f());
async function read<T>(k: string): Promise<T[]> { return ((await kv.get<T[]>("records", k).catch(() => undefined)) ?? []) as T[]; }
async function write<T>(k: string, v: T[]) { await kv.set("records", k, v); emit(); }

export const getWardrobe = () => read<Garment>("wardrobe");
export const getLooks = () => read<SavedLook>("looks");
export const getJobs = () => read<TryOnJob>("jobs");
export async function addGarment(g: Omit<Garment, "id" | "createdAt">) {
  const item: Garment = { ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  await write("wardrobe", [item, ...(await getWardrobe())]);
  return item;
}
export async function removeGarment(id: string) { await write("wardrobe", (await getWardrobe()).filter((g) => g.id !== id)); }
export async function saveLook(job: TryOnJob) {
  if (!job.resultImage) return;
  const looks = await getLooks();
  if (looks.some((l) => l.id === job.id)) return;
  const look: SavedLook = { id: job.id, user_id: "device", avatar_id: job.avatarId, garment_ids: job.garmentIds, result_image: job.resultImage, before_image: job.beforeImage, provider: job.provider ?? "", provider_model: job.providerModel ?? "", generated_at: job.createdAt };
  await write("looks", [look, ...looks]);
}
export async function deleteLook(id: string) { await write("looks", (await getLooks()).filter((l) => l.id !== id)); }
async function patchJob(id: string, p: Partial<TryOnJob>) {
  const jobs = await getJobs();
  await write("jobs", jobs.map((j) => (j.id === id ? { ...j, ...p } : j)).slice(0, 30));
}
export const markSeen = (id: string) => patchJob(id, { seen: true });

// ── images ──
/** Any image src (blob:, data:, https) → JPEG data URI, longest side ≤ 1536. */
export async function toDataUri(src: string, max = 1536): Promise<string> {
  const im = new Image();
  im.crossOrigin = "anonymous";
  im.src = src;
  await im.decode();
  const s = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(im.naturalWidth * s);
  c.height = Math.round(im.naturalHeight * s);
  c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.9);
}
export const fileToDataUri = (f: File) => toDataUri(URL.createObjectURL(f));

// ── backend calls ──
export class TryOnUnavailable extends Error {}
async function call<T>(body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke("try-on", { body });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const payload = ctx && typeof ctx.json === "function" ? await ctx.json().catch(() => ({})) : {};
    if (payload?.error === "not_configured") throw new TryOnUnavailable("Try-on isn't switched on yet.");
    throw new Error(payload?.message ?? "The try-on service didn't respond. Please try again.");
  }
  return data as T;
}

export async function startTryOn(p: { avatarId: string; beforeImage: string; garments: Garment[] }) {
  const g = p.garments[p.garments.length - 1];
  const job: TryOnJob = { id: crypto.randomUUID(), status: "queued", stage: 0, avatarId: p.avatarId, beforeImage: p.beforeImage, garmentIds: p.garments.map((x) => x.id), category: g.category, createdAt: new Date().toISOString() };
  await write("jobs", [job, ...(await getJobs())]);
  try {
    const garmentImage = g.image.startsWith("https://") ? g.image : await toDataUri(g.image);
    const modelImage = await toDataUri(p.beforeImage);
    await patchJob(job.id, { status: "processing", stage: 1 });
    const r = await call<{ jobId: string; provider: string; providerModel: string; resultImage: string }>({ action: "start", modelImage, garmentImage, category: g.category });
    await patchJob(job.id, { status: "complete", stage: 3, resultImage: r.resultImage, provider: r.provider, providerModel: r.providerModel });
  } catch (e) {
    await patchJob(job.id, { status: "failed", error: e instanceof Error ? e.message : "Couldn't start the try-on." });
    throw e;
  }
  return job.id;
}

let polling = false;
/** Polls every unfinished job until done. Safe to call repeatedly; survives leaving the page (resumes on return). */
export async function pollAll() {
  if (polling) return;
  polling = true;
  try {
    for (;;) {
      const open = (await getJobs()).filter((j) => (j.status === "queued" || j.status === "processing") && j.providerJobId);
      if (!open.length) break;
      for (const j of open) {
        try {
          const s = await call<{ phase: JobStatus; resultImage?: string; error?: string }>({ action: "status", jobId: j.providerJobId });
          const stage = s.phase === "processing" ? Math.min(3, Math.max(2, j.stage + 1)) : j.stage;
          await patchJob(j.id, { status: s.phase, stage, resultImage: s.resultImage, error: s.phase === "failed" ? s.error ?? "The try-on failed." : undefined });
        } catch { /* transient; retry next tick */ }
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  } finally {
    polling = false;
  }
}
