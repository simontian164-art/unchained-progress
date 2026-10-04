// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { FashnAvatarProvider, mapRuntimeError } from "./fashn.ts";
import type { AvatarGenerationProvider, AvatarJobStatus } from "./provider.ts";
import { ProviderError } from "./provider.ts";
import { createAvatarProvider } from "./registry.ts";
import { approve, advance, DEFAULT_CONFIG, discard, getStatus, pollUntilSettled, startGeneration, type AvatarDeps } from "./service.ts";
import { handleAvatarRequest } from "./handler.ts";
import { bytesToBase64, safeDetail } from "./bytes.ts";
import { MemoryAvatarRepo } from "./testing/memoryRepo.ts";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const jpegUri = `data:image/jpeg;base64,${bytesToBase64(JPEG)}`;
const U = "11111111-1111-4111-8111-111111111111";

type Call = { url: string; init?: RequestInit };
function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const f = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init);
  }) as unknown as typeof fetch;
  return { f, calls };
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// ─── FASHN adapter: request shape and response mapping, per docs.fashn.ai ───
describe("FashnAvatarProvider", () => {
  it("submits face-to-model exactly as documented", async () => {
    const { f, calls } = mockFetch(() => json({ id: "job-1", error: null }));
    const p = new FashnAvatarProvider({ apiKey: "sk-test", fetch: f });
    expect(await p.start({ faceImage: { bytes: JPEG, mime: "image/jpeg" }, seed: 1234 })).toEqual({ jobId: "job-1" });
    const c = calls[0];
    expect(c.url).toBe("https://api.fashn.ai/v1/run");
    expect(c.init?.method).toBe("POST");
    expect(c.init?.headers).toMatchObject({ Authorization: "Bearer sk-test", "Content-Type": "application/json" });
    const body = JSON.parse(String(c.init?.body));
    expect(body.model_name).toBe("face-to-model");
    expect(body.inputs).toEqual({
      face_image: jpegUri, aspect_ratio: "3:4", resolution: "2k", generation_mode: "balanced", seed: 1234, num_images: 1, output_format: "jpeg", return_base64: true,
    });
    expect(body.inputs.prompt).toBeUndefined(); // no clothing / styling yet
  });

  it("maps request-level errors to neutral codes", async () => {
    const cases: [Response | Error, string, boolean][] = [
      [json({ error: "UnauthorizedAccess", message: "Unauthorized: Invalid token" }, 401), "provider_unavailable", false],
      [json({ error: "OutOfCredits", message: "none" }, 429), "provider_unavailable", false],
      [json({ error: "RateLimitExceeded", message: "slow down" }, 429), "provider_busy", true],
      [json({ error: "ConcurrencyLimitExceeded", message: "busy" }, 429), "provider_busy", true],
      [json({ error: "InternalServerError", message: "x" }, 500), "provider_busy", true],
      [json({ error: "BadRequest", message: "bad" }, 400), "provider_unavailable", false],
      [new TypeError("fetch failed"), "provider_busy", true],
    ];
    for (const [res, code, retryable] of cases) {
      const { f } = mockFetch(() => (res instanceof Error ? Promise.reject(res) : res.clone()));
      const err = await new FashnAvatarProvider({ apiKey: "k", fetch: f }).start({ faceImage: { bytes: JPEG, mime: "image/jpeg" }, seed: 1 }).catch((e) => e);
      expect(err).toBeInstanceOf(ProviderError);
      expect([err.code, err.retryable]).toEqual([code, retryable]);
      expect(err.detail).not.toContain("Bearer");
    }
  });

  it("maps every documented status", async () => {
    const seq: unknown[] = [
      { id: "j", status: "starting", error: null },
      { id: "j", status: "in_queue", error: null },
      { id: "j", status: "processing", error: null },
      { id: "j", status: "completed", output: [jpegUri], error: null },
      { id: "j", status: "completed", output: { images: [`data:image/png;base64,${bytesToBase64(PNG)}`] }, error: null },
      { id: "j", status: "completed", output: ["<base64>_expired"], error: null },
      { id: "j", status: "failed", error: { name: "ContentModerationError", message: "nope" } },
      { id: "j", status: "failed", error: { name: "ImageLoadError", message: "Error loading model image" } },
      { id: "j", status: "failed", error: { name: "PipelineError", message: "oops" } },
    ];
    let i = 0;
    const { f, calls } = mockFetch(() => json(seq[i++]));
    const p = new FashnAvatarProvider({ apiKey: "k", fetch: f });
    const out: AvatarJobStatus[] = [];
    for (let k = 0; k < seq.length; k++) out.push(await p.status("j"));
    expect(calls[0].url).toBe("https://api.fashn.ai/v1/status/j");
    expect(calls[0].init?.headers).toMatchObject({ Authorization: "Bearer k" });
    expect(out.map((s) => s.phase)).toEqual(["queued", "queued", "running", "completed", "completed", "failed", "failed", "failed", "failed"]);
    expect(out[3].image?.mime).toBe("image/jpeg");
    expect(out[4].image?.mime).toBe("image/png");
    expect(out[5].failure?.code).toBe("timed_out");
    expect(out[6].failure?.code).toBe("content_blocked");
    expect(out[7].failure?.code).toBe("photo_unusable");
    expect(out[8].failure).toMatchObject({ code: "provider_busy", retryable: true });
  });

  it("downloads URL outputs only from FASHN hosts and checks they're images", async () => {
    const { f, calls } = mockFetch((url) => {
      if (url.includes("/v1/status/ok")) return json({ status: "completed", output: ["https://cdn.fashn.ai/x/output_0.jpg"] });
      if (url.includes("/v1/status/evil")) return json({ status: "completed", output: ["https://evil.example/x.jpg"] });
      if (url.includes("/v1/status/html")) return json({ status: "completed", output: ["https://media.fashn.ai/x.jpg"] });
      if (url.startsWith("https://cdn.fashn.ai/")) return new Response(JPEG);
      if (url.startsWith("https://media.fashn.ai/")) return new Response("<html>");
      throw new Error("unexpected " + url);
    });
    const p = new FashnAvatarProvider({ apiKey: "k", fetch: f });
    expect((await p.status("ok")).image?.mime).toBe("image/jpeg");
    expect((await p.status("evil")).failure?.code).toBe("unknown");
    expect(calls.some((c) => c.url.includes("evil.example"))).toBe(false);
    expect((await p.status("html")).failure?.detail).toMatch(/not a JPEG or PNG/);
  });

  it("treats status 404 as a failed job and 429/5xx as transient", async () => {
    const p404 = new FashnAvatarProvider({ apiKey: "k", fetch: mockFetch(() => json({ error: "NotFound" }, 404)).f });
    expect((await p404.status("x")).phase).toBe("failed");
    const p429 = new FashnAvatarProvider({ apiKey: "k", fetch: mockFetch(() => json({ error: "RateLimitExceeded" }, 429)).f });
    await expect(p429.status("x")).rejects.toMatchObject({ code: "provider_busy", retryable: true });
  });

  it("guesses photo problems from model-specific error names", () => {
    expect(mapRuntimeError("NoFaceDetectedError").code).toBe("photo_unusable");
    expect(mapRuntimeError("SomethingNew").code).toBe("unknown");
  });

  it("is only created when the key is configured", () => {
    expect(createAvatarProvider(() => undefined)).toBeNull();
    const p = createAvatarProvider((n) => ({ FASHN_API_KEY: "k" })[n]);
    expect(p?.id).toBe("fashn");
    expect(p?.disclosure.name).toBe("FASHN");
    expect(p?.model).toBe("face-to-model");
  });
});

