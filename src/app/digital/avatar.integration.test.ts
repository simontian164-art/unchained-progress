// @vitest-environment node
// Browser client ↔ Edge Function handler ↔ FASHN adapter, wired together with the real supabase-js
// client (its functions.invoke and error classes). Only the network is replaced: supabase-js's fetch is
// routed to the function handler in-process, and the handler's fetch to a mock of the FASHN API that
// follows the documented request/response shapes.
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { AvatarRequestError, SupabaseAvatarClient } from "./avatarClient";
import { handleAvatarRequest } from "../../../supabase/functions/_shared/avatar/handler.ts";
import { FashnAvatarProvider } from "../../../supabase/functions/_shared/avatar/fashn.ts";
import { DEFAULT_CONFIG, type AvatarDeps } from "../../../supabase/functions/_shared/avatar/service.ts";
import { MemoryAvatarRepo } from "../../../supabase/functions/_shared/avatar/testing/memoryRepo.ts";

const USER = "11111111-1111-4111-8111-111111111111";
const JPEG_URI = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==";

function world(opts: { dailyLimit?: number; brokenRepo?: boolean } = {}) {
  const fashnCalls: { url: string; auth: string | null; body?: unknown }[] = [];
  const statuses = ["in_queue", "processing", "completed"];
  const fashnFetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    const auth = new Headers(init?.headers).get("authorization");
    fashnCalls.push({ url: u, auth, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (u.endsWith("/v1/run")) return Response.json({ id: "pred-1", error: null });
    const s = statuses.shift() ?? "completed";
    return Response.json(s === "completed" ? { id: "pred-1", status: s, output: [JPEG_URI], error: null } : { id: "pred-1", status: s, error: null });
  }) as typeof fetch;

  const repo = new MemoryAvatarRepo();
  repo.seedUser(USER);
  if (opts.brokenRepo) repo.findLatest = () => Promise.reject(new Error("permission denied for table avatar_generations"));
  const deps: AvatarDeps = {
    repo,
    provider: new FashnAvatarProvider({ apiKey: "fashn-secret", fetch: fashnFetch }),
    log: () => {},
    now: () => new Date(),
    randomSeed: () => 4242,
    config: { ...DEFAULT_CONFIG, providerCheckEveryMs: 0, dailyLimit: opts.dailyLimit ?? DEFAULT_CONFIG.dailyLimit },
  };

  // the browser's supabase-js client, whose network goes to our function handler
  const sb = createClient("https://project.supabase.test", "sb_publishable_test", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (async (url: string | URL | Request, init?: RequestInit) => {
        const u = new URL(String(url));
        if (u.pathname !== "/functions/v1/digital-model") return new Response("not found", { status: 404 });
        return handleAvatarRequest(new Request(u, init), USER, deps, () => {});
      }) as typeof fetch,
    },
  });
  return { client: new SupabaseAvatarClient(sb), repo, fashnCalls };
}

describe("digital model end to end (client → function → FASHN adapter)", () => {
  it("runs the whole flow with the documented payloads", async () => {
    const { client, repo, fashnCalls } = world();
    expect(await client.info()).toEqual({ available: true, processor: { name: "FASHN", summary: expect.any(String) }, dailyLimit: 8 });

    const started = await client.start({ consent: true });
    expect(started.stage).toBe("building");
    const run = fashnCalls.find((c) => c.url === "https://api.fashn.ai/v1/run")!;
    expect(run.auth).toBe("Bearer fashn-secret");
    expect(run.body).toMatchObject({ model_name: "face-to-model", inputs: { seed: 4242, return_base64: true, output_format: "jpeg" } });

    const seen: string[] = [];
    let g = started;
    for (let i = 0; i < 5 && g.stage !== "ready"; i++) {
      g = (await client.status(g.id))!;
      seen.push(g.stage);
    }
    expect(seen).toEqual(["building", "preserving", "ready"]);
    expect(fashnCalls.filter((c) => c.url === "https://api.fashn.ai/v1/status/pred-1")).toHaveLength(3);
    expect(g.resultUrl).toContain(`${USER}/avatars/${g.id}.jpg`);
    expect(JSON.stringify(g)).not.toContain("pred-1");

    const approved = await client.approve(g.id);
    expect(approved.approved).toBe(true);
    expect(repo.profiles.get(USER)!.primaryAvatarId).toBe(g.id);
    await client.discard(g.id);
    expect(repo.profiles.get(USER)!.primaryAvatarId).toBeNull();
    expect(repo.files.size).toBe(0);
  });

  it("surfaces limits and server failures as friendly, typed errors", async () => {
    const limited = world({ dailyLimit: 1 });
    const g = await limited.client.start({ consent: true });
    await limited.client.discard(g.id);
    const err = await limited.client.start({ consent: true }).catch((e) => e);
    expect(err).toBeInstanceOf(AvatarRequestError);
    expect([err.code, err.limit]).toEqual(["daily_limit", 1]);

    const noConsent = await limited.client.start({ consent: false as unknown as true }).catch((e) => e);
    expect(noConsent.code).toBe("consent_required");

    const broken = await world({ brokenRepo: true }).client.status().catch((e) => e);
    expect(broken.code).toBe("unavailable");
    expect(broken.message).not.toMatch(/permission|avatar_generations/);
  });
});
