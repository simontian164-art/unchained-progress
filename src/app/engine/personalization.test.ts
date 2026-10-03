/**
 * Personalization depth: very different people must get meaningfully different plans, and each
 * answer we collect must change something. If a test here fails, the app is collecting answers
 * it doesn't use.
 */
import { describe, expect, it } from "vitest";
import { analyze, hairlinePlan, beardPlan, haircutOptions } from "./analyze";
import { baseProfile } from "./engine.test";
import type { Analysis, Feedback, Profile } from "../types";

const run = (over: Partial<Profile>, extra: { feedback?: Record<string, Feedback>; cues?: Analysis["cues"] } = {}) =>
  analyze({ profile: { ...baseProfile, ...over }, faceShape: "oval", faceShapeSource: "measured", photoChecks: [], photoSlots: ["front"], now: new Date("2026-09-30T12:00:00Z"), ...extra }).analysis;

export const PROFILES: Record<string, Partial<Profile>> = {
  // Straight dense hair, stable hairline, dry sensitive skin, clean shaven, quiet luxury, $200
  A: { hairType: "straight", hairDensity: "thick", hairLength: "short", hairlineShape: "straight", hairlineChange: "no", hairConcerns: [], skinType: "dry", sensitive: true, skinConcerns: ["dryness"], facialHair: "none", beardPref: "clean", vibe: "classic", budget: "high", dressCode: "smart", bodyGoal: "maintain", training: "3-4", cutHappy: "mostly", lastCut: "4-8w", fitIssues: [], usesSpf: true, routine: "basic", brows: [], teeth: [], glasses: false },
  // Curly hair, changing temples, oily skin, full beard, streetwear, $50, natural preference
  B: { hairType: "curly", hairDensity: "medium", hairLength: "medium", hairlineShape: "m-shape", hairlineChange: "yes", hairlineSince: "1-3y", familyHistory: "yes", hairConcerns: [], skinType: "oily", sensitive: false, skinConcerns: ["breakouts"], facialHair: "full", beardPref: "beard", vibe: "street", budget: "low", natural: "prefer", shopping: "online", usesSpf: false, routine: "none", cutHappy: "no", goal: "dating", bodyGoal: "build", brows: [], teeth: [], glasses: false },
  // Coily hair, no hairline change, razor bumps, short beard/stubble, athletic, fragrance-free, cruelty-free
  C: { hairType: "coily", hairDensity: "thick", hairLength: "short", hairlineShape: "straight", hairlineChange: "no", hairConcerns: [], skinType: "normal", sensitive: false, skinConcerns: ["razor-bumps"], facialHair: "full", beardPref: "stubble", vibe: "athletic", budget: "mid", fragranceFree: true, crueltyFree: true, shopping: "local", sunReaction: "rarely", usesSpf: false, goal: "confidence", bodyGoal: "leaner", training: "3-4", brows: [], teeth: [], glasses: false },
  // Long hair, sensitive scalp, no facial hair, minimal, very low maintenance
  D: { hairType: "straight", hairDensity: "fine", hairLength: "long", hairlineShape: "unsure", hairlineChange: "no", hairConcerns: ["dandruff", "sensitive-scalp"], skinType: "normal", sensitive: true, skinConcerns: [], facialHair: "not-applicable", vibe: "minimal", budget: "mid", maintenance: "low", presentation: "neutral", goal: "overall", routine: "none", usesSpf: false, brows: [], teeth: [], floss: "daily", fitIssues: [], bodyGoal: "skip", glasses: false },
};