describe("safeDetail", () => {
  it("never lets image data or tokens into logs", () => {
    const s = safeDetail(`failed ${jpegUri} at https://x.supabase.co/storage/v1/object/sign/a.jpg?token=abc ${"A".repeat(500)} Bearer sk-live-123`);
    expect(s).not.toContain("base64,");
    expect(s).not.toContain("token=abc");
    expect(s).not.toContain("sk-live-123");
    expect(s.length).toBeLessThanOrEqual(201);
  });
});

// ─── workflow ───
class FakeProvider implements AvatarGenerationProvider {
  id = "fake";
  model = "fake-model";
  disclosure = { name: "Fake Images Inc", summary: "Deleted after processing." };
  starts: { seed: number; bytes: number }[] = [];
  next: AvatarJobStatus[] = [];
  startError?: ProviderError;
  statusCalls = 0;
  async start(input: { faceImage: { bytes: Uint8Array }; seed: number }) {
    if (this.startError) throw this.startError;
    this.starts.push({ seed: input.seed, bytes: input.faceImage.bytes.length });
    return { jobId: `job-${this.starts.length}` };
  }
  async status(): Promise<AvatarJobStatus> {
    this.statusCalls++;
    return this.next.length > 1 ? this.next.shift()! : this.next[0] ?? { phase: "queued", rawStatus: "in_queue" };
  }
}

