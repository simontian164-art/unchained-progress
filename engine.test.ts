import { describe, expect, it } from "vitest";
import { classifyShape, checkPhoto, geometryCues, measure, pixelStats, LM, type Pt } from "./face";
import { analyze, haircutOptions, beardPlan, buildShop } from "./analyze";
import { len, localPrice, mapsUrl, shoppingUrl, withPrefs } from "./local";
import type { Profile } from "../types";

export const baseProfile: Profile = {
  goal: "work", age: "25-34", presentation: "masculine", country: "CA", area: "M5V", maintenance: "low", proOpen: "yes", worry: "rarely",
  skinType: "oily", skinConcerns: ["breakouts", "dark-spots"], sensitive: false, routine: "none", usesSpf: false, sunReaction: "sometimes", allergies: [],
  hairType: "straight", hairDensity: "medium", hairLength: "short", hairConcerns: [], hairlineShape: "straight", hairlineChange: "no", lastCut: "8w-plus", sides: "tight",
  facialHair: "full", beardPref: "open", brows: ["unruly"], glasses: true, teeth: ["staining"], floss: "sometimes",
  vibe: "clean-casual", budget: "low", fitIssues: ["tops-loose"], contrast: "medium", undertone: "warm", build: "average", height: "average",
  training: "1-2", bodyGoal: "posture", sleep: "6-7",
  natural: "mix", fragranceFree: false, vegan: false, crueltyFree: false, shopping: "both",
};
const run = (over: Partial<Profile> = {}, shape: Parameters<typeof analyze>[0]["faceShape"] = "round") =>
  analyze({ profile: { ...baseProfile, ...over }, faceShape: shape, faceShapeSource: "measured", photoChecks: [], photoSlots: ["front"], now: new Date("2026-09-29T12:00:00Z") });

describe("face geometry", () => {
  it("classifies each prototype", () => {
    const cases: [number[], string][] = [
      [[1.5, 0.88, 0.85, 0.66], "oblong"], [[1.16, 0.88, 0.85, 0.7], "round"], [[1.2, 0.9, 0.93, 0.74], "square"],
      [[1.3, 0.93, 0.74, 0.54], "heart"], [[1.32, 0.77, 0.76, 0.58], "diamond"], [[1.32, 0.86, 0.8, 0.62], "oval"],
    ];
    for (const [v, s] of cases) expect(classifyShape({ lengthToWidth: v[0], foreheadToCheek: v[1], jawToCheek: v[2], chinTaper: v[3] }).shape).toBe(s);
  });
  const k: Pt[] = Array.from({ length: 468 }, () => ({ x: 0, y: 0 }));
  const set = (i: number, x: number, y: number) => (k[i] = { x, y });
  set(LM.cheekL, 100, 200); set(LM.cheekR, 300, 200); set(LM.top, 200, 60); set(LM.chin, 200, 324);
  set(LM.foreheadL, 114, 120); set(LM.foreheadR, 286, 120); set(LM.jawL, 120, 280); set(LM.jawR, 280, 280);
  set(LM.chinL, 150, 305); set(LM.chinR, 250, 305); set(LM.eyeL, 150, 170); set(LM.eyeR, 250, 170); set(LM.nose, 200, 220);
  set(LM.glabella, 200, 150); set(LM.subnasale, 200, 235); set(LM.browL, 150, 140); set(LM.browR, 250, 146);
  set(LM.lidL, 150, 165); set(LM.lidR, 250, 165); set(LM.lipTop, 200, 270); set(LM.lipBottom, 200, 272);
  it("measures ratios and cues", () => {
    expect(measure(k)!.lengthToWidth).toBeCloseTo(1.32, 2);
    const c = geometryCues(k);
    expect(c.lowerToMid).toBeCloseTo(89 / 85, 2);
    expect(c.browDiff).toBeCloseTo(0.06, 2);
    expect(c.mouthOpen).toBe(false);
  });
  it("flags low resolution, dark, blurry photos with tips", () => {
    const checks = checkPhoto({ keypoints: null, imageWidth: 320, imageHeight: 400, meanLuma: 30, sharpness: 5 });
    expect(checks.filter((c) => !c.ok).map((c) => c.id)).toEqual(["resolution", "face", "light", "sharp"]);
    expect(checks.every((c) => c.ok || c.tip)).toBe(true);
  });
  it("pixelStats on a flat image", () => {
    const s = pixelStats(new Uint8ClampedArray(400).fill(128), 10, 10);
    expect(s.sharpness).toBeCloseTo(0, 5);
  });
});