describe("four very different people get different plans", () => {
  const plans = Object.fromEntries(Object.entries(PROFILES).map(([k, v]) => [k, run(v)]));
  // Compare what the person actually reads (titles), not internal ids: two people can both get a
  // "haircut" rec, but not the same haircut.
  const recSet = (a: Analysis) => new Set(a.recs.map((r) => r.title));
  const jaccard = (x: Set<string>, y: Set<string>) => [...x].filter((i) => y.has(i)).length / new Set([...x, ...y]).size;

  it("best haircuts differ", () => {
    const best = Object.values(plans).map((a) => a.haircuts[0]?.id);
    expect(new Set(best).size).toBe(4);
  });
  it("what each person reads overlaps far less than generic advice would", () => {
    const keys = Object.keys(plans);
    for (const a of keys) for (const b of keys) if (a < b) expect(jaccard(recSet(plans[a]), recSet(plans[b]))).toBeLessThan(0.6);
  });
  it("top 3s differ", () => {
    const tops = Object.values(plans).map((a) => a.top3.map((id) => a.recs.find((r) => r.id === id)!.title).join("|"));
    expect(new Set(tops).size).toBe(4);
  });
  it("skin routines react to the combination of type and concerns", () => {
    const act = (a: Analysis) => [...a.routine.am, ...a.routine.pm].find((s) => s.id.endsWith("-active"))?.shopId;
    expect(act(plans.A)).toBe("hyaluronic"); // dry, sensitive, dryness
    expect(act(plans.B)).toBe("bha"); // oily breakouts
    expect(act(plans.C)).toBe("bha"); // razor bumps on normal skin
    expect(act(plans.D)).toBeUndefined(); // no concerns → no active
    expect(plans.A.routine.am[0].label).toMatch(/Rinse/); // dry skin: water in the morning
  });
  it("A (already clean-shaven, fits, trains) is told to keep things, not change them", () => {
    const keep = plans.A.keep!.map((k) => k.id);
    expect(keep).toEqual(expect.arrayContaining(["keep-shave", "keep-spf", "keep-fit", "keep-training"]));
    expect(plans.A.recs.some((r) => r.id === "beard-shape")).toBe(false);
  });
  it("B (changing temples over years, family history) gets track + professional, and hairline-friendly cuts", () => {
    expect(plans.B.hairline!.approach).toEqual(expect.arrayContaining(["track", "pro"]));
    expect(plans.B.recs.some((r) => r.id === "hair-track")).toBe(true);
    expect(plans.B.pros.find((p) => p.who === "hair-loss")!.bring!.join(" ")).toMatch(/1–3 years/);
    expect(plans.B.haircuts[0].spec.temples).toMatch(/natural temple line/i);
  });
  it("C gets fragrance-free and cruelty-free label checks, and stubble for razor bumps", () => {
    const skin = plans.C.shop.filter((s) => s.moduleId === "skin");
    expect(skin.every((s) => s.flags.includes("Choose fragrance-free"))).toBe(true);
    expect(skin.every((s) => s.flags.some((f) => /cruelty-free/.test(f)))).toBe(true);
    expect(plans.C.beard!.options[0].id).toMatch(/stubble/);
  });
  it("D (low upkeep, sensitive scalp, dandruff) gets a gentle scalp plan and a short list", () => {
    const scalp = plans.D.recs.find((r) => r.id === "hair-scalp")!;
    expect(scalp.detail).toMatch(/sensitive/);
    expect(plans.D.beard).toBeUndefined();
    expect(plans.D.recs.length).toBeLessThan(plans.B.recs.length);
    expect(plans.D.haircuts[0].why.join(" ")).toMatch(/fine hair/i);
  });
});