function setup(opts: { photo?: boolean } = {}) {
  let t = new Date("2026-10-05T10:00:00Z").getTime();
  const clock = { now: () => new Date(t), tick: (ms: number) => (t += ms) };
  const repo = new MemoryAvatarRepo(clock.now);
  repo.seedUser(U, opts);
  const provider = new FakeProvider();
  const logs: string[] = [];
  let seed = 100;
  const deps: AvatarDeps = { repo, provider, log: (l, e, f) => logs.push(JSON.stringify({ l, e, ...f })), now: clock.now, randomSeed: () => ++seed, config: DEFAULT_CONFIG };
  return { repo, provider, deps, clock, logs };
}
const done = (mime: "image/jpeg" | "image/png" = "image/jpeg"): AvatarJobStatus => ({ phase: "completed", rawStatus: "completed", image: { bytes: mime === "image/png" ? PNG : JPEG, mime } });
const gen = (r: Awaited<ReturnType<typeof startGeneration>>) => (r.ok && "generation" in r ? r.generation! : null)!;

describe("start", () => {
  it("requires consent, a configured provider, a profile and a face photo", async () => {
    const { deps } = setup();
    expect(await startGeneration(U, {}, deps)).toMatchObject({ ok: false, status: 400, error: { code: "consent_required" } });
    expect(await startGeneration(U, { consent: true }, { ...deps, provider: null })).toMatchObject({ ok: false, status: 503 });
    expect(await startGeneration("someone-else", { consent: true }, deps)).toMatchObject({ ok: false, error: { code: "no_profile" } });
    const noPhoto = setup({ photo: false });
    expect(await startGeneration(U, { consent: true }, noPhoto.deps)).toMatchObject({ ok: false, error: { code: "no_face_photo" } });
  });

  it("records the attempt, sends the stored photo and reports a real stage", async () => {
    const { deps, repo, provider } = setup();
    const v = gen(await startGeneration(U, { consent: true }, deps));
    expect(v.stage).toBe("building");
    expect(provider.starts).toEqual([{ seed: 101, bytes: 6 }]);
    const row = repo.rows[0];
    expect(row).toMatchObject({ provider: "fake", provider_model: "fake-model", generation_status: "processing", provider_job_id: "job-1", seed: 101, approved_by_user: false });
    expect(row.source_image_id).toBe(repo.photos.get(U)!.id);
    expect(JSON.stringify(v)).not.toContain("job-1"); // provider job ids never reach the browser
  });

  it("joins a running generation instead of paying twice", async () => {
    const { deps, provider } = setup();
    const a = gen(await startGeneration(U, { consent: true }, deps));
    const b = gen(await startGeneration(U, { consent: true }, deps));
    expect(b.id).toBe(a.id);
    expect(provider.starts).toHaveLength(1);
  });

  it("enforces the daily limit", async () => {
    const { deps, provider } = setup();
    for (let i = 0; i < DEFAULT_CONFIG.dailyLimit; i++) {
      provider.next = [{ phase: "failed", rawStatus: "failed", failure: { code: "photo_unusable", retryable: false, detail: "x" } }];
      const v = gen(await startGeneration(U, { consent: true }, deps));
      await advance((await deps.repo.find(U, v.id))!, deps, { force: true });
    }
    expect(await startGeneration(U, { consent: true }, deps)).toMatchObject({ ok: false, status: 429, error: { code: "daily_limit", limit: 8 } });
  });

  it("fails cleanly (no raw errors) when the provider rejects the request", async () => {
    const { deps, provider, logs } = setup();
    provider.startError = new ProviderError("provider_unavailable", false, "run HTTP 401 UnauthorizedAccess: Unauthorized: Invalid token", 401);
    const v = gen(await startGeneration(U, { consent: true }, deps));
    expect(v).toMatchObject({ stage: "failed", failure: "provider_unavailable" });
    expect(JSON.stringify(v)).not.toMatch(/Unauthorized|401/);
    expect(logs.some((l) => l.includes('"l":"error"') && l.includes("avatar.failed"))).toBe(true);
  });
});

