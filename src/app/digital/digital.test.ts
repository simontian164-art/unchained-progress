import { describe, expect, it } from "vitest";
import { assessBody, assessHead, checkDimensions, checkFile, type Pose } from "./photoCheck";
import { cmToFtIn, formatHeight, formatWeight, inRange, inToCm, lbToKg } from "./units";
import { LocalDigitalProfileService, MemoryKV } from "./localService";
import { SupabaseDigitalProfileService } from "./supabaseService";
import type { PreparedImage } from "./types";

const img = (bytes = 2000): PreparedImage => ({ blob: new Blob([new Uint8Array(bytes)], { type: "image/jpeg" }), mimeType: "image/jpeg", width: 1200, height: 1600, checks: { person: "passed", warnings: [] } });

describe("file and size checks", () => {
  it("accepts photos and rejects other files", () => {
    expect(checkFile({ type: "image/jpeg", size: 2_000_000 })).toBeNull();
    expect(checkFile({ type: "", size: 2_000_000, name: "IMG_1.HEIC" })).toBeNull();
    expect(checkFile({ type: "application/pdf", size: 2_000_000 })).toMatch(/photo/);
    expect(checkFile({ type: "image/png", size: 25 * 1024 * 1024 })).toMatch(/20 MB/);
  });
  it("enforces minimum dimensions and portrait body shots", () => {
    expect(checkDimensions("head_front", 800, 1000)).toBeNull();
    expect(checkDimensions("head_front", 400, 500)).toMatch(/too small/);
    expect(checkDimensions("body_front", 1080, 1920)).toBeNull();
    expect(checkDimensions("body_front", 1920, 1080)).toMatch(/portrait/);
    expect(checkDimensions("body_front", 500, 900)).toMatch(/too small/);
  });
});