describe("answers that must change the plan", () => {
  it("already-owned active: no second active; conflicts explained", () => {
    const a = run({ owned: ["retinoid", "exfoliating-acid"] });
    const actives = [...a.routine.am, ...a.routine.pm].filter((s) => s.id.endsWith("-active"));
    expect(actives).toHaveLength(1);
    expect(actives[0].label).toMatch(/current/);
    expect(a.recs.find((r) => r.id === "skin-keep-active")!.steps.join(" ")).toMatch(/different nights/);
    expect(a.recs.some((r) => r.id === "skin-active")).toBe(false);
  });
  it("owned basics are marked owned in the shop and not re-bought", () => {
    const a = run({ owned: ["sunscreen", "cleanser"], usesSpf: false });
    expect(a.shop.find((s) => s.id === "sunscreen")).toBeUndefined();
    expect(a.keep!.some((k) => k.id === "keep-spf")).toBe(true);
  });
  it("happy with a recent cut → keep it; happy but grown out → trim, not a new cut", () => {
    const keep = run({ cutHappy: "yes", lastCut: "under-4w" });
    expect(keep.recs.some((r) => r.id.startsWith("hair-cut") || r.id === "hair-trim")).toBe(false);
    expect(keep.keep!.some((k) => k.id === "keep-cut")).toBe(true);
    const trim = run({ cutHappy: "yes", lastCut: "8w-plus" });
    expect(trim.recs.some((r) => r.id === "hair-trim")).toBe(true);
    expect(trim.recs.some((r) => r.id === "hair-cut")).toBe(false);
  });
  it("dry or sensitive skin with breakouts gets azelaic acid, not salicylic", () => {
    const a = run({ skinType: "dry", skinConcerns: ["breakouts"] });
    expect([...a.routine.am, ...a.routine.pm].find((s) => s.id.endsWith("-active"))!.shopId).toBe("azelaic");
  });
  it("oily + sensitive gets a gel cleanser and a light moisturizer", () => {
    const a = run({ skinType: "oily", sensitive: true });
    expect(a.routine.pm[0].shopId).toBe("cleanser-gel");
    expect(a.routine.am.find((s) => s.id === "am-moist")!.shopId).toBe("moist-light");
  });
  it("low upkeep changes the beard and haircut", () => {
    const open = beardPlan({ ...baseProfile, facialHair: "full", beardPref: "open", maintenance: "high" }, "oval")!;
    const low = beardPlan({ ...baseProfile, facialHair: "full", beardPref: "open", maintenance: "low" }, "oval")!;
    expect(low.options[0].id).not.toBe("full");
    expect(low.maintenance[0]).toMatch(/Once a week/);
    expect(open.maintenance[0]).not.toMatch(/Once a week/);
    const cutLow = haircutOptions({ ...baseProfile, maintenance: "low", hairLength: "medium" }, "oval")[0];
    const cutHigh = haircutOptions({ ...baseProfile, maintenance: "high", hairLength: "medium" }, "oval")[0];
    expect(cutLow.id === cutHigh.id && cutLow.maintenance === cutHigh.maintenance).toBe(false);
  });
  it("style identity and dress code change the haircut", () => {
    const street = haircutOptions({ ...baseProfile, vibe: "street", dressCode: "casual", hairLength: "medium" }, "oval")[0].id;
    const formal = haircutOptions({ ...baseProfile, vibe: "smart", dressCode: "formal", hairLength: "medium" }, "oval")[0].id;
    expect(street).not.toBe(formal);
  });
  it("photo dislike leads with photo basics and a 'you may not need to change this' note", () => {
    const a = run({ photoDislike: true });
    expect(a.recs.some((r) => r.id === "face-photos")).toBe(true);
    expect(a.keep!.some((k) => k.id === "keep-features")).toBe(true);
  });
  it("frames consider prescription, style and fit checks", () => {
    const a = run({ glasses: true, glassesRx: "strong", vibe: "street" });
    const steps = a.recs.find((r) => r.id === "eyes-frames")!.steps.join(" ");
    expect(steps).toMatch(/high-index/);
    expect(steps).toMatch(/bridge/);
    expect(steps).toMatch(/acetate/);
  });
});