describe("advance", () => {
  it("walks building → preserving → finalizing → ready and stores the image in the user's folder", async () => {
    const { deps, repo, provider, clock } = setup();
    const v = gen(await startGeneration(U, { consent: true }, deps));
    provider.next = [{ phase: "running", rawStatus: "processing" }];
    clock.tick(5000);
    expect(gen(await getStatus(U, v.id, deps)).stage).toBe("preserving");
    provider.next = [done()];
    clock.tick(5000);
    const r = gen(await getStatus(U, v.id, deps));
    expect(r.stage).toBe("ready");
    expect(r.resultUrl).toBe(`https://signed.example/${U}/avatars/${v.id}.jpg?ttl=600`);
    expect(repo.files.get(`${U}/avatars/${v.id}.jpg`)?.mime).toBe("image/jpeg");
    expect(repo.rows[0]).toMatchObject({ result_mime: "image/jpeg", generated_at: clock.now().toISOString() });
  });

  it("throttles user status checks so polling doesn't hammer the provider", async () => {
    const { deps, provider, clock } = setup();
    const v = gen(await startGeneration(U, { consent: true }, deps));
    await getStatus(U, v.id, deps);
    await getStatus(U, v.id, deps);
    expect(provider.statusCalls).toBe(0);
    clock.tick(DEFAULT_CONFIG.providerCheckEveryMs + 1);
    await getStatus(U, v.id, deps);
    expect(provider.statusCalls).toBe(1);
  });

  it("saves the result once even when two workers see it complete at the same time", async () => {
    const { deps, repo, provider } = setup();
    const v = gen(await startGeneration(U, { consent: true }, deps));
    provider.next = [done()];
    const g = (await repo.find(U, v.id))!;
    await Promise.all([advance(g, deps, { force: true }), advance(g, deps, { force: true })]);
    expect(repo.calls.filter((c) => c.startsWith("save:"))).toHaveLength(1);
    expect(repo.rows[0].generation_status).toBe("ready");
  });

  it("retries a retryable provider failure once, with a new seed, then gives up with guidance", async () => {
    const { deps, repo, provider } = setup();
    const v = gen(await startGeneration(U, { consent: true }, deps));
    provider.next = [{ phase: "failed", rawStatus: "failed", failure: { code: "provider_busy", retryable: true, detail: "PipelineError" } }];
    let g = await advance((await repo.find(U, v.id))!, deps, { force: true });
    expect(g).toMatchObject({ generation_status: "processing", attempts: 2, provider_job_id: "job-2" });
    expect(provider.starts.map((s) => s.seed)).toEqual([101, 102]);
    g = await advance(g, deps, { force: true });
    expect(g).toMatchObject({ generation_status: "failed", failure_code: "provider_busy" });
  });

  it("times out stuck jobs", async () => {
    const { deps, repo, clock } = setup();
    const v = gen(await startGeneration(U, { consent: true }, deps));
    clock.tick(DEFAULT_CONFIG.timeoutMs + 1);
    expect(gen(await getStatus(U, v.id, deps))).toMatchObject({ stage: "failed", failure: "timed_out" });
    expect(repo.rows[0].generation_status).toBe("failed");
  });

  it("still saves a result that finished while nobody was polling, even past the time limit", async () => {
    const { deps, repo, provider, clock } = setup();
    const v = gen(await startGeneration(U, { consent: true }, deps));
    clock.tick(20 * 60_000); // app closed, background task long gone
    provider.next = [done()];
    expect(gen(await getStatus(U, v.id, deps)).stage).toBe("ready");
    expect(repo.files.size).toBe(1);
  });

  it("background polling carries the job to the end", async () => {
    const { deps, repo, provider, clock } = setup();
    const v = gen(await startGeneration(U, { consent: true }, deps));
    const states: AvatarJobStatus[] = [{ phase: "queued", rawStatus: "in_queue" }, { phase: "running", rawStatus: "processing" }, done()];
    provider.next = states;
    await pollUntilSettled(U, v.id, deps, { intervalMs: 2500, maxMs: 60_000, sleep: async (ms) => void clock.tick(ms) });
    expect(repo.rows[0].generation_status).toBe("ready");
  });
});

