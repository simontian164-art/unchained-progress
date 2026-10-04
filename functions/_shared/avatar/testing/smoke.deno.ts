// End-to-end smoke test in the real Deno runtime (the Edge Function runtime), against a local mock of
// the FASHN API that follows the documented lifecycle. No network, no keys, no Supabase needed.
//   deno run --allow-net=127.0.0.1 supabase/functions/_shared/avatar/testing/smoke.deno.ts
import { FashnAvatarProvider } from "../fashn.ts";
import { handleAvatarRequest } from "../handler.ts";
import { type AvatarDeps, DEFAULT_CONFIG } from "../service.ts";
import { MemoryAvatarRepo } from "./memoryRepo.ts";

const JPEG_B64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
const USER = "11111111-1111-4111-8111-111111111111";
let polls = 0;
const seen: { path: string; auth: string | null; body?: Record<string, unknown> }[] = [];

const server = Deno.serve({ port: 0, hostname: "127.0.0.1", onListen: () => {} }, async (req) => {
  const url = new URL(req.url);
  const entry: { path: string; auth: string | null; body?: Record<string, unknown> } = { path: url.pathname, auth: req.headers.get("authorization") };
  seen.push(entry);
  if (req.headers.get("authorization") !== "Bearer test-key") return Response.json({ error: "UnauthorizedAccess", message: "Unauthorized: Invalid token" }, { status: 401 });
  if (req.method === "POST" && url.pathname === "/v1/run") {
    entry.body = await req.json();
    return Response.json({ id: "123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1", error: null });
  }
  if (url.pathname.startsWith("/v1/status/")) {
    const status = ["starting", "in_queue", "processing", "processing"][polls++] ?? "completed";
    return Response.json(status === "completed" ? { id: "x", status, output: { images: [`data:image/jpeg;base64,${JPEG_B64}`] }, error: null } : { id: "x", status, error: null });
  }
  return Response.json({ error: "NotFound" }, { status: 404 });
});

const repo = new MemoryAvatarRepo();
repo.seedUser(USER);
const lines: string[] = [];
const deps: AvatarDeps = {
  repo,
  provider: new FashnAvatarProvider({ apiKey: "test-key", baseUrl: `http://127.0.0.1:${server.addr.port}` }),
  log: (level, event, fields) => lines.push(JSON.stringify({ level, event, ...fields })),
  now: () => new Date(),
  randomSeed: () => 777,
  config: { ...DEFAULT_CONFIG, providerCheckEveryMs: 0 },
};
const call = async (body: unknown) => {
  const bg: Promise<unknown>[] = [];
  const res = await handleAvatarRequest(new Request("http://fn/digital-model", { method: "POST", body: JSON.stringify(body) }), USER, deps, (p) => bg.push(p), { intervalMs: 50, maxMs: 5_000, sleep: (ms) => new Promise((r) => setTimeout(r, ms)) });
  return { status: res.status, body: await res.json(), bg };
};

const assert = (ok: unknown, msg: string) => {
  if (!ok) {
    console.error("FAIL:", msg);
    Deno.exit(1);
  }
  console.log("ok  ", msg);
};

const started = await call({ action: "start", consent: true });
assert(started.status === 200 && started.body.generation.stage === "building", "start → building");
const run = seen.find((s) => s.path === "/v1/run")!;
assert(run.auth === "Bearer test-key", "Authorization: Bearer <key>");
const inputs = run.body!.inputs as Record<string, unknown>;
assert(run.body!.model_name === "face-to-model" && String(inputs.face_image).startsWith("data:image/jpeg;base64,") && inputs.seed === 777 && inputs.return_base64 === true, "run payload matches the docs");
await Promise.all(started.bg); // background polling (what EdgeRuntime.waitUntil keeps alive)
const status = await call({ action: "status" });
assert(status.body.generation.stage === "ready" && status.body.generation.resultUrl, "background poll → ready, signed URL returned");
const gen = repo.rows[0];
assert(repo.files.get(`${USER}/avatars/${gen.id}.jpg`)?.mime === "image/jpeg", "result stored at <user>/avatars/<id>.jpg");
const approved = await call({ action: "approve", id: gen.id });
assert(approved.body.generation.approved === true && repo.profiles.get(USER)!.primaryAvatarId === gen.id, "approve → primary_avatar set");
assert(!lines.join("").includes("base64,") && !lines.join("").includes("test-key"), "logs carry no image data or key");
console.log(`\nlogs:\n${lines.join("\n")}`);
await server.shutdown();