describe("haircut engine", () => {
  it("returns best / low-maintenance / shorter / longer / careful with reasons and a barber spec", () => {
    const opts = haircutOptions(baseProfile, "round");
    expect(opts[0].slot).toBe("best");
    expect(new Set(opts.map((o) => o.id)).size).toBe(opts.length);
    for (const o of opts) {
      expect(o.why.length).toBeGreaterThan(0);
      expect(o.spec.top).toMatch(/cm/);
    }
    expect(opts.find((o) => o.slot === "careful")).toBeTruthy();
  });
  it("respects texture and presentation", () => {
    const coily = haircutOptions({ ...baseProfile, hairType: "coily" }, "oval");
    expect(coily[0].id).toMatch(/coily|curly|crew|buzz/);
    const fem = haircutOptions({ ...baseProfile, presentation: "feminine", hairLength: "long" }, "square");
    expect(["long-layers", "lob"]).toContain(fem[0].id);
  });
  it("prefers hairline-friendly cuts when the user reports recession, and softens the temples", () => {
    const opts = haircutOptions({ ...baseProfile, hairlineChange: "yes" }, "oval");
    expect(["crop", "crew", "buzz", "curly-taper"]).toContain(opts[0].id);
    expect(opts[0].spec.temples).toMatch(/soft/i);
  });
  it("uses inches first in the US", () => {
    expect(haircutOptions({ ...baseProfile, country: "US" }, "oval")[0].spec.top).toMatch(/^\d.* in/);
  });
});

describe("beard engine", () => {
  it("never recommends full-growth styles as best for patchy growth", () => {
    const b = beardPlan({ ...baseProfile, facialHair: "patchy" }, "oval")!;
    expect(["light-stubble", "heavy-stubble", "clean"]).toContain(b.options[0].id);
    expect(b.options.find((o) => o.id === "full")!.fit).toBe("careful");
  });
  it("respects a clean-shaven preference and skips when not applicable", () => {
    expect(beardPlan({ ...baseProfile, beardPref: "clean" }, "oval")!.options[0].id).toBe("clean");
    expect(beardPlan({ ...baseProfile, facialHair: "not-applicable" }, "oval")).toBeUndefined();
  });
});

describe("full analysis", () => {
  const { analysis, tasks } = run();
  it("has modules with statuses, what's working, and no numeric scores", () => {
    expect(analysis.modules.map((m) => m.id)).toEqual(["face", "hair", "beard", "skin", "eyes", "smile", "style", "body"]);
    expect(analysis.working.length).toBeGreaterThan(0);
    const text = JSON.stringify(analysis).toLowerCase();
    for (const w of [/attractiveness score:/, /\bscore:/, /\brating:/, /\d(\.\d)? ?\/ ?10/, /ugly/, /\/10\b/, /\bflaw/, /defect/, /golden ratio/, /canthal/, /hunter eyes/, /mewing/]) expect(text).not.toMatch(w);
  });
  it("picks a top 3 from different areas and caps today at 3", () => {
    expect(analysis.top3).toHaveLength(3);
    const mods = analysis.top3.map((id) => analysis.recs.find((r) => r.id === id)!.module);
    expect(new Set(mods).size).toBe(3);
    expect(tasks.filter((t) => t.horizon === "today").length).toBeLessThanOrEqual(3);
  });
  it("tags every rec with type, impact, effort, cost and timeframe", () => {
    for (const r of analysis.recs) {
      expect(["home", "lifestyle", "product", "barber", "professional"]).toContain(r.kind);
      expect(["low", "medium", "high"]).toContain(r.impact);
      expect(["free", "$", "$$", "$$$"]).toContain(r.cost);
    }
  });
  it("routine: sunscreen every morning, only one active, allergy-aware", () => {
    expect(analysis.routine.am.some((s) => s.id === "am-spf")).toBe(true);
    const actives = [...analysis.routine.am, ...analysis.routine.pm].filter((s) => s.id.endsWith("-active"));
    expect(actives).toHaveLength(1);
    // breakouts + dark marks → one product that covers both
    expect(actives[0].shopId).toBe("azelaic");
    const oilyBreakouts = run({ skinConcerns: ["breakouts"] }).analysis;
    expect([...oilyBreakouts.routine.am, ...oilyBreakouts.routine.pm].find((s) => s.id.endsWith("-active"))!.shopId).toBe("bha");
    const noSal = run({ skinConcerns: ["breakouts"], allergies: ["salicylates"] }).analysis;
    expect([...noSal.routine.am, ...noSal.routine.pm].find((s) => s.id.endsWith("-active"))!.shopId).toBe("azelaic");
  });
  it("always includes the mole/skin-check referral and hair-loss referral wording when reported", () => {
    expect(analysis.pros.some((p) => /mole/.test(p.when))).toBe(true);
    const hl = run({ hairlineChange: "yes" }).analysis;
    expect(hl.pros.some((p) => p.who === "hair-loss")).toBe(true);
    expect(JSON.stringify(hl)).not.toMatch(/alopecia|male-pattern|minoxidil|finasteride/i);
  });
  it("adds a supportive note and therapist option when worries are frequent", () => {
    const w = run({ worry: "often" }).analysis;
    expect(w.wellbeing).toBeTruthy();
    expect(w.pros.some((p) => p.who === "therapist")).toBe(true);
  });
  it("is deterministic", () => {
    expect(run().analysis).toEqual(analysis);
  });
});