describe("people in frame", () => {
  const face = (w: number) => ({ xMin: 100, xMax: 100 + w, yMin: 100, yMax: 100 + w });
  it("front head shot needs exactly one, large enough face", () => {
    expect(assessHead("head_front", [face(400)], 1000).block).toBeUndefined();
    expect(assessHead("head_front", [], 1000).block).toMatch(/couldn't find a face/);
    expect(assessHead("head_front", [face(400), face(300)], 1000).block).toMatch(/More than one face/);
    expect(assessHead("head_front", [face(100)], 1000).block).toMatch(/too small/);
  });
  it("profile shots only block on more than one face", () => {
    expect(assessHead("head_left", [], 1000).block).toBeUndefined();
    expect(assessHead("head_left", [face(300), face(300)], 1000).block).toMatch(/More than one/);
  });

  const person = (top: number, bottom: number, x = 500): Pose => ({
    score: 0.8,
    keypoints: [
      { name: "nose", x, y: top, score: 0.9 }, { name: "left_shoulder", x: x - 80, y: top + 150, score: 0.9 }, { name: "right_shoulder", x: x + 80, y: top + 150, score: 0.9 },
      { name: "left_ankle", x: x - 40, y: bottom, score: 0.8 }, { name: "right_ankle", x: x + 40, y: bottom, score: 0.8 },
    ],
  });
  it("full body needs one person, head to feet, filling at least half the height", () => {
    expect(assessBody("body_front", [person(200, 1750)], 1000, 1900).block).toBeUndefined();
    expect(assessBody("body_front", [person(200, 1750), person(300, 1700, 800)], 1000, 1900).block).toMatch(/More than one person/);
    expect(assessBody("body_front", [], 1000, 1900).block).toMatch(/couldn't find a person/);
    expect(assessBody("body_front", [person(900, 1500)], 1000, 1900).block).toMatch(/too far away/);
    const noFeet = person(200, 1750);
    noFeet.keypoints = noFeet.keypoints.filter((k) => !k.name?.includes("ankle"));
    expect(assessBody("body_front", [noFeet], 1000, 1900).block).toMatch(/feet are cut off/);
    // low-confidence second detection isn't counted as a person
    expect(assessBody("body_front", [person(200, 1750), { score: 0.1, keypoints: [] }], 1000, 1900).block).toBeUndefined();
  });
});

describe("units", () => {
  it("converts and formats", () => {
    expect(cmToFtIn(180)).toEqual({ ft: 5, inch: 11 });
    expect(Math.round(inToCm(71))).toBe(180);
    expect(Math.round(lbToKg(176))).toBe(80);
    expect(formatHeight(180, "imperial")).toBe("5 ft 11 in");
    expect(formatWeight(80, "metric")).toBe("80 kg");
    expect(formatWeight(undefined, "metric")).toBe("Not set");
    expect(inRange("heightCm", 300)).toBe(false);
    expect(inRange("waistCm", undefined)).toBe(true);
  });
});

describe("on-device service", () => {
  it("creates, replaces a photo (old file removed), records measurements, deletes everything", async () => {
    const kv = new MemoryKV();
    const s = new LocalDigitalProfileService(kv);
    expect(await s.getProfile()).toBeNull();
    await s.createProfile({ ageRange: "25-34", goal: "dating", unitSystem: "metric" });
    const a = await s.uploadProfileImage("head_front", img());
    const b = await s.uploadProfileImage("head_front", img(3000));
    expect(await kv.get("blobs", a.storagePath)).toBeUndefined();
    expect(await kv.get("blobs", b.storagePath)).toBeDefined();
    await s.uploadProfileImage("body_front", img());
    await s.recordMeasurements({ heightCm: 180, weightKg: 78 });
    await expect(s.recordMeasurements({ heightCm: 400 })).rejects.toThrow(/range/);
    await s.saveGeneratedLook({ kind: "hair", resultPath: "device/looks/1.jpg", status: "ready" });
    await kv.set("blobs", "device/looks/1.jpg", new Blob(["x"]));
    const bundle = (await s.getProfile())!;
    expect(Object.keys(bundle.images).sort()).toEqual(["body_front", "head_front"]);
    expect(bundle.latest?.heightCm).toBe(180);
    await s.deleteProfileImage("body_front");
    expect((await s.getProfile())!.images.body_front).toBeUndefined();
    await s.deleteProfile();
    expect(await s.getProfile()).toBeNull();
    expect(await kv.keys("blobs")).toEqual([]);
    expect(await s.getSavedLooks()).toEqual([]);
  });
});

describe("account service: delete everything", () => {
  it("removes every file under the user's folder (looks included) before deleting the profile row", async () => {
    const calls: string[] = [];
    const files: Record<string, { name: string; id: string | null }[]> = {
      u1: [{ name: "profile", id: null }, { name: "looks", id: null }],
      "u1/profile": [{ name: "head_front-a.jpg", id: "1" }, { name: "body_front-b.jpg", id: "2" }],
      "u1/looks": [{ name: "look-1.jpg", id: "3" }],
    };
    const storageApi = {
      list: async (prefix: string) => ({ data: files[prefix] ?? [], error: null }),
      remove: async (paths: string[]) => { calls.push(`remove:${paths.sort().join(",")}`); return { data: [], error: null }; },
    };
    const sb = {
      storage: { from: () => storageApi },
      from: (table: string) => ({ delete: () => ({ eq: async (col: string, v: string) => { calls.push(`delete:${table}:${col}=${v}`); return { data: null, error: null }; } }) }),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await new SupabaseDigitalProfileService(sb as any, "u1").deleteProfile();
    expect(calls).toEqual(["remove:u1/looks/look-1.jpg,u1/profile/body_front-b.jpg,u1/profile/head_front-a.jpg", "delete:digital_profiles:user_id=u1"]);
  });

  it("refuses to save a look that points outside the user's folder", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = new SupabaseDigitalProfileService({} as any, "u1");
    await expect(s.saveGeneratedLook({ kind: "hair", resultPath: "u2/looks/x.jpg" })).rejects.toThrow(/own folder/);
  });
});
