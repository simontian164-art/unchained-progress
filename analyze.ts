/**
 * Analysis engine v2.
 *
 * Inputs: questionnaire answers + face shape (measured or chosen) + cautious photo cues.
 * Output: modules (face, hair, beard, skin, eyes, smile, style, body), each with observations
 * (labelled photo vs answers), what's working, and recommendations tagged by type, impact,
 * effort, cost and timeframe. Everything connects: face shape → haircut → barber card → product →
 * where to buy → routine → progress.
 *
 * Pure and deterministic. Never produces numeric attractiveness scores.
 */
import type {
  Analysis,
  BarberSpec,
  BeardOption,
  BeardPlan,
  Cost,
  FaceMeasurements,
  FaceShape,
  HaircutOption,
  Horizon,
  Level3,
  ModuleId,
  ModuleResult,
  Observation,
  PhotoCheck,
  PhotoCues,
  ProNote,
  Profile,
  Rec,
  RoutineStep,
  ShopItem,
  Status,
  StyleVibe,
  Task,
  Feedback,
  KeepItem,
  HairlinePlan,
  OwnedProduct,
} from "../types";
import { CUTS, LENGTH_ORDER, PRODUCT_LABEL, desiredToCut, type Cut } from "./kb/haircuts";
import { BEARDS } from "./kb/beards";
import { CATEGORIES, HAIR_PRODUCT_QUERY, INGREDIENTS } from "./kb/products";
import { BUILD, CAPSULE, FRAMES, HEIGHT, MEASUREMENTS, NECKLINES, PALETTE, UNDERTONE, VIBE } from "./kb/style";
import { SHAPE_LABEL } from "./face";
import { NICHES, piecesFor } from "./kb/guides";
import { len, localPrice, withPrefs } from "./local";

const VIBE_NAME: Record<StyleVibe, string> = { "clean-casual": "clean casual", smart: "smart casual", classic: "old money / quiet luxury", street: "streetwear", minimal: "minimal", athletic: "athletic", rugged: "rugged / workwear", unsure: "everyday" };
/** Which style guide (niche) backs each style answer. */
const VIBE_NICHE: Record<StyleVibe, string> = { "clean-casual": "clean-casual", smart: "smart-casual", classic: "old-money", street: "streetwear", minimal: "clean-casual", athletic: "athletic", rugged: "rugged", unsure: "clean-casual" };
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// ─── Haircut engine ───────────────────────────────────────────────
const hairlineConcern = (p: Profile) =>
  p.hairlineChange === "yes" || p.hairlineShape === "m-shape" || p.hairConcerns.includes("thinning");

/** Style identity each cut reads as. Used alongside face shape, texture, density, length and upkeep. */
const CUT_VIBES: Record<string, StyleVibe[]> = {
  buzz: ["minimal", "street", "athletic", "rugged"],
  crew: ["clean-casual", "smart", "minimal", "athletic", "rugged"],
  crop: ["clean-casual", "street", "minimal", "athletic"],
  quiff: ["smart", "clean-casual"],
  "side-part": ["smart", "classic"],
  "slick-back": ["smart", "classic"],
  curtains: ["street", "clean-casual"],
  "curly-taper": ["clean-casual", "street", "smart", "athletic"],
  "coily-top": ["clean-casual", "street", "athletic"],
  flow: ["street", "clean-casual", "classic", "rugged"],
  "long-layers": ["clean-casual", "minimal", "classic"],
  lob: ["smart", "clean-casual", "minimal", "classic"],
  bob: ["smart", "minimal", "classic"],
  "curly-shag": ["street", "clean-casual"],
  pixie: ["minimal", "street", "smart"],
};
/** Cuts that read as polished in a formal or conservative workplace without extra styling. */
const FORMAL_OK = new Set(["crew", "crop", "quiff", "side-part", "slick-back", "curly-taper", "coily-top", "lob", "bob", "long-layers", "pixie"]);

export interface CutContext {
  /** beard option chosen by the beard engine (id) */
  beard?: string;
  /** haircut ids the user said they don't like */
  exclude?: string[];
  /** the user said the last suggestion was too much upkeep */
  lowerUpkeep?: boolean;
}

const effMaintenance = (p: Profile, ctx: CutContext): Profile["maintenance"] => (ctx.lowerUpkeep ? "low" : p.maintenance);

export function scoreCut(cut: Cut, p: Profile, shape: FaceShape, ctx: CutContext = {}): number {
  if (p.presentation !== "neutral" && !cut.presentations.includes(p.presentation)) return -99;
  if (ctx.exclude?.includes(cut.id)) return -99;
  let s = 0;
  // A buzz is a big, hard-to-undo change; offer it, but don't lead with it on a tie.
  if (cut.id === "buzz") s -= 1;
  s += cut.textures.includes(p.hairType) ? 2 : -6;
  s += cut.densities.includes(p.hairDensity) ? 1 : -2;
  if (cut.faceGood.includes(shape)) s += 3;
  if (cut.faceCareful.includes(shape)) s -= 3;
  const want = desiredToCut[p.hairLength];
  if (want.includes(cut.length)) s += 3;
  else if (Math.min(...want.map((w) => Math.abs(LENGTH_ORDER.indexOf(w) - LENGTH_ORDER.indexOf(cut.length)))) > 1) s -= 2;
  if (hairlineConcern(p)) s += cut.hairlineFriendly ? 2 : -3;
  const m = effMaintenance(p, ctx);
  if (m === "low") s += cut.maintenance === "low" ? 1.5 : cut.maintenance === "medium" ? -1 : -3.5;
  if (m === "high" && cut.maintenance !== "low") s += 0.5;
  if (cut.sides === p.sides) s += 1;
  // Fine or thinning hair loses shape at length; long cuts need weight to look full.
  if ((p.hairDensity === "fine" || p.hairConcerns.includes("thinning")) && cut.length === "long") s -= 2;
  // Style identity and dress code.
  if (CUT_VIBES[cut.id]?.includes(p.vibe)) s += 1.5;
  if (p.dressCode === "formal" || p.dressCode === "smart") s += FORMAL_OK.has(cut.id) ? 1 : -1.5;
  // Haircut and beard as one silhouette: a beard pairs with shorter sides; clean-shaven + tight sides
  // on a round face needs height on top.
  if (ctx.beard && ["short-boxed", "full", "heavy-stubble"].includes(ctx.beard) && cut.sides === "tight") s += 1;
  if (ctx.beard === "full" && cut.length === "long") s -= 1;
  return s;
}

function cutSpec(cut: Cut, p: Profile, beardStyle?: string): BarberSpec {
  const [a, b] = cut.topCm;
  const isLong = cut.length === "long" || (cut.length === "medium" && cut.sides === "full");
  const avoid: string[] = [];
  if (hairlineConcern(p)) avoid.push("Don't push the temples back or square off the hairline");
  if (p.hairConcerns.includes("cowlick")) avoid.push("Leave extra length over the cowlick so it lies flat");
  if (p.hairType === "curly" || p.hairType === "coily") avoid.push("Don't thin out curls with thinning shears");
  if (p.hairDensity === "fine") avoid.push("Don't over-texturize; fine hair needs its weight");
  if (cut.carefulWhy && cut.faceCareful.length === 0) avoid.push(cut.carefulWhy);
  return {
    cutName: cut.name,
    sides: cut.sides_,
    top: isLong && a >= 20 ? `About ${len(a, p.country)}–${len(b, p.country)} overall` : `${len(a, p.country)} to ${len(b, p.country)} on top`,
    fringe: cut.fringe,
    neckline: cut.neckline,
    sideburns: beardStyle && beardStyle !== "clean" && cut.sides === "tight" ? "Fade the sideburns into the beard, no hard gap" : cut.sideburns,
    temples: hairlineConcern(p) ? "Keep the natural temple line; soft, not sharp" : cut.temples,
    texture: cut.texture,
    finish: `${cut.finish}${cut.product !== "none" ? ` · ${PRODUCT_LABEL[cut.product].toLowerCase()}` : ""}`,
    avoid,
    rebook: `Every ${cut.rebookWeeks[0]}–${cut.rebookWeeks[1]} weeks`,
  };
}

function cutWhy(cut: Cut, p: Profile, shape: FaceShape, ctx: CutContext = {}): string[] {
  const why: string[] = [];
  if (cut.faceWhy[shape]) why.push(`${SHAPE_LABEL[shape]} face: ${lc(cut.faceWhy[shape]!)}`);
  if (cut.textures.includes(p.hairType)) why.push(`Works with ${p.hairType} hair${cut.densities.includes(p.hairDensity) ? ` and ${p.hairDensity} density` : ""}.`);
  if (hairlineConcern(p) && cut.hairlineFriendly) why.push("Keeps the temples soft instead of exposing them.");
  if (effMaintenance(p, ctx) === "low" && cut.maintenance === "low") why.push(`Fits the low upkeep you asked for: about ${cut.styleMinutes || 0}–${cut.styleMinutes + 2} minutes to style.`);
  else if (cut.maintenance === "low") why.push(`Low effort: about ${cut.styleMinutes || 0}–${cut.styleMinutes + 2} minutes to style.`);
  if (CUT_VIBES[cut.id]?.includes(p.vibe)) why.push(`Suits the ${VIBE_NAME[p.vibe]} style you picked.`);
  if ((p.dressCode === "formal" || p.dressCode === "smart") && FORMAL_OK.has(cut.id)) why.push("Looks polished for a smart or formal workplace without extra styling.");
  if (ctx.beard && ["short-boxed", "full", "heavy-stubble"].includes(ctx.beard) && cut.sides === "tight") why.push("Shorter sides balance your facial hair so the weight sits at the jaw.");
  if (p.hairDensity === "fine" && cut.length !== "long") why.push("Shorter lengths keep fine hair looking fuller.");
  if (p.hairDensity === "fine" && cut.length === "long") why.push("Heads-up: fine hair can look thinner at this length; ask for blunt ends to keep weight.");
  return why;
}

export function haircutOptions(p: Profile, shape: FaceShape, beardStyle?: string, ctx: CutContext = {}): HaircutOption[] {
  ctx = { ...ctx, beard: ctx.beard ?? beardStyle };
  const scored = CUTS.map((c) => ({ c, s: scoreCut(c, p, shape, ctx) })).filter((x) => x.s > -50).sort((a, b) => b.s - a.s);
  if (!scored.length) return [];
  const used = new Set<string>();
  const pick = (pred: (c: Cut) => boolean) => {
    const found = scored.find((x) => !used.has(x.c.id) && pred(x.c) && x.s > -3);
    if (found) used.add(found.c.id);
    return found?.c;
  };
  const best = pick(() => true)!;
  const bestIdx = LENGTH_ORDER.indexOf(best.length);
  const low = pick((c) => c.maintenance === "low");
  const shorter = pick((c) => LENGTH_ORDER.indexOf(c.length) < bestIdx || (bestIdx <= 1 && c.length === "buzz"));
  const longer = pick((c) => LENGTH_ORDER.indexOf(c.length) > bestIdx);
  // "Approach carefully": a style people often ask for that may not suit this combination.
  const careful = CUTS.find(
    (c) =>
      !used.has(c.id) &&
      !ctx.exclude?.includes(c.id) &&
      (p.presentation === "neutral" || c.presentations.includes(p.presentation)) &&
      c.textures.includes(p.hairType) &&
      (c.faceCareful.includes(shape) || (hairlineConcern(p) && !c.hairlineFriendly)),
  );

  const opt = (slot: HaircutOption["slot"], c: Cut | undefined): HaircutOption | null =>
    c
      ? {
          slot,
          id: c.id,
          name: c.name,
          why:
            slot === "careful"
              ? [c.faceCareful.includes(shape) ? c.carefulWhy : "It pulls hair away from the temples, which draws attention to the hairline.", "Not off-limits — ask your barber how to adapt it."]
              : cutWhy(c, p, shape, ctx),
          maintenance: `Rebook every ${c.rebookWeeks[0]}–${c.rebookWeeks[1]} weeks${c.styleMinutes ? `; ${c.styleMinutes} min to style` : "; no styling needed"}`,
          styling: c.styling,
          spec: cutSpec(c, p, beardStyle),
        }
      : null;

  return [opt("best", best), opt("low", low), opt("shorter", shorter), opt("longer", longer), opt("careful", careful)].filter(Boolean) as HaircutOption[];
}