describe("shop + localization", () => {
  const p = { ...baseProfile, fragranceFree: true, vegan: true };
  const items = buildShop(p, ["sunscreen", "bha", "trimmer", "capsule"]);
  it("groups, localizes price estimates and adds preference flags without claims", () => {
    expect(items[0].group).toBe("essentials");
    const s = items.find((i) => i.id === "sunscreen")!;
    expect(s.price[0]).toBeGreaterThan(10); // CAD estimate
    expect(s.flags).toContain("Choose fragrance-free");
    expect(s.flags.join(" ")).toMatch(/Check the pack for vegan/);
    expect(s.onlineQuery).toMatch(/fragrance free vegan/);
  });
  it("builds map and shopping links without fabricated data", () => {
    expect(mapsUrl("pharmacy", { area: "M5V" })).toContain("pharmacy%20near%20M5V");
    expect(mapsUrl("barber shop", {}, { lat: 43.65, lng: -79.38 })).toContain("@43.650,-79.380");
    expect(shoppingUrl("sunscreen", "CA")).toContain("gl=ca");
    expect(withPrefs("x", { ...baseProfile, crueltyFree: true })).toBe("x cruelty free");
    expect(len(5, "CA")).toBe("5 cm (2 in)");
    expect(localPrice([10, 20], "US")).toEqual([10, 20]);
  });
});

import { BALANCE, NICHES, POSTURE, SEEN_ON, inspoQuery, pinterestUrl } from "./kb/guides";
describe("guides", () => {
  it("uses no scoring or pseudoscience language", () => {
    const text = JSON.stringify({ BALANCE, POSTURE, NICHES }).toLowerCase();
    for (const w of [/\bscore/, /\brating/, /\/10\b/, /ugly/, /\bflaw(?!\s+in the photo)/, /defect/, /golden ratio/, /canthal/, /hunter eyes/, /mewing/, /better[- ]looking/]) expect(text).not.toMatch(w);
  });
  it("builds inspiration searches from style, presentation and optional filter", () => {
    const om = NICHES.find((n) => n.id === "old-money")!;
    expect(inspoQuery(om, "masculine", "black")).toBe("old money outfit black men");
    expect(inspoQuery(om, "feminine", "any")).toBe("old money outfit women");
    expect(inspoQuery(om, "neutral", "south-asian")).toBe("old money outfit indian");
    expect(pinterestUrl("a b")).toBe("https://www.pinterest.com/search/pins/?q=a%20b");
    expect(SEEN_ON[0].id).toBe("any");
  });
  it("has formulas for both presentations in every niche", () => {
    for (const n of NICHES) {
      expect(n.formulas.masculine.length).toBeGreaterThan(0);
      expect(n.formulas.feminine.length).toBeGreaterThan(0);
      for (const f of [...n.formulas.masculine, ...n.formulas.feminine]) expect(f.colors.every((c) => /^#[0-9a-f]{6}$/.test(c.hex))).toBe(true);
    }
  });
});
