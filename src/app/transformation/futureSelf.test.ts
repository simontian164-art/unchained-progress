import { beforeEach, describe, expect, it } from "vitest";
import { loadProjections, saveProjection, type ProjectionRecord } from "./futureSelf";

describe("future-self projection cache", () => {
  beforeEach(() => localStorage.clear());
  it("keeps only the newest projection per stage", () => {
    const base: ProjectionRecord = { stage: 30, settings: { eyebrows: true, haircut: "clean", skin: true, weightDeltaKg: 0 }, image: "data:image/png;base64,a", generatedAt: "a" };
    saveProjection(base);
    saveProjection({ ...base, image: "data:image/png;base64,b", generatedAt: "b" });
    expect(loadProjections()).toEqual([{ ...base, image: "data:image/png;base64,b", generatedAt: "b" }]);
  });
});