// ─── Beard engine ────────────────────────────────────────────────
export function beardPlan(p: Profile, shape: FaceShape, cues?: PhotoCues, ctx: { exclude?: string[]; lowerUpkeep?: boolean } = {}): BeardPlan | undefined {
  if (p.facialHair === "not-applicable") return undefined;
  const upkeep = ctx.lowerUpkeep ? "low" : p.maintenance;
  const lowerLong = (cues?.lowerToMid ?? 1) > 1.15;
  const lowerShort = (cues?.lowerToMid ?? 1) < 0.9;
  const bumps = p.skinConcerns.includes("razor-bumps") || p.hairType === "curly" || p.hairType === "coily";
  const scored = BEARDS.map((b) => {
    let s = 0;
    if (b.good.includes(shape)) s += 2;
    if (b.careful.includes(shape)) s -= 2;
    if (b.needsFullGrowth && p.facialHair !== "full") s -= 5;
    if (p.beardPref === "clean") s += b.id === "clean" ? 5 : -1;
    if (p.beardPref === "stubble") s += b.id.includes("stubble") ? 4 : 0;
    if (p.beardPref === "beard") s += b.id === "short-boxed" || b.id === "full" ? 4 : 0;
    // Photo cue: lens- and tilt-dependent, so it only nudges.
    if (lowerLong && b.id === "full") s -= 1;
    if (lowerShort && (b.id === "short-boxed" || b.id === "full")) s += 0.5;
    // Upkeep: defined beards need line-ups every few days.
    if (upkeep === "low") s += b.id === "full" ? -2 : b.id === "short-boxed" ? -1 : b.id.includes("stubble") ? 1 : 0;
    if (upkeep === "low" && b.id === "clean" && p.facialHair === "full") s -= 1; // daily shaving is upkeep too
    if (ctx.exclude?.includes(b.id)) s -= 50;
    if (bumps && b.id === "clean") s -= 1;
    if (p.facialHair === "full" && p.beardPref === "open" && (b.id === "heavy-stubble" || b.id === "short-boxed")) s += 1;
    if (b.why[shape]) s += 0.5;
    return { b, s };
  }).sort((a, b) => b.s - a.s);

  const options: BeardOption[] = scored.filter(({ s }) => s > -40).map(({ b, s }, i) => {
    let why = b.why[shape] ?? b.general;
    if (b.needsFullGrowth && p.facialHair === "patchy") why = "Needs full, even growth. Patchy growth tends to look uneven at this length.";
    else if (b.id === "clean" && bumps) why = "Close shaving can trigger razor bumps, especially with curly beard hair. A trimmer that leaves about 1 mm is gentler.";
    else if (lowerLong && b.id === "full") why = "In your photo the lower face already reads long; a long chin beard adds more length. Keep it short at the chin if you try it.";
    if (upkeep === "low" && (b.id === "full" || b.id === "short-boxed") && p.facialHair === "full")
      why = `${why} It needs a trim and line-up every few days, more than the low upkeep you asked for.`;
    const fit: BeardOption["fit"] = i === 0 ? "best" : s < 0 ? "careful" : "good";
    const lenTxt = b.lengthMm[1] === 0 ? "Shaved" : `${b.lengthMm[0]}–${b.lengthMm[1]} mm`;
    return { id: b.id, name: b.name, length: lenTxt, fit, why };
  });

  return {
    options,
    neckline: "Picture a curve from behind each earlobe to about two fingers above the Adam's apple. Shave below it and fade the line so it isn't a hard edge.",
    cheekLine: "Follow your natural cheek line and only remove stray hairs above it. Dropping it too low can make the face look wider.",
    moustache: "Trim so hair doesn't hang over the upper lip line.",
    sideburns: "Keep sideburns the same length as the beard so haircut and beard join smoothly; ask your barber to blend them.",
    maintenance: [
      upkeep === "low"
        ? "Once a week: run the trimmer over everything with one guard and tidy the neckline. That's it."
        : "Trim every 3–7 days with the same guard so the length stays consistent.",
      "Wash facial hair with your face cleanser; a few drops of beard oil or moisturizer stops itch and flakes underneath.",
      bumps ? "For bumps: exfoliate the beard area 2–3 times a week and avoid shaving against the grain." : "Shave or trim after a warm shower when hair is softer.",
    ],
  };
}

// ─── Hairline approach ───────────────────────────────────────────
/**
 * Chooses an APPROACH, never a diagnosis: style around it, track it, change hair care, or consider a
 * professional. Based only on what the user reports.
 */
export function hairlinePlan(p: Profile): HairlinePlan | undefined {
  const changing = p.hairlineChange === "yes" || p.hairConcerns.includes("thinning");
  const unsure = p.hairlineChange === "unsure";
  const shaped = p.hairlineShape === "m-shape" || p.hairlineShape === "uneven";
  const habits = p.hairHabits ?? [];
  if (!changing && !unsure && !shaped && !habits.length) return undefined;

  const approach = new Set<HairlinePlan["approach"][number]>();
  const reasons: string[] = [];
  const steps: string[] = [];
  const recent = p.hairlineSince === "<6m";
  const shedding = p.shedding === "yes";

  if (changing && (recent || shedding)) {
    approach.add("pro");
    reasons.push(recent && shedding ? "You noticed a change recently and more shedding than usual." : recent ? "You noticed the change in the last 6 months." : "You've noticed more shedding than usual.");
    steps.push("Recent or fast changes are worth getting checked sooner rather than later. Some causes (stress, illness, diet, medication changes) are temporary or treatable.");
  } else if (changing) {
    approach.add("track");
    if (p.proOpen !== "no") approach.add("pro");
    reasons.push(
      p.hairlineSince && p.hairlineSince !== "unsure" && p.hairlineSince !== "none"
        ? `You've noticed gradual change over ${p.hairlineSince === "6-12m" ? "6–12 months" : p.hairlineSince === "1-3y" ? "1–3 years" : "3+ years"}.`
        : "You've noticed change over time.",
    );
    if (p.familyHistory === "yes") reasons.push("You mentioned a family history, which is useful for a professional to know.");
  } else if (unsure) {
    approach.add("track");
    reasons.push("You're not sure whether anything is changing. Consistent photos every 8–12 weeks will answer that better than the mirror.");
  }

  if (habits.includes("tight-styles")) {
    approach.add("care");
    reasons.push("Tight ponytails, braids, buns or locs pulled back can put ongoing tension on the hairline.");
    steps.push("Loosen styles at the front and temples, switch between styles, and give the edges days off.");
  }
  if (habits.includes("chemical")) {
    approach.add("care");
    reasons.push("Bleaching, relaxing or perming can make hair break, which can look like thinning.");
    steps.push("Space chemical treatments further apart and have them done by a professional.");
  }
  if (habits.includes("heat")) {
    approach.add("care");
    steps.push("Use a heat protectant and a lower heat setting; air-dry when you can.");
  }
  if (habits.includes("concealers")) steps.push("Leave hair fibres or concealers off for tracking photos so comparisons are fair.");

  if (!changing && shaped) {
    approach.add("style");
    reasons.push(`A ${p.hairlineShape === "m-shape" ? "higher-at-the-temples" : "slightly uneven"} hairline that you haven't seen change is common and usually just your hairline.`);
    steps.push("Pick cuts with some length or texture at the front; ask the barber not to push the temples back.");
  }
  if (approach.has("track")) steps.push("Take the 5-angle hairline set in Progress now, then again at 8 weeks, 12 weeks and 6 months.");
  if (approach.has("pro")) steps.push("Bring your photo sets and dates. A professional can examine your scalp; we can't from photos.");
  return { approach: [...approach], reasons, steps };
}

// ─── Recommendation helpers ──────────────────────────────────────
type RecIn = Omit<Rec, "id"> & { id?: string };
const IMPACT: Record<Level3, number> = { low: 1, medium: 2, high: 3 };
const EFFORT_EASE: Record<Level3, number> = { low: 2, medium: 1, high: 0 };
const COST_EASE: Record<Cost, number> = { free: 2, $: 1.5, $$: 1, $$$: 0 };

const GOAL_FOCUS: Record<Profile["goal"], ModuleId[]> = {
  work: ["hair", "style", "skin", "beard"],
  dating: ["hair", "skin", "beard", "style", "smile"],
  event: ["hair", "beard", "style", "skin"],
  confidence: ["hair", "style", "body", "skin"],
  overall: ["hair", "skin", "style", "beard", "eyes", "smile", "body"],
};

/** How much a recommendation's evidence counts. Photo-only cues depend on light and angle. */
export const BASIS_WEIGHT: Record<NonNullable<Rec["basis"]>, number> = { answers: 1, "answers+photo": 0.9, general: 0.8, photo: 0.6 };

export function priorityScore(r: Rec, p: Profile, fb?: Feedback) {
  const goal = GOAL_FOCUS[p.goal].includes(r.module) ? 1.5 : 0;
  const speed = r.timeframe === "immediate" ? 1 : r.timeframe === "weeks" ? 0.5 : 0;
  const pro = r.kind === "professional" ? -1 : 0; // important but rarely a "today" action
  // Respect how much time and money the user said they have.
  const upkeep = p.maintenance === "low" && r.effort === "high" ? -1.5 : 0;
  const money = p.budget === "low" && (r.cost === "$$$" || r.cost === "$$") && r.kind !== "barber" ? -1 : 0;
  const liked = fb?.verdict === "helpful" ? 1 : 0;
  const base = IMPACT[r.impact] * 2 + EFFORT_EASE[r.effort] + COST_EASE[r.cost] + goal + speed + pro + upkeep + money + liked;
  return base * BASIS_WEIGHT[r.basis ?? "answers"];
}