describe("hairline approach (never a diagnosis)", () => {
  const plan = (o: Partial<Profile>) => hairlinePlan({ ...baseProfile, hairConcerns: [], ...o });
  it("recent change + shedding → professional", () => expect(plan({ hairlineChange: "yes", hairlineSince: "<6m", shedding: "yes" })!.approach).toContain("pro"));
  it("tight styles → change hair care", () => expect(plan({ hairlineChange: "no", hairHabits: ["tight-styles"] })!.approach).toContain("care"));
  it("stable M-shape → style around it", () => expect(plan({ hairlineChange: "no", hairlineShape: "m-shape" })!.approach).toEqual(["style"]));
  it("unsure → track", () => expect(plan({ hairlineChange: "unsure", hairlineShape: "straight" })!.approach).toEqual(["track"]));
  it("stable straight hairline → nothing to do", () => expect(plan({ hairlineChange: "no", hairlineShape: "straight" })).toBeUndefined());
  it("uses no diagnostic language", () => {
    const text = JSON.stringify([plan({ hairlineChange: "yes", hairlineSince: "<6m", shedding: "yes", familyHistory: "yes", hairHabits: ["tight-styles", "chemical"] })]);
    expect(text).not.toMatch(/alopecia|male-pattern|androgen|minoxidil|finasteride|balding|getting worse/i);
  });
});

describe("feedback and corrections", () => {
  it("'don't like the style' on a haircut swaps in the next best cut", () => {
    const before = run({});
    const cut = before.haircuts[0].id;
    const after = run({}, { feedback: { [`hair-cut:${cut}`]: { verdict: "not", reason: "style", ref: cut, at: "" } } });
    expect(after.haircuts[0].id).not.toBe(cut);
    expect(after.recs.find((r) => r.id === "hair-cut")!.ref).toBe(after.haircuts[0].id);
  });
  it("'not for me' on the skin active removes it from the plan and the routine", () => {
    const a = run({ skinConcerns: ["breakouts"] }, { feedback: { "skin-active": { verdict: "not", reason: "tried", at: "" } } });
    expect(a.recs.some((r) => r.id === "skin-active")).toBe(false);
    expect([...a.routine.am, ...a.routine.pm].some((s) => s.id.endsWith("-active"))).toBe(false);
    expect(a.hidden!.some((h) => h.id === "skin-active")).toBe(true);
  });
  it("'too much upkeep' on the haircut moves to a lower-upkeep cut", () => {
    const p = { maintenance: "high" as const, hairLength: "medium" as const };
    const before = run(p);
    const cut = before.haircuts[0].id;
    const after = run(p, { feedback: { [`hair-cut:${cut}`]: { verdict: "not", reason: "maintenance", ref: cut, at: "" } } });
    const r = after.recs.find((x) => x.id === "hair-cut");
    expect(!r || r.ref !== cut).toBe(true);
  });
});

describe("psychology guardrails", () => {
  it("frequent appearance worry → short plan, no photo observations, no cosmetic extras", () => {
    const a = run({ worry: "often" }, { cues: { lowerToMid: 1.3, underEyeRatio: 0.7, browDiff: 0.1 } });
    expect(a.light).toBe(true);
    expect(a.recs.length).toBeLessThanOrEqual(6);
    expect(a.modules.filter((m) => m.id !== "face").flatMap((m) => m.observations).some((o) => o.source === "photo")).toBe(false);
    expect(a.recs.some((r) => ["eyes-brows", "smile-stain", "style-capsule"].includes(r.id))).toBe(false);
  });
  it("a photo-only cue never reaches the top 3", () => {
    const a = run({ skinConcerns: [], sleep: "7-9" }, { cues: { underEyeRatio: 0.7 } });
    const r = a.recs.find((x) => x.id === "eyes-under");
    expect(r?.basis).toBe("photo");
    expect(a.top3).not.toContain("eyes-under");
  });
  it("every recommendation explains why it's in the plan", () => {
    for (const p of Object.values(PROFILES)) for (const r of run(p).recs) expect(r.why?.length, r.id).toBeGreaterThan(0);
  });
  it("no scores, rankings or pseudoscience anywhere in any profile's output", () => {
    for (const p of Object.values(PROFILES)) {
      const text = JSON.stringify(run(p)).toLowerCase();
      for (const w of [/\bscore:/, /\/10\b/, /ugly/, /\bflaw/, /defect/, /golden ratio/, /canthal/, /hunter eyes/, /mewing/, /\bpsl\b/, /better[- ]looking/]) expect(text).not.toMatch(w);
    }
  });
});
