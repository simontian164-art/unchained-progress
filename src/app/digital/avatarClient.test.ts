import { describe, expect, it } from "vitest";
import { AvatarRequestError, FAILURE_COPY, STAGE_STEPS, SupabaseAvatarClient } from "./avatarClient";
import { modelsFrom } from "./supabaseService";
import { LocalDigitalProfileService, MemoryKV } from "./localService";

// Mimics supabase-js functions.invoke results: { data, error } with FunctionsHttpError.context = Response
function fakeInvoke(result: { data?: unknown; status?: number; body?: unknown; name?: string }) {
  const calls: unknown[] = [];
  const sb = {
    functions: {
      invoke: async (fn: string, opts: { body: unknown }) => {
        calls.push({ fn, body: opts.body });
        if (result.name) {
          const context = result.status ? new Response(JSON.stringify(result.body ?? {}), { status: result.status }) : new Error("network");
          return { data: null, error: { name: result.name, message: "x", context } };
        }
        return { data: result.data, error: null };
      },
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: new SupabaseAvatarClient(sb as any), calls };
}

describe("SupabaseAvatarClient", () => {
  it("calls the digital-model function with the documented actions", async () => {
    const g = { id: "g1", stage: "building", approved: false, createdAt: "t" };
    const { client, calls } = fakeInvoke({ data: { generation: g } });
    await client.info();
    expect(await client.start({ consent: true })).toEqual(g);
    await client.status("g1");
    await client.status();
    await client.approve("g1");
    await client.discard("g1");
    expect(calls).toEqual([
      { fn: "digital-model", body: { action: "info" } },
      { fn: "digital-model", body: { action: "start", consent: true } },
      { fn: "digital-model", body: { action: "status", id: "g1" } },
      { fn: "digital-model", body: { action: "status" } },
      { fn: "digital-model", body: { action: "approve", id: "g1" } },
      { fn: "digital-model", body: { action: "discard", id: "g1" } },
    ]);
  });

  it("turns server errors into friendly, typed errors", async () => {
    const limit = await fakeInvoke({ name: "FunctionsHttpError", status: 429, body: { error: { code: "daily_limit", message: "You've made 8 models today. Try again tomorrow.", limit: 8 } } }).client.start({ consent: true }).catch((e) => e);
    expect(limit).toBeInstanceOf(AvatarRequestError);
    expect([limit.code, limit.limit]).toEqual(["daily_limit", 8]);
    const out = await fakeInvoke({ name: "FunctionsHttpError", status: 401, body: {} }).client.status().catch((e) => e);
    expect(out.code).toBe("signed_out");
    const crash = await fakeInvoke({ name: "FunctionsHttpError", status: 500, body: { nope: true } }).client.status().catch((e) => e);
    expect(crash.code).toBe("unavailable");
    const offline = await fakeInvoke({ name: "FunctionsFetchError" }).client.status().catch((e) => e);
    expect(offline.code).toBe("offline");
    const relay = await fakeInvoke({ name: "FunctionsRelayError" }).client.status().catch((e) => e);
    expect(relay.code).toBe("unavailable");
  });
});

describe("copy", () => {
  it("shows the four statuses in order and has guidance for every failure", () => {
    expect(STAGE_STEPS.map((s) => s.label)).toEqual(["Preparing profile", "Building model", "Preserving identity", "Finalizing"]);
    for (const c of Object.values(FAILURE_COPY)) {
      expect(c.title).not.toMatch(/error|exception|http|fashn/i);
      expect(c.retry || c.changePhoto || c.title).toBeTruthy();
    }
    expect(FAILURE_COPY.photo_unusable.title).toBe("We couldn't build a clean model from this photo.");
  });
});

describe("model in the profile bundle", () => {
  it("reads the approved primary model and any generation still needing the user", () => {
    const rows = [
      { id: "new", generation_status: "processing", approved_by_user: false },
      { id: "old", generation_status: "ready", approved_by_user: true, result_path: "u/avatars/old.jpg", generated_at: "2026-10-05T10:00:00Z", approved_at: "2026-10-05T10:01:00Z", source_image_id: null },
    ];
    expect(modelsFrom(rows, "old")).toEqual({
      model: { id: "old", storagePath: "u/avatars/old.jpg", generatedAt: "2026-10-05T10:00:00Z", approvedAt: "2026-10-05T10:01:00Z", sourceImageId: undefined },
      pendingModel: { id: "new", status: "working" },
    });
    expect(modelsFrom([{ id: "r", generation_status: "ready", approved_by_user: false, result_path: "u/avatars/r.jpg" }], null)).toEqual({ model: undefined, pendingModel: { id: "r", status: "review" } });
    // a pointer to something not approved/ready is ignored
    expect(modelsFrom([{ id: "f", generation_status: "failed", approved_by_user: false }], "f").model).toBeUndefined();
  });

  it("device mode keeps models separately from photos and deletes them with the profile", async () => {
    const kv = new MemoryKV();
    const s = new LocalDigitalProfileService(kv);
    await s.createProfile({ status: "active" });
    await s.putModelBlob("device/avatars/m1.jpg", new Blob(["m"]));
    await s.saveModelRecords([{ id: "m1", status: "ready", approved: true, storagePath: "device/avatars/m1.jpg", createdAt: "t", generatedAt: "t" }]);
    expect((await s.getProfile())!.model?.id).toBe("m1");
    await s.deleteProfile();
    expect(await kv.keys("blobs")).toEqual([]);
    expect(await s.listModelRecords()).toEqual([]);
  });
});