// ─── Main ────────────────────────────────────────────────────────
export function analyze(input: {
  profile: Profile;
  faceShape: FaceShape;
  faceShapeSource: "measured" | "chosen";
  measurements?: FaceMeasurements;
  cues?: PhotoCues;
  photoChecks: PhotoCheck[];
  photoSlots: string[];
  now?: Date;
  /** "Helpful" / "Not for me" answers, keyed by recommendation id. */
  feedback?: Record<string, Feedback>;
}): { analysis: Analysis; tasks: Task[] } {
  const { profile: p, faceShape: shape, measurements, photoChecks } = input;
  const fb = input.feedback ?? {};
  // A shorter, calmer plan when appearance worries take up a lot of someone's day.
  const light = p.worry === "often";
  // In light mode, photo-derived cues aren't shown or used: less scrutiny of the face.
  const cues = light ? undefined : input.cues;
  const owned = new Set<OwnedProduct>(p.owned ?? []);
  if (p.usesSpf) owned.add("sunscreen"); // they already wear one
  // Feedback keys are the rec id, or "recId:ref" when it targets a specific option (e.g. one haircut).
  const fbFor = (id: string, ref?: string) => (ref && fb[`${id}:${ref}`]) || fb[id];
  const notFor = (id: string, ref?: string) => {
    const f = fbFor(id, ref);
    return f?.verdict === "not" ? f : undefined;
  };
  const rejectedRefs = (id: string, reason?: Feedback["reason"]) =>
    Object.entries(fb).filter(([k, f]) => k.startsWith(`${id}:`) && f.verdict === "not" && (!reason || f.reason === reason)).map(([k]) => k.slice(id.length + 1));
  const upkeepFeedback = (id: string) => Object.entries(fb).some(([k, f]) => (k === id || k.startsWith(`${id}:`)) && f.verdict === "not" && f.reason === "maintenance");
  const keep: KeepItem[] = [];
  const addKeep = (k: KeepItem) => keep.push(k);
  const now = input.now ?? new Date();
  const recs: Rec[] = [];
  const modules: ModuleResult[] = [];
  const pros: ProNote[] = [];
  const addRec = (r: RecIn) => {
    const rec = { basis: "answers", ...r, id: r.id ?? `${r.module}-${recs.length}` } as Rec;
    recs.push(rec);
    return rec.id;
  };
  const addPro = (pn: ProNote) => {
    if (!pros.some((x) => x.who === pn.who && x.when === pn.when)) pros.push(pn);
  };
  const sensitiveSkin = p.sensitive || p.allergies.includes("fragrance") || p.allergies.includes("essential-oils");
  const bodyOn = p.bodyGoal !== "skip";

  // Beard first (the haircut spec references it).
  const beard = beardPlan(p, shape, cues, { exclude: rejectedRefs("beard-shape", "style"), lowerUpkeep: upkeepFeedback("beard-shape") });
  const beardChoice = beard?.options[0]?.id;
  const haircuts = haircutOptions(p, shape, beardChoice, { exclude: rejectedRefs("hair-cut", "style"), lowerUpkeep: upkeepFeedback("hair-cut") });
  const bestCut = haircuts[0];
  const bestCutDef = CUTS.find((c) => c.id === bestCut?.id);

  // ── FACE ───────────────────────────────────────────
  {
    const obs: Observation[] = [
      {
        text: `Face shape: ${SHAPE_LABEL[shape].toLowerCase()}${input.faceShapeSource === "measured" ? ", estimated from your front photo" : ", chosen by you"}.`,
        source: input.faceShapeSource === "measured" ? "photo" : "answers",
        caveat: input.faceShapeSource === "measured" ? "Estimated from one photo; camera distance and hair change how it reads." : undefined,
      },
    ];
    if (cues?.lowerToMid) {
      const r = cues.lowerToMid;
      obs.push({
        text:
          r > 1.15
            ? "In this photo, the lower face (nose to chin) reads a little longer than the middle face. We use this to suggest keeping facial hair shorter at the chin."
            : r < 0.9
              ? "In this photo, the lower face reads a little shorter than the middle face. Some length at the chin (if you grow facial hair) can balance it."
              : "Your middle and lower face read evenly balanced in this photo.",
        source: "photo",
        caveat: "Lens distance and head tilt change this. It's a styling input, not a measure of attractiveness.",
      });
    }
    const faceRecs: string[] = [];
    if (p.photoDislike) {
      faceRecs.push(
        addRec({
          id: "face-photos",
          module: "face",
          title: "Fix the photo setup before changing anything",
          detail: "Most 'I look bad in photos' comes from the camera, not your face: close-up wide lenses, overhead light, and seeing yourself un-mirrored.",
          steps: [
            "Hold the phone at arm's length or further, or use the 2× lens.",
            "Camera at eye level; face a window instead of standing under a ceiling light.",
            "Try a small turn (15–20°) each way and keep the side you like.",
            "Relax your jaw and breathe out before the shot; a slight smile reads more natural than a posed one.",
            "Remember the flipped-photo effect: the version you see in the mirror isn't the one others see.",
          ],
          kind: "home",
          impact: "high",
          effort: "low",
          cost: "free",
          timeframe: "immediate",
          why: ["You said you usually dislike how you look in photos.", "Camera distance, light and mirroring change how a face looks more than most grooming does."],
        }),
      );
      addKeep({ id: "keep-features", module: "face", title: "Your features", why: "For better photos you may not need to change anything about your face. Start with the photo setup." });
    }
    const working: string[] = [];
    if (shape === "oval") working.push("Your face shape suits a wide range of haircuts");
    if (measurements && measurements.jawToCheek > 0.9) working.push("A well-defined jaw width in your photo");
    if (shape === "heart" || shape === "diamond") working.push("Defined cheekbones");
    modules.push({
      id: "face",
      title: "Face shape & proportions",
      status: "strong",
      summary: "Used to tailor your haircut, facial hair, glasses and collars. No scores, no 'ideal' face.",
      working,
      observations: obs,
      recIds: faceRecs,
      notes: ["We don't score symmetry or use 'ideal ratio' targets. Natural variation between the two sides of a face is normal."],
    });
  }

  // ── HAIR & HAIRLINE ────────────────────────────────
  const hairline = hairlinePlan(p);
  {
    const obs: Observation[] = [
      { text: `${p.hairDensity[0].toUpperCase() + p.hairDensity.slice(1)}-density, ${p.hairType} hair; you'd like to keep it ${p.hairLength}.`, source: "answers" },
      {
        text:
          p.lastCut === "8w-plus"
            ? "It's been 8+ weeks since your last cut, so the shape has likely grown out."
            : p.lastCut === "4-8w"
              ? "Your last cut was 4–8 weeks ago."
              : "You had a cut in the last 4 weeks.",
        source: "answers",
      },
    ];
    if (p.cutHappy) obs.push({ text: p.cutHappy === "yes" ? "You're happy with your current haircut." : p.cutHappy === "mostly" ? "You mostly like your current haircut." : "You'd like a different haircut.", source: "answers" });
    if (p.hairlineShape !== "unsure")
      obs.push({ text: `You described your hairline as ${p.hairlineShape === "m-shape" ? "M-shaped (higher at the temples)" : p.hairlineShape}.`, source: "answers", caveat: "Many adult hairlines move slightly higher at the temples in the late teens and twenties; that alone isn't hair loss." });
    if (p.hairlineSince && p.hairlineSince !== "none" && p.hairlineSince !== "unsure")
      obs.push({ text: `You first noticed a change ${p.hairlineSince === "<6m" ? "in the last 6 months" : p.hairlineSince === "6-12m" ? "6–12 months ago" : p.hairlineSince === "1-3y" ? "1–3 years ago" : "more than 3 years ago"}${p.shedding === "yes" ? ", with more shedding than usual" : ""}.`, source: "answers" });
    if (input.photoSlots.some((s) => s === "hairline" || s === "crown" || s === "left" || s === "right"))
      obs.push({ text: "Your hairline and side photos are saved for your own reference.", source: "photo", caveat: "We don't assess hair loss from photos." });

    const recIds: string[] = [];
    const happy = p.cutHappy === "yes";
    if (happy && p.lastCut !== "8w-plus") {
      addKeep({ id: "keep-cut", module: "hair", title: "Your current haircut", why: "You like it and it's recent, so there's nothing to change. Your barber card has options if you ever want something new." });
    } else if (happy && bestCut) {
      recIds.push(
        addRec({
          id: "hair-trim",
          module: "hair",
          title: "Book a trim of the cut you already like",
          detail: "It's been 8+ weeks, so the shape has grown out. Ask for the same cut, just cleaned up.",
          steps: ["Ask for the same shape, taking off only what's grown since last time.", "Book the next one before you leave: 4–6 weeks for short cuts, 8–12 for longer ones."],
          kind: "barber",
          impact: "medium",
          effort: "low",
          cost: "$$",
          timeframe: "immediate",
          shopIds: ["haircut-service"],
          why: ["You said you like your current cut.", "Your last cut was 8+ weeks ago."],
        }),
      );
    } else if (bestCut) {
      recIds.push(
        addRec({
          id: "hair-cut",
          ref: bestCut.id,
          module: "hair",
          title: `New haircut: ${lc(bestCut.name)}`,
          detail: bestCut.why.slice(0, 2).join(" "),
          steps: ["Open 'Show my barber' and show it at your appointment.", ...bestCut.styling],
          kind: "barber",
          impact: p.lastCut === "8w-plus" || p.cutHappy === "no" ? "high" : "medium",
          effort: "low",
          cost: "$$",
          timeframe: "immediate",
          shopIds: ["haircut-service"],
          why: [
            ...(p.cutHappy === "no" ? ["You said you'd like a different haircut."] : []),
            ...bestCut.why,
            `Chosen from ${CUTS.length} cuts using your face shape (${input.faceShapeSource === "measured" ? "estimated from your photo and confirmed by you" : "chosen by you"}), hair type, density, preferred length, sides, upkeep, hairline and style.`,
          ],
          // Face shape is confirmed (or chosen) by the user before the plan is built.
          basis: "answers",
        }),
      );
    }
    const newCut = recIds.includes("hair-cut");
    if (bestCutDef && bestCutDef.product !== "none" && newCut && !owned.has("hair-product")) {
      recIds.push(
        addRec({
          id: "hair-product",
          module: "hair",
          title: `Style with ${PRODUCT_LABEL[bestCutDef.product].toLowerCase()}`,
          detail: "Holds the shape of your cut without looking greasy.",
          steps: bestCutDef.styling,
          kind: "product",
          impact: "medium",
          effort: "low",
          cost: "$",
          timeframe: "weeks",
          shopIds: ["hair-product"],
          why: [`Your suggested cut is styled with ${PRODUCT_LABEL[bestCutDef.product].toLowerCase()}.`],
        }),
      );
    }
    if (p.hairConcerns.includes("dandruff") || p.hairConcerns.includes("oily-scalp")) {
      const tender = p.hairConcerns.includes("sensitive-scalp");
      recIds.push(
        addRec({
          id: "hair-scalp",
          module: "hair",
          title: "Treat flakes or oily scalp",
          detail: tender
            ? "Anti-dandruff shampoo twice a week, but because your scalp is sensitive, start once a week and use a fragrance-free regular shampoo in between."
            : "Anti-dandruff shampoo twice a week, left on 3–5 minutes.",
          steps: [
            tender ? "Start once a week; go to twice if it doesn't sting or itch." : "Use it twice a week, your usual shampoo on other days.",
            "Leave on the scalp 3–5 minutes before rinsing.",
            ...(tender ? ["Choose fragrance-free for your regular shampoo and conditioner."] : []),
          ],
          kind: "product",
          impact: "medium",
          effort: "low",
          cost: owned.has("anti-dandruff") ? "free" : "$",
          timeframe: "weeks",
          shopIds: owned.has("anti-dandruff") ? undefined : ["anti-dandruff"],
          why: [`You mentioned ${[p.hairConcerns.includes("dandruff") ? "flakes" : "", p.hairConcerns.includes("oily-scalp") ? "an oily scalp" : ""].filter(Boolean).join(" and ")}.`, ...(tender ? ["You said your scalp is sensitive."] : [])],
        }),
      );
      addPro({ who: "dermatologist", when: "Flaking, itching or redness on the scalp that doesn't improve after 4–6 weeks of anti-dandruff shampoo.", mapQuery: "dermatologist", ask: ["What's causing the flaking, and which shampoo ingredient suits my scalp?"], bring: ["Which shampoos you've tried and for how long"] });
    } else if (p.hairConcerns.includes("sensitive-scalp")) {
      recIds.push(
        addRec({
          id: "hair-scalp-gentle",
          module: "hair",
          title: "Go gentle on your scalp",
          detail: "Fragrance-free shampoo, lukewarm water, and product kept off the scalp.",
          steps: ["Switch shampoo and conditioner to fragrance-free.", "Apply styling product to the lengths, not the roots."],
          kind: "home",
          impact: "low",
          effort: "low",
          cost: "free",
          timeframe: "weeks",
          why: ["You said your scalp is sensitive."],
        }),
      );
    }
    if (p.hairConcerns.includes("frizz") || p.hairConcerns.includes("flat")) {
      recIds.push(
        addRec({
          id: "hair-texture",
          module: "hair",
          title: p.hairConcerns.includes("frizz") ? "Calm frizz" : "Add volume",
          detail: p.hairConcerns.includes("frizz") ? "Condition every wash, blot with a T-shirt instead of rubbing with a towel, finish with a drop of oil on the ends." : "Blow-dry the roots upward, use a light texture spray or clay, and avoid heavy pomades.",
          steps: [],
          kind: "home",
          impact: "low",
          effort: "low",
          cost: "free",
          timeframe: "immediate",
          why: [`You said your hair ${p.hairConcerns.includes("frizz") ? "gets frizzy" : "falls flat"}.`],
        }),
      );
    }
    if (hairline) {
      const ap = new Set(hairline.approach);
      if (ap.has("care"))
        recIds.push(
          addRec({
            id: "hair-care",
            module: "hair",
            title: "Ease tension and heat on your hairline",
            detail: "Changing how hair is styled is the part of hairline care you control.",
            steps: hairline.steps.filter((x) => /Loosen|chemical|heat/.test(x)),
            kind: "home",
            impact: "medium",
            effort: "low",
            cost: "free",
            timeframe: "months",
            why: hairline.reasons.filter((x) => /tension|break/.test(x)),
          }),
        );
      if (ap.has("track"))
        recIds.push(
          addRec({
            id: "hair-track",
            module: "hair",
            title: "Start a hairline photo set",
            detail: "Five controlled photos now, then at 8 weeks, 12 weeks and 6 months. The mirror and random selfies can't show slow change reliably.",
            steps: ["Go to Progress → Hairline tracking.", "Dry hair, styled the same way, same room and light, no fibres or concealers.", "Don't compare in between; lighting changes look like hair changes."],
            kind: "home",
            impact: "medium",
            effort: "low",
            cost: "free",
            timeframe: "months",
            why: hairline.reasons.slice(0, 2),
          }),
        );
      if (ap.has("pro")) {
        const soon = p.hairlineSince === "<6m" || p.shedding === "yes";
        addPro({
          who: "hair-loss",
          when: soon
            ? "Recent change or more shedding than usual. Worth getting checked soon; some causes are temporary or treatable."
            : "You've noticed gradual thinning or recession. A dermatologist or qualified hair-loss professional can examine your scalp and explain evidence-based options.",
          mapQuery: "dermatologist hair loss",
          ask: ["Is what I'm noticing consistent with a normal hairline change, or ongoing loss?", "What are the options, and what are their side effects?", "How should I track it between visits?"],
          bring: [
            `When you first noticed it${p.hairlineSince && p.hairlineSince !== "unsure" ? ` (you said ${p.hairlineSince === "<6m" ? "under 6 months" : p.hairlineSince === "6-12m" ? "6–12 months" : p.hairlineSince === "1-3y" ? "1–3 years" : "3+ years"})` : ""}`,
            "Your hairline photo sets with dates",
            "Family history, recent illness, stress, diet changes and any medications",
            ...(p.hairHabits?.length ? ["Your styling habits (tight styles, chemical treatments, heat)"] : []),
          ],
        });
        if (p.proOpen !== "no")
          recIds.push(
            addRec({
              id: "hair-pro",
              module: "hair",
              title: soon ? "Get a recent hair change checked soon" : "Talk to a hair-loss professional",
              detail: "They can examine your scalp and tell you what's going on. We don't diagnose hair loss from photos.",
              steps: ["See 'When to see a professional' below for what to bring and ask."],
              kind: "professional",
              impact: soon ? "high" : "medium",
              effort: "medium",
              cost: "$$",
              timeframe: soon ? "weeks" : "months",
              why: hairline.reasons.slice(0, 2),
            }),
          );
      }
      if (ap.has("style") && !ap.has("track") && !ap.has("pro"))
        addKeep({ id: "keep-hairline", module: "hair", title: "Your hairline", why: "You haven't noticed it changing. There's nothing to fix; your cut just keeps some length or texture at the front." });
    }
    addPro({ who: "doctor", when: "Sudden shedding, patchy bald spots, or hair loss with other symptoms.", mapQuery: "doctor" });
    const working: string[] = [];
    if (p.lastCut === "under-4w") working.push("You keep your haircut fresh");
    if (happy) working.push("You already have a haircut you like");
    if (p.hairDensity === "thick") working.push("Thick hair gives you lots of cut options");
    if (p.hairType === "wavy" || p.hairType === "curly" || p.hairType === "coily") working.push("Natural texture that holds shape with little product");
    modules.push({
      id: "hair",
      title: "Hair & hairline",
      status: !recIds.length ? "strong" : p.lastCut === "8w-plus" || GOAL_FOCUS[p.goal][0] === "hair" ? "priority" : "opportunity",
      summary: happy && p.lastCut !== "8w-plus" ? "Your current cut works for you. The barber card has alternatives if you want a change." : bestCut ? `Best match: ${bestCut.name.toLowerCase()}. Your barber card has the exact instructions.` : "Haircut options for your hair type.",
      working,
      observations: obs,
      recIds,
      pro: hairline?.approach.includes("pro") ? ["Consider discussing this with a dermatologist or qualified hair-loss professional."] : undefined,
    });
  }

  // ── FACIAL HAIR ───────────────────────────────────
  if (beard) {
    const top = beard.options[0];
    const recIds: string[] = [];
    const growing = p.facialHair === "full" || p.facialHair === "patchy";
    const bumps = p.skinConcerns.includes("razor-bumps");
    const alreadyClean = p.facialHair === "none" && top.id === "clean";
    const cueUsed = !!cues?.lowerToMid && (cues.lowerToMid > 1.15 || cues.lowerToMid < 0.9);
    if (alreadyClean && !bumps) {
      addKeep({ id: "keep-shave", module: "beard", title: "Your clean shave", why: "You already keep it shaved and that's what you want. Nothing to change." });
    } else {
      recIds.push(
        addRec({
          id: "beard-shape",
          ref: top.id,
          module: "beard",
          title: top.id === "clean" ? (bumps ? "Shave in a way that avoids bumps" : "Keep a clean shave, done well") : `Shape it as ${lc(top.name)} (${top.length})`,
          detail: top.why,
          steps:
            top.id === "clean"
              ? bumps
                ? ["Shave after a warm shower, with the grain, one pass.", "Consider a trimmer that leaves about 1 mm on days you don't need a close shave.", "Fresh blade every 5–7 shaves; fragrance-free moisturizer after."]
                : ["Shave after a warm shower, with the grain.", "Fresh blade every 5–7 shaves.", "Fragrance-free moisturizer afterwards."]
              : [beard.neckline, beard.cheekLine, beard.moustache, beard.maintenance[0]],
          kind: "home",
          impact: growing && !alreadyClean ? "high" : "medium",
          effort: top.id === "full" || top.id === "short-boxed" ? "medium" : "low",
          cost: growing && top.id !== "clean" && !owned.has("trimmer") ? "$" : "free",
          timeframe: "immediate",
          shopIds: growing && top.id !== "clean" && !owned.has("trimmer") ? ["trimmer"] : undefined,
          why: [
            p.beardPref === "open" ? "You're open to suggestions." : `You said you'd like ${p.beardPref === "clean" ? "to be clean-shaven" : p.beardPref === "stubble" ? "stubble" : "a beard"}.`,
            p.facialHair === "patchy" ? "Your growth is patchy, so options that need full cheeks are ranked lower." : p.facialHair === "full" ? "Your beard grows in full, so every length is possible." : "",
            ...(p.maintenance === "low" ? ["You asked for low upkeep, so options needing frequent line-ups rank lower."] : []),
            ...(bumps ? ["You get razor bumps, so very close shaving ranks lower."] : []),
            ...(cueUsed ? ["Your photo's lower-face proportion nudged the length slightly (a small factor; it depends on camera angle)."] : []),
          ].filter(Boolean),
          basis: cueUsed ? "answers+photo" : "answers",
        }),
      );
    }
    const obs: Observation[] = [
      { text: p.facialHair === "full" ? "Facial hair grows in full." : p.facialHair === "patchy" ? "Facial hair grows in patchy." : "You keep facial hair shaved.", source: "answers" },
    ];
    if (bumps) obs.push({ text: "You get razor bumps.", source: "answers" });
    modules.push({
      id: "beard",
      title: "Facial hair & grooming",
      status: !recIds.length ? "strong" : growing ? "priority" : "opportunity",
      summary: alreadyClean && !bumps ? "Clean-shaven is working for you. Other options are below if you're curious." : `${beard.options.filter((o) => o.fit !== "careful").length} options that can work. We rank them; there's no single correct beard.`,
      working: p.facialHair === "full" ? ["Full growth gives you every option, from stubble to a full beard"] : alreadyClean ? ["A consistent clean shave"] : [],
      observations: obs,
      recIds,
      notes: ["Trim nose and ear hair weekly with small rounded scissors or a trimmer attachment."],
    });
  }

  // ── SKIN ─────────────────────────────────────────
  const am: RoutineStep[] = [];
  const pm: RoutineStep[] = [];
  const weekly: RoutineStep[] = [];
  const ownedActives = (["retinoid", "exfoliating-acid", "benzoyl-peroxide", "azelaic"] as OwnedProduct[]).filter((x) => owned.has(x));
  {
    const c = p.skinConcerns;
    const oily = p.skinType === "oily" || p.skinType === "combination";
    const cleanser = oily || ((p.skinType === "normal" || p.skinType === "unsure") && !p.sensitive) ? "cleanser-gel" : "cleanser-cream";
    const moist = p.skinType === "dry" || (p.sensitive && !oily) ? "moist-rich" : "moist-light";
    const yours = (o: OwnedProduct, d: string) => (owned.has(o) ? "Keep using yours" : d);
    am.push({ id: "am-cleanse", label: p.skinType === "dry" ? "Rinse with water" : "Cleanse", detail: p.skinType === "dry" ? "Cleanser only at night" : yours("cleanser", CATEGORIES[cleanser].name), shopId: p.skinType === "dry" || owned.has("cleanser") ? undefined : cleanser });
    pm.push({ id: "pm-cleanse", label: "Cleanse", detail: yours("cleanser", CATEGORIES[cleanser].name), shopId: owned.has("cleanser") ? undefined : cleanser });

    // Smallest effective routine: at most ONE targeted product, chosen for the combination of
    // concerns, skin type, sensitivity and allergies. If the user already uses one, keep it.
    const noBHA = p.allergies.includes("salicylates");
    const gentle = p.sensitive || p.skinType === "dry";
    let active: string | null = null;
    let activeFor = "";
    let activeWhy = "";
    if (ownedActives.length) {
      active = null;
    } else if (c.includes("breakouts") && c.includes("dark-spots")) {
      [active, activeFor, activeWhy] = ["azelaic", "breakouts and dark marks", "Azelaic acid is used for both breakouts and marks, so one product covers two concerns."];
    } else if (c.includes("breakouts")) {
      [active, activeFor, activeWhy] = gentle || noBHA
        ? ["azelaic", "breakouts", noBHA ? "You're sensitive to salicylates, so salicylic acid is out." : `Your skin is ${p.sensitive ? "easily irritated" : "dry"}, and azelaic acid is usually gentler than salicylic acid.`]
        : ["bha", "breakouts", "Salicylic acid works inside oily pores, which suits your skin type."];
    } else if (c.includes("razor-bumps")) {
      [active, activeFor, activeWhy] = gentle || noBHA ? ["azelaic", "razor bumps", "A gentler option for bumps on sensitive or dry skin."] : ["bha", "razor bumps", "Salicylic acid helps keep hairs from getting trapped under the skin."];
    } else if (c.includes("dark-spots")) [active, activeFor, activeWhy] = ["azelaic", "dark marks and uneven tone", "Used for uneven tone and usually well tolerated."];
    else if (c.includes("redness")) [active, activeFor, activeWhy] = ["azelaic", "redness-prone skin", "Used for redness-prone skin; usually well tolerated."];
    else if (c.includes("texture")) [active, activeFor, activeWhy] = oily && !noBHA && !p.sensitive ? ["bha", "texture", "Suits oily skin with visible pores."] : ["retinoid", "texture", "Improves texture over months; start slowly."];
    else if (c.includes("fine-lines")) [active, activeFor, activeWhy] = ["retinoid", "fine lines", "The best-studied option for fine lines; start slowly."];
    else if (c.includes("dryness")) [active, activeFor, activeWhy] = ["hyaluronic", "dryness", "Helps skin hold water; very low irritation risk."];
    if (active) {
      const cat = CATEGORIES[active];
      const step = { id: `${active === "hyaluronic" || active === "niacinamide" ? "am" : "pm"}-active`, label: cat.name, detail: cat.frequency, shopId: active };
      (step.id.startsWith("am") ? am : pm).push(step);
    }
    if (ownedActives.length) pm.push({ id: "pm-active", label: "Your current treatment product", detail: ownedActives.length > 1 ? "Different nights if you use more than one" : "As you use it now" });
    am.push({ id: "am-moist", label: "Moisturize", detail: yours("moisturizer", CATEGORIES[moist].name), shopId: owned.has("moisturizer") ? undefined : moist });
    am.push({ id: "am-spf", label: "Sunscreen SPF 30+", detail: owned.has("sunscreen") ? "Keep using yours" : p.sunReaction === "burns" ? "SPF 50 if you burn easily; reapply outdoors" : "Two finger-lengths for face and neck", shopId: owned.has("sunscreen") ? undefined : "sunscreen" });
    pm.push({ id: "pm-moist", label: "Moisturize", detail: yours("moisturizer", CATEGORIES[moist].name), shopId: owned.has("moisturizer") ? undefined : moist });
    weekly.push({ id: "wk-pillow", label: "Change pillowcase", detail: c.includes("breakouts") ? "Twice a week helps with breakouts" : "Weekly" });

    const recIds: string[] = [];
    if (p.usesSpf || owned.has("sunscreen")) addKeep({ id: "keep-spf", module: "skin", title: "Your daily sunscreen", why: "The single most useful skin habit. Keep it exactly as it is." });
    else
      recIds.push(
        addRec({
          id: "skin-spf",
          module: "skin",
          title: "Wear sunscreen every morning",
          detail: "The highest-impact skin habit: it prevents dark marks, uneven tone and early lines.",
          steps: [
            "Two finger-lengths for face and neck as the last morning step.",
            p.sunReaction === "rarely" ? "Mineral sunscreens can look chalky on deeper skin; tinted mineral or chemical-filter sunscreens usually don't." : "Reapply every 2 hours when you're outdoors.",
          ],
          kind: "product",
          impact: "high",
          effort: "low",
          cost: "$",
          timeframe: "weeks",
          shopIds: ["sunscreen"],
          why: ["You said you don't wear sunscreen most days.", ...(c.includes("dark-spots") ? ["It's the foundation for fading dark marks."] : []), ...(p.sunReaction === "burns" ? ["You burn easily."] : [])],
        }),
      );
    const routineComplete = p.routine === "full" && (p.usesSpf || owned.has("sunscreen"));
    if (routineComplete && !c.length) {
      addKeep({ id: "keep-routine", module: "skin", title: "Your skincare routine", why: "You have a full routine, wear sunscreen and didn't flag any concerns. Adding products won't add much." });
    } else if (p.routine !== "full") {
      const missing = [!owned.has("cleanser") && "cleanser", !owned.has("moisturizer") && "moisturizer", !owned.has("sunscreen") && "sunscreen"].filter(Boolean) as string[];
      recIds.push(
        addRec({
          id: "skin-basics",
          module: "skin",
          title: p.routine === "none" ? "Start a simple routine" : "Round out your basics",
          detail: `Cleanse, moisturize${p.usesSpf ? ", and keep up your sunscreen" : ", sunscreen"}. Consistency for 8 weeks matters more than product count.`,
          steps: [`Morning: ${am.map((s) => lc(s.label)).join(" → ")}`, `Evening: ${pm.map((s) => lc(s.label)).join(" → ")}`, ...((["cleanser", "moisturizer", "sunscreen"] as OwnedProduct[]).some((x) => owned.has(x)) ? [`You already have: ${list((["cleanser", "moisturizer", "sunscreen"] as OwnedProduct[]).filter((x) => owned.has(x)))}. Only buy ${missing.length ? list(missing) : "nothing new"}.`] : [])],
          kind: "product",
          impact: p.routine === "none" ? "high" : "medium",
          effort: "low",
          cost: missing.length === 0 ? "free" : missing.length === 1 ? "$" : "$$",
          timeframe: "weeks",
          shopIds: [owned.has("cleanser") ? "" : cleanser, owned.has("moisturizer") ? "" : moist, owned.has("sunscreen") ? "" : "sunscreen"].filter(Boolean),
          why: [`Your routine: ${p.routine === "none" ? "nothing yet" : "basic"}.`, `Picked for ${p.skinType === "unsure" ? "skin you're not sure about" : `${p.skinType} skin`}${p.sensitive ? " that reacts easily" : ""}.`],
        }),
      );
    } else if (p.routine === "full" && !ownedActives.length) {
      addKeep({ id: "keep-routine", module: "skin", title: "Your cleanse-and-moisturize routine", why: "Keep the basics you already do; the plan only adds one thing at most." });
    }
    if (ownedActives.length) {
      const conflicts: string[] = [];
      if (owned.has("retinoid") && owned.has("exfoliating-acid")) conflicts.push("Retinoid and exfoliating acid: use them on different nights, not together.");
      if (owned.has("retinoid") && owned.has("benzoyl-peroxide")) conflicts.push("Benzoyl peroxide and a retinoid: benzoyl peroxide in the morning, retinoid at night.");
      if (ownedActives.length >= 3) conflicts.push("Three or more active products at once often irritates. Pick the one or two you like most.");
      recIds.push(
        addRec({
          id: "skin-keep-active",
          module: "skin",
          title: "Stick with the treatment product you already use",
          detail: "Most take 8–12 weeks of steady use. Adding another active now usually means more irritation, not faster results.",
          steps: ["Keep using it as you do now for 12 weeks before judging it.", ...conflicts, "Stop and see a pharmacist or dermatologist if it stings, peels a lot or burns."],
          kind: "home",
          impact: conflicts.length ? "medium" : "low",
          effort: "low",
          cost: "free",
          timeframe: "months",
          why: [`You already use ${list(ownedActives.map((x) => x.replace("-", " ")))}.`, "We never stack a new active on top of an existing one."],
        }),
      );
    }
    if (active) {
      const cat = CATEGORIES[active];
      recIds.push(
        addRec({
          id: "skin-active",
          module: "skin",
          title: `Add one targeted product for ${activeFor}`,
          detail: `${cat.name}: ${lc(cat.purpose)}`,
          steps: [
            p.sensitive || p.routine === "none" ? "Start after 2 weeks of the basic routine." : "Start now, alongside the basics.",
            `${cat.how} ${cat.frequency}.`,
            "Patch test on the jaw for 3 days first.",
            ...(cat.avoidWith?.length ? [`Don't combine with: ${cat.avoidWith.join("; ").toLowerCase()}.`] : []),
            "Mild dryness or tingling in the first weeks is common. Burning, swelling, a rash or hives means stop.",
            ...(active === "retinoid" ? ["Not if you're pregnant, trying to conceive or breastfeeding; ask a doctor."] : []),
            "Judge it at 8–12 weeks, not before.",
          ],
          kind: "product",
          impact: "medium",
          effort: p.maintenance === "low" ? "medium" : "low",
          cost: "$",
          timeframe: "months",
          shopIds: [active],
          why: [`You'd like to improve ${activeFor}.`, activeWhy, "One targeted product only; more at once tends to irritate."],
        }),
      );
    }
    if (c.includes("breakouts") || c.includes("dark-spots"))
      recIds.push(
        addRec({
          id: "skin-hands",
          module: "skin",
          why: ["You mentioned breakouts or dark marks."],
          title: "Hands off",
          detail: "Picking and squeezing is the main cause of marks that last for months, especially on skin that tans easily.",
          steps: ["Use a hydrocolloid spot patch on a spot you'd otherwise pick."],
          kind: "home",
          impact: "medium",
          effort: "medium",
          cost: "free",
          timeframe: "immediate",
        }),
      );

    const obs: Observation[] = [
      { text: `You describe your skin as ${p.skinType === "unsure" ? "not sure" : p.skinType}${p.sensitive ? " and easily irritated" : ""}.`, source: "answers" },
    ];
    if (c.length) obs.push({ text: `You'd like to improve: ${list(c.filter((x) => x !== "dark-circles" && x !== "puffiness").map((x) => x.replace("-", " ")))}.`.replace(": .", ": nothing specific."), source: "answers" });
    obs.push({ text: "We don't grade skin from photos. Lighting, camera and filters change how skin looks too much for that to be reliable.", source: "photo" });

    const notes: string[] = [];
    if (p.sunReaction === "rarely") notes.push("Skin that tans easily is more prone to dark marks after breakouts or irritation. Daily sunscreen and gentle care (no scrubs, no picking) matter most.");
    if (sensitiveSkin) notes.push("Choose products labelled 'fragrance-free'. 'Unscented' can still contain masking fragrance, and essential oils count as fragrance.");
    if (p.allergies.includes("sunscreen-filters")) notes.push("If a sunscreen filter irritates you, mineral (zinc oxide) sunscreens are an alternative. Patch test first.");
    if (p.allergies.includes("lanolin")) notes.push("Check lip balms and rich creams for lanolin.");
    if (p.allergies.includes("benzoyl-peroxide")) notes.push("We've left out benzoyl peroxide because you're sensitive to it.");
    if (p.allergies.includes("salicylates") && (c.includes("breakouts") || c.includes("razor-bumps"))) notes.push("We've swapped salicylic acid for azelaic acid because you're sensitive to salicylates.");
    if (p.natural === "prefer") notes.push("For natural/organic products, look for COSMOS or Ecocert certification on the pack. 'Natural' isn't automatically gentler: plant extracts and essential oils are common irritants.");

    const pro: string[] = [];
    if (c.includes("breakouts")) {
      pro.push("Painful, deep or scarring breakouts, or no improvement after about 12 weeks of consistent care: a dermatologist has more effective options.");
      addPro({
        who: "dermatologist",
        when: "Painful, deep or scarring breakouts, or no improvement after 12 weeks of consistent care.",
        mapQuery: "dermatologist",
        ask: ["What would you try first for my breakouts, and how long before I'd see a change?", "Is there anything in my current routine I should stop?", "How do I prevent or fade the marks?"],
        bring: ["Every product you use (photos of the labels)", "How long you've used each and what happened", ...(p.allergies.length ? ["Your allergies and sensitivities"] : [])],
      });
    }
    if (c.includes("redness")) {
      pro.push("Ongoing redness, flushing or bumps can have several causes; a dermatologist can tell you which.");
      addPro({ who: "dermatologist", when: "Persistent redness, flushing, rash, itching or scaling.", mapQuery: "dermatologist", ask: ["What's causing the redness, and what should I avoid?"], bring: ["When it flares (heat, food, products, sun)"] });
    }
    addPro({ who: "dermatologist", when: "Any new, changing, bleeding or unusual mole or spot. This app can't assess moles — see a doctor promptly.", mapQuery: "dermatologist" });

    const working: string[] = [];
    if (p.usesSpf) working.push("You already wear sunscreen, which most people skip");
    if (ownedActives.length) working.push("You already have a treatment product in your routine");
    if (p.routine === "full") working.push("You have a skin-care habit to build on");
    if (p.skinType === "normal") working.push("Balanced skin that tolerates most products");
    modules.push({
      id: "skin",
      title: "Skin",
      status: !p.usesSpf || p.routine === "none" || c.includes("breakouts") ? "priority" : c.length ? "opportunity" : "strong",
      summary: `A ${am.length + pm.length}-step daily routine${active ? ` with one targeted product for ${activeFor}` : ""}.`,
      working,
      observations: obs,
      recIds,
      pro: pro.length ? pro : undefined,
      notes,
    });
  }

  // ── EYES & BROWS ─────────────────────────────────
  {
    const recIds: string[] = [];
    const obs: Observation[] = [];
    const b = p.brows;
    if (b.length) obs.push({ text: `Brows: ${list(b.map((x) => (x === "unibrow" ? "hair between the brows" : x)))}.`, source: "answers" });
    if (b.includes("uneven") && cues?.browDiff !== undefined && cues.browDiff > 0.05)
      obs.push({ text: "In your photo one brow sits slightly higher than the other. That's very common and rarely noticed by others.", source: "photo", caveat: "Head tilt changes this." });
    if (b.length) {
      const steps: string[] = [];
      if (b.includes("unruly")) steps.push("Brush brows up; trim only hairs that go past the top line, with small scissors. Don't trim the whole brow short.");
      if (b.includes("unibrow")) steps.push("Tweeze only the hairs between the brows, one at a time, after a shower. Keep the inner ends about in line with the inner corners of your eyes.");
      if (b.includes("unruly") || b.includes("uneven")) steps.push("Tidy the tail: remove only strays below the natural line toward the temple.");
      if (b.includes("sparse")) steps.push("Stop tweezing the shape for 8–12 weeks so hair can regrow; brush up and use a clear or tinted brow gel if you like the look.");
      if (b.includes("uneven")) steps.push("Groom each brow to a similar outline using the pencil method in Guides; aim for 'sisters, not twins'.");
      steps.push("Keep natural thickness. Over-plucked brows can take months to grow back, and some don't.");
      if (b.includes("unibrow") && (p.sensitive || p.maintenance === "low")) steps.push("Prefer not to do it yourself? Threading or waxing at a brow bar takes 10 minutes; ask them to keep the natural shape.");
      recIds.push(
        addRec({
          id: "eyes-brows",
          module: "eyes",
          title: "Tidy your brows",
          detail: "Small, subtle grooming frames the eyes. Clean up strays; leave the natural shape and thickness.",
          steps,
          kind: "home",
          impact: "medium",
          effort: "low",
          cost: b.includes("unibrow") || b.includes("unruly") ? "$" : "free",
          timeframe: "immediate",
          shopIds: b.includes("unibrow") || b.includes("unruly") ? ["brow-kit"] : undefined,
          why: [`You said your brows are ${list(b.map((x) => (x === "unibrow" ? "joined in the middle" : x)))}.`],
        }),
      );
    } else addKeep({ id: "keep-brows", module: "eyes", title: "Your brows", why: "You're happy with them. Leave them alone; over-grooming is the most common brow mistake." });
    const circles = p.skinConcerns.includes("dark-circles");
    const puffy = p.skinConcerns.includes("puffiness");
    const photoDark = cues?.underEyeRatio !== undefined && cues.underEyeRatio < 0.86;
    if (photoDark) obs.push({ text: "The under-eye area looks darker than your cheeks in this photo.", source: "photo", caveat: "Overhead light casts shadows here; compare in soft, front-facing light." });
    if (circles || puffy || photoDark) {
      const steps = [
        ...(p.sleep === "<6" || p.sleep === "6-7" ? ["Aim for 7–9 hours; this has the biggest effect on tired-looking eyes."] : []),
        ...(puffy ? ["Less salt and alcohol in the evening; a cold compress for 5 minutes in the morning."] : []),
        "Sunscreen around the eyes (not on the lids) prevents darkening.",
        "Caffeine eye products can reduce puffiness a little and briefly; they won't change dark circles much.",
        "Concealer one shade lighter than your skin is an option for anyone who wants it.",
      ];
      recIds.push(
        addRec({
          id: "eyes-under",
          module: "eyes",
          title: "Look less tired",
          detail: "Sleep and sun protection first; products help only a little.",
          steps,
          kind: "lifestyle",
          impact: circles || puffy ? "medium" : "low",
          effort: "medium",
          cost: "free",
          timeframe: "weeks",
          why: [
            ...(circles ? ["You mentioned dark circles."] : []),
            ...(puffy ? ["You mentioned puffy eyes."] : []),
            ...(photoDark && !circles && !puffy ? ["Your under-eye area looked darker than your cheeks in the photo (light can cause this)."] : []),
            ...(p.sleep === "<6" || p.sleep === "6-7" ? [`You sleep ${p.sleep} hours.`] : []),
          ],
          basis: circles || puffy ? "answers" : "photo",
        }),
      );
      addPro({ who: "doctor", when: "Sudden, one-sided or painful swelling around the eyes, or swelling with vision changes.", mapQuery: "doctor" });
    }
    if (p.glasses) {
      const strong = p.glassesRx === "strong";
      const heavyFace = beardChoice === "full" || beardChoice === "short-boxed";
      const steps = [
        `Frame types to try: ${FRAMES[shape]}`,
        `Style: ${({ smart: "thin metal or slim acetate reads polished", classic: "tortoiseshell acetate or thin gold-tone metal, nothing logo-heavy", street: "thicker acetate or a bold colour works as a statement", minimal: "thin metal, rimless or clear/tortoise acetate", athletic: "lightweight frames that stay put; wraparound sport sunglasses for training", rugged: "thicker acetate or a browline frame" } as Partial<Record<StyleVibe, string>>)[p.vibe] ?? "tortoise or dark acetate is the easiest everyday choice"}.`,
        ...(heavyFace ? ["With a fuller beard, a lighter or thinner frame keeps the face from looking crowded."] : []),
        ...(bestCutDef?.length === "buzz" ? ["With very short hair, frames become a focal point, so it's a good place for a bit of character."] : []),
        ...(strong ? ["Strong prescription: smaller, rounder lenses and high-index lenses keep them thinner and lighter; very large frames make lenses thicker at the edges."] : []),
        "In the shop: the frame is about as wide as your face with no gap or pressure at the temples.",
        "Your eyes sit roughly in the middle of each lens.",
        "The top of the frame follows or sits just below your brows, not cutting through them.",
        "The bridge sits flat without sliding; if frames slip, ask for adjustable nose pads or a 'low bridge' / 'Asian fit' option.",
        "Smile: the frames shouldn't lift off your nose. Arms should reach behind the ears without pressing.",
      ];
      recIds.push(
        addRec({
          id: "eyes-frames",
          module: "eyes",
          title: "Choose frames that fit, not just suit",
          detail: "Fit (width, bridge and brow line) matters as much as shape. Next time you replace your glasses or buy sunglasses.",
          steps,
          kind: "home",
          impact: "medium",
          effort: "low",
          cost: "free",
          timeframe: "months",
          why: [`You wear glasses.`, `Your face shape (${SHAPE_LABEL[shape].toLowerCase()}) and ${VIBE_NAME[p.vibe]} style narrow the options.`, ...(strong ? ["You have a strong prescription."] : [])],
        }),
      );
      addPro({ who: "optician", when: "Fitting new frames. Ask them to adjust the bridge and arms before you leave.", mapQuery: "optician", ask: ["Which lens index keeps my lenses thin?", "Can you adjust the nose pads and arms so they don't slip?"] });
    }
    modules.push({
      id: "eyes",
      title: "Eyes, brows & glasses",
      status: recIds.length ? (circles || b.length ? "opportunity" : "opportunity") : "strong",
      summary: recIds.length ? "Small grooming and sleep changes." : "Nothing you flagged here.",
      working: [],
      observations: obs,
      recIds,
    });
  }

  // ── SMILE & LIPS ─────────────────────────────────
  {
    const recIds: string[] = [];
    const t = p.teeth;
    const obs: Observation[] = [];
    if (t.length) obs.push({ text: `Smile: ${list(t.map((x) => (x === "whiter" ? "you'd like whiter teeth" : x)))}.`, source: "answers" });
    if (input.photoSlots.includes("smile")) obs.push({ text: "Your smile photo is saved for your own reference.", source: "photo", caveat: "We don't assess teeth, bite or gums from photos." });
    if (p.floss !== "daily")
      recIds.push(addRec({ id: "smile-floss", module: "smile", title: "Floss once a day", detail: "Cleans where brushing can't and keeps gums healthy. Pair it with brushing at night so it sticks.", steps: ["Floss, then brush 2 minutes with fluoride toothpaste.", "Spit, don't rinse."], kind: "lifestyle", impact: "medium", effort: "low", cost: "$", timeframe: "weeks", shopIds: ["floss"], why: [`You floss ${p.floss}.`] }));
    else addKeep({ id: "keep-floss", module: "smile", title: "Daily flossing", why: "Already the habit that matters most for your smile." });
    const whitenWait = t.includes("sensitivity") || t.includes("gums");
    if (t.includes("staining") || t.includes("whiter"))
      recIds.push(
        addRec({
          id: "smile-stain",
          module: "smile",
          title: "Reduce surface stains",
          detail: "Rinse with water after coffee, tea or wine, and use a fluoride whitening toothpaste.",
          steps: ["Drink staining drinks with a meal or through a straw.", whitenWait ? "Hold off on whitening strips until a dentist has looked at the sensitivity or gums you mentioned." : "Whitening strips or trays: get a dental check-up first, especially with fillings or crowns (they don't whiten)."],
          kind: "product",
          impact: "medium",
          effort: "low",
          cost: "$",
          timeframe: "weeks",
          shopIds: whitenWait ? undefined : ["whitening-paste"],
          why: [t.includes("staining") ? "You mentioned staining." : "You'd like whiter teeth.", ...(whitenWait ? ["You also mentioned sensitivity or gums, so whitening waits for a dentist."] : [])],
        }),
      );
    const lipsDry = p.skinType === "dry" || p.skinConcerns.includes("dryness");
    if (lipsDry || p.facialHair === "full")
      recIds.push(addRec({ id: "smile-lips", module: "smile", title: lipsDry ? "Keep lips from cracking" : "Lip care", detail: "A plain balm at night and one with SPF during the day.", steps: ["Don't lick or peel dry lips.", "Keep moustache hair trimmed above the lip line."], kind: "product", impact: "low", effort: "low", cost: "$", timeframe: "immediate", shopIds: ["lip-balm"], why: [lipsDry ? "Your skin tends to be dry." : "Moustache hair over the lip dries it out."] }));
    if (t.includes("sensitivity") || t.includes("gums")) {
      addPro({
        who: "dentist",
        when: "Tooth sensitivity, bleeding or receding gums, or before any whitening.",
        mapQuery: "dentist",
        ask: ["What's causing the sensitivity or bleeding?", "Is whitening safe for my teeth, fillings or crowns, and which method?"],
        bring: ["What you noticed and when (sensitivity to cold, bleeding when brushing)", "Whitening products you've used"],
      });
      recIds.push(addRec({ id: "smile-dentist", module: "smile", title: "See a dentist", detail: "Sensitivity and gum changes are worth a professional look, and a check-up makes any whitening safer.", steps: [], kind: "professional", impact: "medium", effort: "medium", cost: "$$", timeframe: "weeks", why: ["You mentioned sensitivity or bleeding gums."] }));
    }
    if (t.includes("alignment"))
      addPro({
        who: "orthodontist",
        when: "Questions about tooth alignment, bite or jaw position. These can't be assessed from photos.",
        mapQuery: "orthodontist",
        ask: ["Is treatment worth it for me, or is this cosmetic only?", "What are the options (clear aligners, braces, retainers), how long, and what does it cost?", "Anything about my bite or jaw I should know?"],
        bring: ["What bothers you about your alignment", "Any jaw pain, clicking or teeth grinding"],
      });
    modules.push({
      id: "smile",
      title: "Smile & lips",
      status: t.length ? "opportunity" : p.floss === "daily" ? "strong" : "opportunity",
      summary: "Everyday habits only. Bite, alignment and dental health need a dentist.",
      working: p.floss === "daily" ? ["You floss daily"] : [],
      observations: obs,
      recIds,
      pro: t.includes("alignment") ? ["Alignment and bite need an orthodontist or dentist; they can't be judged from photos."] : undefined,
    });
  }

  // ── STYLE ────────────────────────────────────────
  {
    const recIds: string[] = [];
    const fit: string[] = [];
    if (p.fitIssues.includes("tops-loose")) fit.push("Buy tops by shoulder fit: the seam should sit at the edge of your shoulder.");
    if (p.fitIssues.includes("tops-tight")) fit.push("Size up or choose regular/relaxed cuts; pulling across the chest looks smaller, not bigger.");
    if (p.fitIssues.includes("pants-long")) fit.push("Hem trousers to a slight or no break.");
    if (p.fitIssues.includes("pants-baggy")) fit.push("Choose a tapered or slim-straight leg.");
    recIds.push(addRec({ id: "style-closet", module: "style", title: "Edit your closet first", detail: "Remove anything that doesn't fit at the shoulders or waist, then build 3 outfits from what's left. Free, and it tells you what's actually missing.", steps: [PALETTE[p.contrast].tip, ...fit], kind: "home", impact: "medium", effort: "medium", cost: "free", timeframe: "immediate", why: ["Starting with what you own avoids buying things you don't need.", ...(p.fitIssues.length ? ["You flagged fit problems."] : [])] }));
    if (p.fitIssues.length)
      recIds.push(addRec({ id: "style-tailor", module: "style", title: "Get key pieces tailored", detail: "Hemming trousers and taking in a shirt changes how everything looks, for little money.", steps: ["Bring the shoes you'll wear with the trousers."], kind: "professional", impact: "high", effort: "low", cost: "$", timeframe: "weeks", shopIds: ["tailoring"], why: [`You said: ${list(p.fitIssues.map((f) => ({ "tops-loose": "tops hang loose", "tops-tight": "tops feel tight", "pants-long": "pants bunch at the ankle", "pants-baggy": "pants are too baggy" })[f]))}.`] }));
    const niche = NICHES.find((n) => n.id === VIBE_NICHE[p.vibe]) ?? NICHES[1];
    const formalWork = p.dressCode === "formal" || p.dressCode === "smart";
    const workNiche = formalWork && niche.id !== "smart-casual" && niche.id !== "old-money" ? NICHES.find((n) => n.id === "smart-casual") : undefined;
    const count = p.budget === "low" ? 4 : p.budget === "mid" ? 6 : 7;
    const capsule = [...piecesFor(niche, p.presentation).slice(0, workNiche ? count - 2 : count), ...(workNiche ? piecesFor(workNiche, p.presentation).slice(0, 2) : [])];
    const needsClothes = p.fitIssues.length > 0 || p.goal === "work" || p.goal === "event" || p.vibe !== "unsure";
    if (!p.fitIssues.length) addKeep({ id: "keep-fit", module: "style", title: "Clothes that fit", why: "You didn't flag fit problems, so don't replace what works. Fill gaps only." });
    recIds.push(
      addRec({
        id: "style-capsule",
        module: "style",
        title: `Your ${niche.title.split(" /")[0].toLowerCase()} capsule`,
        detail: `${count} pieces in ${PALETTE[p.contrast].colors.split(", ").slice(0, 3).join(", ")}. Only buy what you don't already own in a fit that works.`,
        steps: [
          ...capsule.map((i) => `• ${i}`),
          ...(workNiche ? ["The last two are for your smart/formal dress code."] : []),
          CAPSULE[p.budget].note,
          "Before buying anything, check your closet: skip each piece you already have that fits.",
          `Shopping online? Measure: ${MEASUREMENTS.slice(0, 3).map((m) => m.split(" (")[0].toLowerCase()).join(", ")}, and compare with the size chart.`,
        ],
        kind: "product",
        impact: needsClothes ? "medium" : "low",
        effort: "medium",
        cost: p.budget === "low" ? "$$" : "$$$",
        timeframe: "weeks",
        shopIds: ["capsule"],
        why: [
          `You picked ${VIBE_NAME[p.vibe]} style and a ${p.budget === "low" ? "tight" : p.budget === "mid" ? "moderate" : "flexible"} budget (${count} pieces).`,
          `Colours from your ${p.contrast} hair–skin contrast.`,
          ...(workNiche ? ["Your work or school dress code is smart or formal."] : []),
        ],
      }),
    );
    const obs: Observation[] = [
      { text: `Hair–skin contrast: ${p.contrast}. Undertone: ${p.undertone === "unsure" ? "not sure" : p.undertone}.`, source: "answers" },
    ];
    if (p.build !== "skip" || p.height !== "skip") obs.push({ text: `Build: ${p.build === "skip" ? "not given" : p.build}; height: ${p.height === "skip" ? "not given" : p.height}.`, source: "answers", caveat: "We don't estimate body measurements from photos." });
    const notes = [
      `Necklines for a ${SHAPE_LABEL[shape].toLowerCase()} face: ${lc(NECKLINES[shape])}`,
      UNDERTONE[p.undertone],
      ...(p.build !== "skip" ? BUILD[p.build] : []),
      ...(p.height !== "skip" ? [HEIGHT[p.height]] : []),
      ...(p.allergies.includes("nickel") ? ["For jewelry, belt buckles and watches, look for 'nickel-free', titanium or surgical-grade stainless steel."] : []),
      "Keep jewelry minimal and in the metal that suits your undertone.",
    ];
    modules.push({
      id: "style",
      title: "Style & fit",
      status: p.fitIssues.length && p.goal !== "overall" ? "priority" : "opportunity",
      summary: `${p.fitIssues.length ? "Fit first, then colors." : "Your colors and a few well-fitting basics."}`,
      working: [],
      observations: obs,
      recIds,
      notes,
    });
    if (p.fitIssues.length) addPro({ who: "tailor", when: "Hemming trousers or taking in shirts and jackets.", mapQuery: "tailor alterations", ask: ["Can this be taken in at the waist, or is the shoulder the problem?", "Slight break or no break for these trousers?"], bring: ["The shoes you'll wear with the trousers"] });
  }

  // ── BODY & POSTURE ───────────────────────────────
  if (bodyOn) {
    const recIds: string[] = [];
    const trainsWell = p.training === "3-4" || p.training === "5+";
    if (trainsWell && p.bodyGoal === "maintain") addKeep({ id: "keep-training", module: "body", title: "Your training", why: "You train consistently and want to maintain. Keep doing what you're doing." });
    else if (p.bodyGoal !== "posture")
      recIds.push(
        addRec({
          id: "body-train",
          module: "body",
          why: [`You train ${p.training === "0" ? "rarely" : `${p.training} times a week`} and your goal is to ${p.bodyGoal === "leaner" ? "get leaner" : p.bodyGoal === "build" ? "build muscle" : "maintain"}.`],
          title: p.training === "0" || p.training === "1-2" ? "Train 2–3 times a week" : "Keep training, add progression",
          detail: p.bodyGoal === "leaner" ? "Strength training plus 8–10k steps a day; aim to lose no more than about 0.5–1% of body weight a week." : p.bodyGoal === "build" ? "Progressive strength training with enough protein (roughly 1.6 g per kg of body weight is a common target) and a small calorie surplus." : "Consistent strength training keeps your shape and posture.",
          steps: ["Full-body sessions: a squat or leg press, a push, a pull and a carry.", "Add a little weight or a rep each week."],
          kind: "lifestyle",
          impact: "high",
          effort: "high",
          cost: "free",
          timeframe: "months",
        }),
      );
    recIds.push(addRec({ id: "body-posture", module: "body", title: "10-minute posture routine", detail: "Posture changes how clothes hang and how you look in photos, quickly.", steps: ["Chin tucks: 2 × 10 daily.", "Wall slides: 2 × 10, 3–4 times a week.", "Band pull-aparts or rows: 3 × 12–15 on training days."], kind: "lifestyle", impact: p.bodyGoal === "posture" ? "high" : "medium", effort: "low", cost: "free", timeframe: "weeks", why: [p.bodyGoal === "posture" ? "Better posture is your body goal." : "Posture affects how clothes fit and how you look in photos, whatever your goal."] }));
    if (p.sleep === "<6" || p.sleep === "6-7")
      recIds.push(addRec({ id: "body-sleep", module: "body", title: "Protect your sleep", detail: "7–9 hours helps skin, eyes, training recovery and appetite.", steps: ["Same wake-up time every day, including weekends.", "Screens off 30 minutes before bed."], kind: "lifestyle", impact: "medium", effort: "medium", cost: "free", timeframe: "weeks", why: [`You sleep ${p.sleep} hours on a typical night.`] }));
    addPro({ who: "doctor", when: "Before a new training or diet plan if you have an injury or health condition.", mapQuery: "doctor" });
    modules.push({
      id: "body",
      title: "Body, posture & sleep",
      status: "opportunity",
      summary: "Consistent training, posture and sleep. No body-fat estimates from photos.",
      working: p.training === "3-4" || p.training === "5+" ? ["You already train consistently"] : [],
      observations: [{ text: `Training ${p.training === "0" ? "rarely" : `${p.training} times a week`}; goal: ${p.bodyGoal}; sleep ${p.sleep} hours.`, source: "answers" }],
      recIds,
      notes: ["Leaner isn't automatically a better look; very low body fat is hard to sustain and not required to look good."],
    });
  }

  // Barber always; therapist if needed.
  addPro({ who: "barber", when: "Every few weeks, with your 'Show my barber' card.", ask: ["Does this cut work with my cowlicks and growth pattern?", "How should I style it at home, and with what?"], bring: ["Your 'Show my barber' card", "A photo of the cut when it looked its best"], mapQuery: bestCutDef && (bestCutDef.length === "long" || bestCutDef.presentations[0] === "feminine") ? "hair salon" : "barber shop" });
  let wellbeing: string | undefined;
  if (p.worry === "often") {
    wellbeing =
      "You mentioned appearance worries affect your day a lot. That's more common than people think. This plan is deliberately short (a few steps, no photo-based observations, check-ins every 4 weeks), and doing less is fine. If the worries take up a lot of time, or stop you doing things you'd like to do, a doctor or therapist can help — you don't have to handle it alone.";
    addPro({ who: "therapist", when: "Appearance worries that take up a lot of time or get in the way of daily life.", mapQuery: "therapist", ask: ["I spend a lot of time worrying about how I look. Is there support that could help?"] });
  }

  // ── Feedback: drop what the user said isn't for them ──
  const hidden: NonNullable<Analysis["hidden"]> = [];
  const ownedShop = new Set<string>();
  const visible = recs.filter((r) => {
    const f = notFor(r.id, r.ref);
    if (!f) return true;
    hidden.push({ id: r.ref ? `${r.id}:${r.ref}` : r.id, title: r.title, reason: f.reason });
    if (f.reason === "own" || f.reason === "tried") r.shopIds?.forEach((x) => ownedShop.add(x));
    return false;
  });
  // Options the user rejected that the engine then replaced (e.g. a haircut) are listed too, so they can be restored.
  for (const [key, f] of Object.entries(fb)) {
    if (f.verdict !== "not" || hidden.some((h) => h.id === key)) continue;
    const [id, ref] = key.split(":");
    if (!ref) continue;
    const name = id === "hair-cut" ? CUTS.find((c) => c.id === ref)?.name : id === "beard-shape" ? BEARDS.find((b) => b.id === ref)?.name : undefined;
    if (name) hidden.push({ id: key, title: `${id === "hair-cut" ? "Haircut" : "Facial hair"}: ${name}`, reason: f.reason });
  }
  // If the targeted skin product was declined, take it out of the routine too.
  if (!visible.some((r) => r.id === "skin-active") && !ownedActives.length) {
    for (const arr of [am, pm]) {
      const i = arr.findIndex((x) => x.id.endsWith("-active"));
      if (i >= 0) arr.splice(i, 1);
    }
  }

  // ── Prioritize ───────────────────────────────────
  const LIGHT_SKIP = new Set(["smile-lips", "smile-stain", "eyes-brows", "eyes-under", "style-capsule", "hair-product", "hair-texture", "body-train"]);
  let ranked = [...visible].sort((a, b) => priorityScore(b, p, fbFor(b.id, b.ref)) - priorityScore(a, p, fbFor(a.id, a.ref)));
  if (light) ranked = ranked.filter((r) => !LIGHT_SKIP.has(r.id)).slice(0, 6);
  const inPlan = new Set(ranked.map((r) => r.id));
  const top3: string[] = [];
  const seenMod = new Set<ModuleId>();
  for (const r of ranked) {
    if (top3.length === 3) break;
    // Professional visits rarely belong in a top-3 unless the user reported something recent.
    if (seenMod.has(r.module) || (r.kind === "professional" && r.impact !== "high")) continue;
    // A recommendation resting only on a photo cue never makes the top 3.
    if (r.basis === "photo") continue;
    top3.push(r.id);
    seenMod.add(r.module);
  }
  const horizonOf = (r: Rec, i: number): Horizon => {
    if (top3.includes(r.id)) return r.timeframe === "immediate" ? "today" : "week";
    if (i < 8) return "month";
    return light ? "month" : "later";
  };
  let todayCount = 0;
  const tasks: Task[] = ranked.map((r, i) => {
    let h = horizonOf(r, i);
    if (h === "today" && todayCount >= 3) h = "week";
    if (h === "today") todayCount++;
    return { id: r.id, title: r.title, module: r.module, horizon: h, done: false };
  });
  modules.forEach((m) => {
    m.recIds = m.recIds.filter((id) => inPlan.has(id));
    if (light) m.observations = m.observations.filter((o) => o.source !== "photo" || m.id === "face");
    const inTop = m.recIds.some((id) => top3.includes(id));
    if (m.status === "priority" && !inTop) m.status = "opportunity";
    if (inTop) m.status = "priority";
    if (!m.recIds.length && m.status !== "strong") m.status = keep.some((k) => k.module === m.id) ? "strong" : m.status;
  });

  // ── Shop list: only what the visible plan needs, minus what they own ──
  const shopIds = new Set<string>();
  ranked.forEach((r) => r.shopIds?.forEach((x) => shopIds.add(x)));
  [...am, ...pm].forEach((st) => st.shopId && shopIds.add(st.shopId));
  const OWNED_TO_SHOP: Partial<Record<OwnedProduct, string[]>> = {
    cleanser: ["cleanser-gel", "cleanser-cream"],
    moisturizer: ["moist-light", "moist-rich"],
    sunscreen: ["sunscreen"],
    retinoid: ["retinoid"],
    "exfoliating-acid": ["bha"],
    azelaic: ["azelaic"],
    niacinamide: ["niacinamide"],
    "anti-dandruff": ["anti-dandruff"],
    "hair-product": ["hair-product"],
    trimmer: ["trimmer"],
  };
  owned.forEach((o) => OWNED_TO_SHOP[o]?.forEach((x) => ownedShop.add(x)));
  const shop = buildShop(p, [...shopIds], bestCutDef, ownedShop);

  const working = modules.flatMap((m) => m.working).slice(0, 6);
  if (working.length < 2) working.push("You've set clear goals, which is what makes a plan stick");

  const analysis: Analysis = {
    version: 2,
    id: `a-${now.getTime()}`,
    createdAt: now.toISOString(),
    faceShape: shape,
    faceShapeSource: input.faceShapeSource,
    measurements,
    cues,
    photoChecks,
    working,
    modules,
    recs: ranked,
    top3,
    haircuts,
    beard,
    routine: { am, pm, weekly },
    shop,
    pros,
    wellbeing,
    keep,
    hairline,
    hidden,
    light,
  };
  return { analysis, tasks };
}