describe("approve and discard", () => {
  async function readyModel(s: ReturnType<typeof setup>) {
    const v = gen(await startGeneration(U, { consent: true }, s.deps));
    s.provider.next = [done()];
    await advance((await s.repo.find(U, v.id))!, s.deps, { force: true });
    return v.id;
  }

  it("approving makes it the primary avatar and deletes every other generated image", async () => {
    const s = setup();
    const first = await readyModel(s);
    expect(gen(await approve(U, first, s.deps)).approved).toBe(true);
    expect(s.repo.profiles.get(U)!.primaryAvatarId).toBe(first);
    const second = await readyModel(s); // start() keeps the approved one
    expect(s.repo.files.has(`${U}/avatars/${first}.jpg`)).toBe(true);
    await approve(U, second, s.deps);
    expect(s.repo.profiles.get(U)!.primaryAvatarId).toBe(second);
    expect(s.repo.files.has(`${U}/avatars/${first}.jpg`)).toBe(false);
    expect(s.repo.rows.find((r) => r.id === first)).toMatchObject({ generation_status: "discarded", approved_by_user: false, result_path: null });
  });

  it("regenerating removes the unapproved result it replaces", async () => {
    const s = setup();
    const a = await readyModel(s);
    await readyModel(s);
    expect(s.repo.files.has(`${U}/avatars/${a}.jpg`)).toBe(false);
  });

  it("can't approve something that isn't ready", async () => {
    const s = setup();
    const v = gen(await startGeneration(U, { consent: true }, s.deps));
    expect(await approve(U, v.id, s.deps)).toMatchObject({ ok: false, status: 409 });
  });

  it("discarding the primary model clears it; discarding a running job stops it saving", async () => {
    const s = setup();
    const a = await readyModel(s);
    await approve(U, a, s.deps);
    await discard(U, a, s.deps);
    expect(s.repo.profiles.get(U)!.primaryAvatarId).toBeNull();
    expect(s.repo.files.size).toBe(0);

    const v = gen(await startGeneration(U, { consent: true }, s.deps));
    await discard(U, v.id, s.deps);
    s.provider.next = [done()];
    const after = await advance((await s.repo.find(U, v.id))!, s.deps, { force: true });
    expect(after.generation_status).toBe("discarded");
    expect(s.repo.files.size).toBe(0);
  });
});

describe("logging", () => {
  it("never logs image data, provider job ids or tokens through a full run", async () => {
    const s = setup();
    s.provider.startError = undefined;
    const v = gen(await startGeneration(U, { consent: true }, s.deps));
    s.provider.next = [{ phase: "failed", rawStatus: "failed", failure: { code: "provider_busy", retryable: true, detail: `PipelineError ${jpegUri}` } }];
    await advance((await s.repo.find(U, v.id))!, s.deps, { force: true });
    s.provider.next = [done()];
    await advance((await s.repo.find(U, v.id))!, s.deps, { force: true });
    const all = s.logs.join("\n");
    expect(all).not.toContain("base64,");
    expect(all).not.toContain("job-1");
    expect(all).not.toContain(U); // user ids aren't logged; generation ids are truncated
    expect(s.logs.every((l) => l.length < 500)).toBe(true);
  });
});

describe("HTTP handler", () => {
  const post = (body: unknown) => new Request("https://x/functions/v1/digital-model", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
  it("validates input and hides internals", async () => {
    const s = setup();
    const bg: Promise<unknown>[] = [];
    const h = (r: Request) => handleAvatarRequest(r, U, s.deps, (p) => bg.push(p), { intervalMs: 2500, maxMs: 10_000, sleep: async (ms) => void s.clock.tick(ms) });
    expect((await h(new Request("https://x", { method: "GET" }))).status).toBe(405);
    expect((await h(post("{not json"))).status).toBe(400);
    expect((await h(post({ action: "explode" }))).status).toBe(400);
    expect((await h(post({ action: "status", id: "../../etc" }))).status).toBe(400);
    expect((await h(post({ action: "approve" }))).status).toBe(400);
    const info = await (await h(post({ action: "info" }))).json();
    expect(info).toEqual({ info: { available: true, processor: { name: "Fake Images Inc", summary: "Deleted after processing." }, dailyLimit: 8 } });
    const off = await (await handleAvatarRequest(post({ action: "info" }), U, { ...s.deps, provider: null }, () => {})).json();
    expect(off.info).toMatchObject({ available: false, processor: null });
    const start = await h(post({ action: "start", consent: true }));
    expect(start.status).toBe(200);
    expect((await start.json()).generation.stage).toBe("building");
    expect(bg).toHaveLength(1); // background polling scheduled
    await Promise.all(bg);
    expect(start.headers.get("Cache-Control")).toBe("no-store");

    const broken = { ...s.deps, repo: { ...s.repo, findLatest: () => Promise.reject(new Error("relation avatar_generations does not exist at 10.0.0.1")) } } as unknown as AvatarDeps;
    const r = await handleAvatarRequest(post({ action: "status" }), U, broken, () => {});
    expect(r.status).toBe(500);
    expect(JSON.stringify(await r.json())).not.toMatch(/relation|10\.0\.0\.1/);
  });
});