// ─── Shop builder ─────────────────────────────────────────────────
export function buildShop(p: Profile, ids: string[], cut?: Cut, owned: Set<string> = new Set()): ShopItem[] {
  const out: ShopItem[] = [];
  for (const id of ids) {
    const c = CATEGORIES[id];
    if (!c) continue;
    const flags = [...(c.flags ?? [])];
    const skinOrLip = c.module === "skin" || id === "lip-balm";
    if (skinOrLip && (p.fragranceFree || p.sensitive || p.allergies.includes("fragrance") || p.allergies.includes("essential-oils"))) flags.unshift("Choose fragrance-free");
    if (p.allergies.includes("lanolin") && (id === "lip-balm" || id === "moist-rich")) flags.push("Check for lanolin");
    if ((p.vegan || p.crueltyFree) && (c.module === "skin" || ["lip-balm", "hair-product", "anti-dandruff", "whitening-paste"].includes(id)))
      flags.push(`Check the pack for ${[p.vegan ? "vegan" : "", p.crueltyFree ? "Leaping Bunny / cruelty-free" : ""].filter(Boolean).join(" and ")} certification`);
    let name = c.name;
    let onlineQuery = c.onlineQuery;
    if (id === "hair-product" && cut && cut.product !== "none") {
      name = PRODUCT_LABEL[cut.product];
      onlineQuery = HAIR_PRODUCT_QUERY[cut.product];
    }
    const consumable = c.module === "skin" || ["lip-balm", "hair-product", "anti-dandruff", "whitening-paste"].includes(id);
    const preferenceNote =
      p.natural !== "none" && consumable
        ? c.naturalNote ?? "Prefer natural/organic? Look for COSMOS or Ecocert certification rather than 'natural' marketing, and patch test: plant extracts can irritate."
        : undefined;
    out.push({
      id,
      group: c.group,
      name,
      purpose: c.purpose,
      replaces: c.replaces,
      how: c.how,
      when: c.when,
      frequency: c.frequency,
      avoidWith: c.avoidWith,
      ingredients: c.ingredients?.map((k) => INGREDIENTS[k]),
      price: localPrice(c.price[p.budget], p.country),
      cheaper: c.cheaper,
      preferenceNote,
      examples: c.examples,
      flags,
      localQuery: c.localQuery,
      onlineQuery: onlineQuery ? withPrefs(onlineQuery, p) : "",
      freeFirst: c.freeFirst,
      moduleId: c.module,
      owned: owned.has(id) || undefined,
    });
  }
  const order = { essentials: 0, grooming: 1, optional: 2, style: 3 };
  return out.sort((a, b) => order[a.group] - order[b.group]);
}

export const STATUS_LABEL: Record<Status, string> = { strong: "Strong", opportunity: "Opportunity", priority: "Priority" };
