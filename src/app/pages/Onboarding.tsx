import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check, Clock, ScanFace, ShieldCheck, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/marketing/Logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { ChoiceGroup, MultiChoice, YesNo } from "../components/Choices";
import { PhotoInput } from "../components/PhotoInput";
import { scanFace, type ScanResult } from "../engine/detector";
import { classifyShape, SHAPE_DESCRIPTION, SHAPE_LABEL } from "../engine/face";
import { analyze } from "../engine/analyze";
import { COUNTRIES } from "../engine/local";
import { daysSince, reanalyzeDays, useRebuild } from "../useRebuild";
import type { Analysis, FaceShape, OwnedProduct, PhotoSlot, Profile, StoredPhoto } from "../types";
import { PlanBuild, ScanStage } from "../visuals/sequences/AnalysisSequence";
import { seen } from "../xp";

const STEPS = ["You", "Skin", "Hair", "Face", "Style", "Shopping", "Photos"] as const;
type Draft = Partial<Profile>;

const REQUIRED: Record<number, (keyof Profile)[]> = {
  0: ["goal", "age", "presentation", "country", "maintenance"],
  1: ["skinType", "routine", "usesSpf", "sensitive", "sunReaction"],
  2: ["hairType", "hairDensity", "hairLength", "hairlineShape", "hairlineChange", "lastCut", "cutHappy", "sides"],
  3: ["facialHair", "glasses", "floss"],
  4: ["vibe", "budget", "contrast", "undertone", "training", "bodyGoal", "sleep"],
  5: ["natural", "shopping", "proOpen"],
};

const DEFAULTS: Partial<Profile> = {
  skinConcerns: [], hairConcerns: [], fitIssues: [], brows: [], teeth: [], allergies: [],
  beardPref: "open", build: "skip", owned: [], hairHabits: [], dressCode: "skip", height: "skip", worry: "skip", fragranceFree: false, vegan: false, crueltyFree: false,
};

const SLOTS: { slot: PhotoSlot; label: string; hint: string; required?: boolean; facing?: "user" | "environment" }[] = [
  { slot: "front", label: "Front", hint: "Straight on, neutral face, hair as you usually wear it.", required: true },
  { slot: "hairline", label: "Hairline", hint: "Hair pushed back off the forehead, facing the camera." },
  { slot: "left", label: "Left side", hint: "Turn 90° to your right so we see your left profile." },
  { slot: "right", label: "Right side", hint: "Turn 90° to your left so we see your right profile." },
  { slot: "crown", label: "Top / crown", hint: "Ask someone, or hold the phone above your head.", facing: "environment" },
  { slot: "smile", label: "Smile", hint: "Relaxed natural smile. For your own reference only." },
  { slot: "body", label: "Full body", hint: "Head to shoes, your usual outfit.", facing: "environment" },
];

const HEADINGS = [
  ["About you", "Your goal, where you are and how much time you want to spend. This keeps the plan realistic."],
  ["Your skin", "Answer from how your skin usually behaves. We don't judge skin from photos: lighting changes it too much."],
  ["Your hair & hairline", "What you have now and what you're open to. Hairline questions help us suggest cuts that work with it."],
  ["Face & grooming", "Facial hair, brows, glasses and smile habits. Skip anything that doesn't apply."],
  ["Style & body", "So suggestions fit your taste, budget and build. Build and height are optional."],
  ["Shopping & preferences", "Used to filter products and find places near you. Nothing here is required beyond the first three."],
  ["Add your photos", "Good photos give better results. Only the front photo is required. Everything stays on this device."],
] as const;

/** What each answer changes, shown before the photo step so the last bit of effort has a visible payoff. */
const answerEffects = (d: Draft): string[] => {
  const out: string[] = [];
  const goal = { work: "First impressions at work come first", dating: "First impressions in photos and in person come first", event: "Quick wins before your event come first", confidence: "Small, visible changes you'll notice daily come first", overall: "The biggest overall differences come first" }[d.goal ?? "overall"];
  if (goal) out.push(goal);
  if (d.maintenance) out.push({ low: "Routines kept under 5 minutes a day", medium: "Routines of 5 to 15 minutes a day", high: "Fuller routines, since you enjoy it" }[d.maintenance]);
  if (d.hairType) out.push(`Haircuts that work with ${d.hairType} hair`);
  if (d.budget) out.push({ low: "Products picked for a tight budget", mid: "Products picked for a moderate budget", high: "Products picked for results first" }[d.budget]);
  return out.slice(0, 4);
};

const Onboarding = () => {
  usePageMeta("Set up your plan");
  const { state, latest, saveProfile, savePhotos, addAnalysis } = useApp();
  const rebuild = useRebuild();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const wantsPhotos = params.get("step") === "photos" && !!state.profile;
  const cooldown = latest ? Math.max(0, reanalyzeDays(state.profile?.worry) - daysSince(latest.createdAt)) : 0;

  const [step, setStep] = useState(wantsPhotos ? 6 : 0);
  const [draft, setDraft] = useState<Draft>({ ...DEFAULTS, ...(state.profile ?? {}) });
  const [missing, setMissing] = useState<string | null>(null);
  // Neutral age screen: "Under 18" is a normal option (no nudging), and it stops setup.
  const [minor, setMinor] = useState(false);
  // Explicit consent before any face analysis runs. Remembered on this device after the first time.
  const [consent, setConsent] = useState(() => !!seen.get().faceConsent);
  const [photos, setPhotos] = useState<Partial<Record<PhotoSlot, string>>>(wantsPhotos ? {} : Object.fromEntries(state.photos.map((p) => [p.slot, p.dataUrl])));
  const [phase, setPhase] = useState<"form" | "scanning" | "result" | "cooldown" | "building">(wantsPhotos && cooldown > 0 ? "cooldown" : "form");
  const [scanDone, setScanDone] = useState(false);
  const [built, setBuilt] = useState<Analysis | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [shape, setShape] = useState<FaceShape | null>(null);
  const [shapeSource, setShapeSource] = useState<"measured" | "chosen">("measured");
  const [confidence, setConfidence] = useState<"high" | "low">("high");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step, phase]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setMissing(null);
  };

  /** "What do you already use?" is split across steps but stored in one list. */
  const ownedPart = (keys: OwnedProduct[]) => ({
    value: (draft.owned ?? []).filter((k) => keys.includes(k)),
    onChange: (v: OwnedProduct[]) => set("owned", [...(draft.owned ?? []).filter((k) => !keys.includes(k)), ...v]),
  });
  const SKIN_OWNED: OwnedProduct[] = ["cleanser", "moisturizer", "sunscreen", "retinoid", "exfoliating-acid", "benzoyl-peroxide", "azelaic", "vitamin-c", "niacinamide"];

  const validate = () => {
    if (step === 0 && minor) {
      setMissing("GlowMax is for adults 18 and over, so we can't set up a plan for you.");
      return false;
    }
    const gap = (REQUIRED[step] ?? []).find((k) => draft[k] === undefined);
    if (gap) {
      setMissing("Answer the questions on this step to continue. Optional ones are marked.");
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validate()) return;
    // Existing members updating answers can rebuild without new photos.
    if (step === 5 && latest) {
      setStep(6);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const rebuildOnly = () => {
    rebuild({ ...DEFAULTS, ...draft } as Profile);
    navigate("/app/analysis?updated=1", { replace: true });
  };

  const runScan = async () => {
    if (!photos.front) {
      setMissing("Add a front-facing photo to continue.");
      return;
    }
    if (!consent) {
      setMissing("Tick the box to agree to the on-device face analysis, then try again.");
      document.getElementById("face-consent")?.focus();
      return;
    }
    seen.set("faceConsent", new Date().toISOString());
    setScanDone(false);
    setPhase("scanning");
    const started = Date.now();
    let res: ScanResult;
    try {
      res = await scanFace(photos.front);
    } catch {
      res = { detected: false, measurements: null, checks: [], modelAvailable: false };
    }
    await new Promise((r) => setTimeout(r, Math.max(0, 1900 - (Date.now() - started))));
    setScan(res);
    // Show the found landmarks briefly (real points), then move on.
    setScanDone(true);
    await new Promise((r) => setTimeout(r, !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 1300 : 300));
    if (res.measurements) {
      const c = classifyShape(res.measurements);
      setShape(c.shape);
      setConfidence(c.confidence);
      setShapeSource("measured");
    } else {
      setShape(null);
      setShapeSource("chosen");
    }
    setPhase("result");
  };

  const finish = () => {
    if (!shape) return;
    const profile = { ...DEFAULTS, ...draft } as Profile;
    const now = new Date().toISOString();
    const stored: StoredPhoto[] = (Object.entries(photos) as [PhotoSlot, string | undefined][]).filter(([, v]) => !!v).map(([slot, dataUrl]) => ({ slot, dataUrl: dataUrl!, takenAt: now }));
    saveProfile(profile);
    savePhotos(stored);
    const { analysis, tasks } = analyze({
      profile,
      faceShape: shape,
      faceShapeSource: shapeSource,
      measurements: scan?.measurements ?? undefined,
      cues: scan?.cues,
      photoChecks: scan?.checks ?? [],
      photoSlots: stored.map((s) => s.slot),
      feedback: state.feedback,
    });
    addAnalysis(analysis, tasks);
    setBuilt(analysis);
    setPhase("building");
  };

  // ── Cooldown ──────────────────────────────────────────
  if (phase === "cooldown") {
    return (
      <Shell step={6} onExit={() => navigate("/app")}>
        <div className="mx-auto max-w-lg text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
            <Clock className="h-5 w-5 text-silver-bright" aria-hidden="true" />
          </span>
          <h1 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-2xl font-semibold text-foreground outline-none">
            Your next photo analysis opens in {cooldown} day{cooldown === 1 ? "" : "s"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Real changes from a haircut, routine or training take a couple of weeks to show. Re-scanning sooner mostly picks up differences in lighting and
            angle, which can be misleading. You can still update your answers now; your plan will rebuild using your current photos.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" className="btn-primary" onClick={() => { setPhase("form"); setStep(0); }}>Update my answers</button>
            <Link to="/app" className="btn-secondary">Back to today</Link>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Scanning ──────────────────────────────────────────
  if (phase === "scanning") {
    return (
      <Shell step={6} onExit={() => navigate("/app")}>
        <div role="status" aria-live="polite">
          <ScanStage photo={photos.front} done={scanDone} outline={scan?.outline} />
          <h1 ref={headingRef} tabIndex={-1} className="mt-8 text-center font-display text-2xl font-semibold text-foreground outline-none">
            {scanDone ? "Areas mapped" : "Reading your photo…"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-muted-foreground">Everything runs on this device. Your photo isn't uploaded.</p>
        </div>
      </Shell>
    );
  }

  if (phase === "building" && built) {
    return (
      <Shell step={6} onExit={() => navigate("/app")}>
        <PlanBuild analysis={built} onDone={() => navigate("/app/analysis?new=1", { replace: true })} />
      </Shell>
    );
  }

  // ── Result: photo check + face shape ──────────────────
  if (phase === "result" && scan) {
    const bad = scan.checks.filter((c) => !c.ok);
    const measured = scan.measurements ? classifyShape(scan.measurements).shape : null;
    return (
      <Shell step={6} onExit={() => navigate("/app")}>
        <div className="mx-auto max-w-2xl">
          <h1 ref={headingRef} tabIndex={-1} className="font-display text-3xl font-semibold text-foreground outline-none">
            {bad.length ? "Check your photo" : scan.detected ? "Confirm your face shape" : "Choose your face shape"}
          </h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            {bad.length
              ? "A retake will make your recommendations more accurate. You can also continue as is."
              : scan.detected
                ? confidence === "high"
                  ? `From your photo, your face reads as ${SHAPE_LABEL[shape!].toLowerCase()}. It guides haircut, facial hair, glasses and collar suggestions. Change it if it doesn't look right.`
                  : `Your face sits between a couple of shapes. Our best guess is ${SHAPE_LABEL[shape!].toLowerCase()}; pick the one that looks most like you.`
                : scan.modelAvailable
                  ? "We couldn't find a face in that photo. Retake it, or pick the shape that looks most like you."
                  : "The face scan couldn't load on this device. Pick the shape that looks most like you; you can re-scan later."}
          </p>

          {scan.checks.length > 0 && (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Photo check">
              {scan.checks.map((c) => (
                <li key={c.id} className={cn("flex items-start gap-2 rounded-xl border p-3 text-sm", c.ok ? "border-white/10" : "border-amber-400/30 bg-amber-400/[0.06]")}>
                  {c.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />}
                  <span>
                    <span className="text-foreground">{c.label}</span>
                    {c.tip && <span className="block text-xs leading-5 text-muted-foreground">{c.tip}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {bad.length > 0 && (
            <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => { setPhase("form"); setStep(6); }}>
              Retake photo
            </button>
          )}

          <fieldset className="mt-8">
            <legend className="text-[15px] font-medium text-foreground">Face shape</legend>
            <p className="mt-1 text-sm text-muted-foreground">A styling guide, not a judgment. No shape is better than another.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(Object.keys(SHAPE_LABEL) as FaceShape[]).map((s) => {
                const on = shape === s;
                return (
                  <label key={s} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-white/40", on ? "border-white/35 bg-white/[0.08]" : "border-white/10 hover:border-white/20")}>
                    <input type="radio" name="shape" value={s} className="sr-only" checked={on} onChange={() => { setShape(s); setShapeSource(measured === s ? "measured" : "chosen"); }} />
                    <ShapeGlyph shape={s} active={on} />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {SHAPE_LABEL[s]}
                        {measured === s && <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-muted-foreground">From photo</span>}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{SHAPE_DESCRIPTION[s]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button type="button" disabled={!shape} onClick={finish} className="btn-primary mt-8 disabled:opacity-50">
            Build my plan
          </button>
        </div>
      </Shell>
    );
  }

  // ── Questionnaire ─────────────────────────────────────
  const growsHair = draft.facialHair && draft.facialHair !== "not-applicable";
  return (
    <Shell step={step} onExit={() => navigate(state.analyses.length ? "/app" : "/")}>
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · about {[1, 1, 1, 1, 1, 1, 2][step]} min</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-1 font-display text-3xl font-semibold text-foreground outline-none">{HEADINGS[step][0]}</h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">{HEADINGS[step][1]}</p>

        <div className="mt-8 space-y-8">
          {step === 0 && (
            <>
              <div>
                <label htmlFor="name" className="text-[15px] font-medium text-foreground">First name <span className="font-normal text-muted-foreground">(optional)</span></label>
                <input id="name" value={draft.name ?? ""} onChange={(e) => set("name", e.target.value)} autoComplete="given-name" className="mt-2 h-12 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[15px] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40" />
              </div>
              <ChoiceGroup legend="Main goal" name="goal" value={draft.goal} onChange={(v) => set("goal", v)} options={[
                { value: "work", label: "Look sharper for work" }, { value: "dating", label: "Dating" }, { value: "event", label: "A specific event soon" },
                { value: "confidence", label: "Feel more confident" }, { value: "overall", label: "Look more put-together overall" },
              ]} />
              <ChoiceGroup legend="Age" name="age" columns={3} value={minor ? "under-18" : draft.age} onChange={(v) => {
                if (v === "under-18") { setMinor(true); setDraft((d) => ({ ...d, age: undefined })); setMissing(null); return; }
                setMinor(false); set("age", v as Profile["age"]);
              }} options={[
                { value: "under-18", label: "Under 18" }, { value: "18-24", label: "18–24" }, { value: "25-34", label: "25–34" }, { value: "35-44", label: "35–44" }, { value: "45+", label: "45+" },
              ]} />
              {minor && (
                <p role="status" className="rounded-xl border border-white/10 p-4 text-sm leading-6 text-muted-foreground">
                  GlowMax is built for adults, so setup stops here. If you're working on skin or hair, a GP, pharmacist or a trusted adult is a good place to start.
                </p>
              )}
              <ChoiceGroup legend="Which haircut and style suggestions do you want?" help="Only changes the examples we show." name="presentation" columns={3} value={draft.presentation} onChange={(v) => set("presentation", v)} options={[
                { value: "masculine", label: "Menswear" }, { value: "feminine", label: "Womenswear" }, { value: "neutral", label: "Show me both" },
              ]} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className="text-[15px] font-medium text-foreground">Country</label>
                  <select id="country" value={draft.country ?? ""} onChange={(e) => set("country", e.target.value as Profile["country"])} className="mt-2 h-12 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[15px] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                    <option value="" disabled>Choose…</option>
                    {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">For currency, units and where to shop.</p>
                </div>
                <div>
                  <label htmlFor="area" className="text-[15px] font-medium text-foreground">Postcode or city <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <input id="area" value={draft.area ?? ""} onChange={(e) => set("area", e.target.value)} placeholder="e.g. M5V or Toronto" autoComplete="postal-code" className="mt-2 h-12 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[15px] text-foreground placeholder:text-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40" />
                  <p className="mt-1 text-xs text-muted-foreground">Only used to search maps for shops and barbers near you.</p>
                </div>
              </div>
              <ChoiceGroup legend="How much daily time do you want to spend?" name="maintenance" columns={3} value={draft.maintenance} onChange={(v) => set("maintenance", v)} options={[
                { value: "low", label: "Minimal", hint: "Under 5 min" }, { value: "medium", label: "Some", hint: "5–15 min" }, { value: "high", label: "I enjoy it", hint: "15+ min" },
              ]} />
            </>
          )}

          {step === 1 && (
            <>
              <ChoiceGroup legend="Skin type" help="Not sure? Wash your face and wait an hour. Shiny all over = oily; tight or flaky = dry; shiny forehead and nose only = combination." name="skinType" value={draft.skinType} onChange={(v) => set("skinType", v)} options={[
                { value: "oily", label: "Oily" }, { value: "combination", label: "Combination" }, { value: "normal", label: "Normal" }, { value: "dry", label: "Dry" }, { value: "unsure", label: "Not sure" },
              ]} />
              <MultiChoice legend="Anything you'd like to improve?" value={draft.skinConcerns ?? []} onChange={(v) => set("skinConcerns", v)} noneLabel="Nothing specific" options={[
                { value: "breakouts", label: "Breakouts" }, { value: "dark-spots", label: "Dark marks / uneven tone" }, { value: "texture", label: "Texture / pores" }, { value: "redness", label: "Redness" },
                { value: "dryness", label: "Dryness" }, { value: "fine-lines", label: "Fine lines" }, { value: "dark-circles", label: "Dark circles" }, { value: "puffiness", label: "Puffy eyes" }, { value: "razor-bumps", label: "Razor bumps" },
              ]} />
              <ChoiceGroup legend="What happens when you're in the sun without protection?" help="Helps us tailor sunscreen and dark-mark advice." name="sun" columns={3} value={draft.sunReaction} onChange={(v) => set("sunReaction", v)} options={[
                { value: "burns", label: "Burn easily" }, { value: "sometimes", label: "Burn, then tan" }, { value: "rarely", label: "Rarely burn" },
              ]} />
              <ChoiceGroup legend="Current routine" name="routine" columns={3} value={draft.routine} onChange={(v) => set("routine", v)} options={[
                { value: "none", label: "Nothing / body wash" }, { value: "basic", label: "Basic", hint: "Cleanser, maybe moisturizer" }, { value: "full", label: "Full routine" },
              ]} />
              <YesNo legend="Do you wear sunscreen on your face most days?" name="spf" value={draft.usesSpf} onChange={(v) => set("usesSpf", v)} />
              <YesNo legend="Does your skin react easily to new products?" help="Stinging, redness or itching." name="sensitive" value={draft.sensitive} onChange={(v) => set("sensitive", v)} />
              <MultiChoice legend="What do you already use? (optional)" help="So we don't tell you to buy things you own, and never stack a second active on top of one you use." noneLabel="None of these" {...ownedPart(SKIN_OWNED)} options={[
                { value: "cleanser", label: "Face cleanser" }, { value: "moisturizer", label: "Moisturizer" }, { value: "sunscreen", label: "Face sunscreen" },
                { value: "retinoid", label: "Retinol / adapalene / tretinoin" }, { value: "exfoliating-acid", label: "Exfoliating acid (salicylic, glycolic)" }, { value: "benzoyl-peroxide", label: "Benzoyl peroxide" },
                { value: "azelaic", label: "Azelaic acid" }, { value: "vitamin-c", label: "Vitamin C" }, { value: "niacinamide", label: "Niacinamide" },
              ]} />
            </>
          )}

          {step === 2 && (
            <>
              <ChoiceGroup legend="Hair type" name="hairType" value={draft.hairType} onChange={(v) => set("hairType", v)} options={[
                { value: "straight", label: "Straight" }, { value: "wavy", label: "Wavy", hint: "Loose S-shape" }, { value: "curly", label: "Curly", hint: "Defined curls" }, { value: "coily", label: "Coily", hint: "Tight curls or coils" },
              ]} />
              <ChoiceGroup legend="Density" help="Can you easily see your scalp through your hair? Yes = fine; a little = medium; no = thick." name="density" columns={3} value={draft.hairDensity} onChange={(v) => set("hairDensity", v)} options={[
                { value: "thick", label: "Thick" }, { value: "medium", label: "Medium" }, { value: "fine", label: "Fine" },
              ]} />
              <ChoiceGroup legend="Length you'd like" name="hairLength" columns={3} value={draft.hairLength} onChange={(v) => set("hairLength", v)} options={[
                { value: "short", label: "Short" }, { value: "medium", label: "Medium" }, { value: "long", label: "Long" },
              ]} />
              <ChoiceGroup legend="Sides" name="sides" columns={3} value={draft.sides} onChange={(v) => set("sides", v)} options={[
                { value: "tight", label: "Short / faded" }, { value: "medium", label: "Medium" }, { value: "full", label: "Fuller, over the ears" },
              ]} />
              <ChoiceGroup legend="Hairline shape" help="Look in a mirror with hair pushed back." name="hairline" value={draft.hairlineShape} onChange={(v) => set("hairlineShape", v)} options={[
                { value: "straight", label: "Straight across" }, { value: "rounded", label: "Rounded" }, { value: "m-shape", label: "M-shape", hint: "Higher at the temples" }, { value: "uneven", label: "Uneven" }, { value: "unsure", label: "Not sure" },
              ]} />
              <ChoiceGroup legend="Have you noticed your hairline or density changing over time?" name="hairlineChange" columns={3} value={draft.hairlineChange} onChange={(v) => set("hairlineChange", v)} options={[
                { value: "no", label: "No" }, { value: "yes", label: "Yes" }, { value: "unsure", label: "Not sure" },
              ]} />
              {(draft.hairlineChange === "yes" || draft.hairlineChange === "unsure") && (
                <div className="space-y-6 rounded-2xl border border-white/10 p-4">
                  <p className="text-sm leading-6 text-muted-foreground">A few optional follow-ups. They help us choose between styling around it, tracking it, changing hair care, or suggesting a professional. We never diagnose from these.</p>
                  <ChoiceGroup legend="When did you first notice a change?" name="hairlineSince" columns={3} value={draft.hairlineSince} onChange={(v) => set("hairlineSince", v)} options={[
                    { value: "<6m", label: "Under 6 months" }, { value: "6-12m", label: "6–12 months" }, { value: "1-3y", label: "1–3 years" }, { value: "3y+", label: "3+ years" }, { value: "unsure", label: "Not sure" },
                  ]} />
                  <ChoiceGroup legend="Noticed more shedding than usual? (shower, pillow, brush)" name="shedding" columns={3} value={draft.shedding} onChange={(v) => set("shedding", v)} options={[
                    { value: "no", label: "No" }, { value: "yes", label: "Yes" }, { value: "unsure", label: "Not sure" },
                  ]} />
                  <ChoiceGroup legend="Family history of thinning or receding?" name="familyHistory" columns={3} value={draft.familyHistory} onChange={(v) => set("familyHistory", v)} options={[
                    { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "Not sure" }, { value: "skip", label: "Prefer not to say" },
                  ]} />
                </div>
              )}
              <MultiChoice legend="Anything else?" value={draft.hairConcerns ?? []} onChange={(v) => set("hairConcerns", v)} noneLabel="None" options={[
                { value: "thinning", label: "Thinning" }, { value: "frizz", label: "Frizz" }, { value: "flat", label: "Falls flat" }, { value: "oily-scalp", label: "Oily scalp" }, { value: "dandruff", label: "Flakes" }, { value: "sensitive-scalp", label: "Sensitive / itchy scalp" }, { value: "cowlick", label: "Cowlick" },
              ]} />
              <MultiChoice legend="Do any of these regularly? (optional)" help="They affect hair care advice and fair photo comparisons." value={draft.hairHabits ?? []} onChange={(v) => set("hairHabits", v)} noneLabel="None" options={[
                { value: "tight-styles", label: "Tight ponytails, braids or buns" }, { value: "chemical", label: "Bleach, relaxer or perm" }, { value: "heat", label: "Heat styling most days" }, { value: "concealers", label: "Hair fibres / concealers" },
              ]} />
              <ChoiceGroup legend="Last haircut" name="lastCut" columns={3} value={draft.lastCut} onChange={(v) => set("lastCut", v)} options={[
                { value: "under-4w", label: "Under 4 weeks" }, { value: "4-8w", label: "4–8 weeks" }, { value: "8w-plus", label: "8+ weeks" },
              ]} />
              <ChoiceGroup legend="How do you feel about your current haircut?" help="If you like it, we won't tell you to change it." name="cutHappy" columns={3} value={draft.cutHappy} onChange={(v) => set("cutHappy", v)} options={[
                { value: "yes", label: "I like it" }, { value: "mostly", label: "It's OK" }, { value: "no", label: "I want a change" },
              ]} />
              <MultiChoice legend="Already own? (optional)" noneLabel="Neither" {...ownedPart(["anti-dandruff", "hair-product"])} options={[
                { value: "anti-dandruff", label: "Anti-dandruff shampoo" }, { value: "hair-product", label: "A styling product I like" },
              ]} />
            </>
          )}

          {step === 3 && (
            <>
              <ChoiceGroup legend="Facial hair" name="facialHair" value={draft.facialHair} onChange={(v) => set("facialHair", v)} options={[
                { value: "full", label: "Grows in full" }, { value: "patchy", label: "Grows in patchy" }, { value: "none", label: "I keep it shaved" }, { value: "not-applicable", label: "Doesn't apply to me" },
              ]} />
              {growsHair && (
                <ChoiceGroup legend="What would you like?" name="beardPref" value={draft.beardPref} onChange={(v) => set("beardPref", v)} options={[
                  { value: "open", label: "Open to suggestions" }, { value: "clean", label: "Clean-shaven" }, { value: "stubble", label: "Stubble" }, { value: "beard", label: "A beard" },
                ]} />
              )}
              <MultiChoice legend="Brows" value={draft.brows ?? []} onChange={(v) => set("brows", v)} noneLabel="Happy with them" options={[
                { value: "sparse", label: "Sparse" }, { value: "unruly", label: "Unruly / long hairs" }, { value: "unibrow", label: "Hair between them" }, { value: "uneven", label: "Uneven" },
              ]} />
              <YesNo legend="Do you wear glasses?" name="glasses" value={draft.glasses} onChange={(v) => set("glasses", v)} />
              {draft.glasses && (
                <ChoiceGroup legend="Prescription (optional)" help="Strong prescriptions change which frames work best." name="glassesRx" columns={3} value={draft.glassesRx} onChange={(v) => set("glassesRx", v)} options={[
                  { value: "mild", label: "Mild" }, { value: "strong", label: "Strong / thick lenses" }, { value: "unsure", label: "Not sure" },
                ]} />
              )}
              {growsHair && (
                <MultiChoice legend="Already own a beard trimmer?" noneLabel="No" {...ownedPart(["trimmer"])} options={[{ value: "trimmer", label: "Yes" }]} />
              )}
              <MultiChoice legend="Smile" help="Self-reported only. We don't assess teeth from photos." value={draft.teeth ?? []} onChange={(v) => set("teeth", v)} noneLabel="No concerns" options={[
                { value: "staining", label: "Staining" }, { value: "whiter", label: "Want whiter teeth" }, { value: "sensitivity", label: "Sensitive teeth" }, { value: "gums", label: "Gums bleed" }, { value: "alignment", label: "Alignment / bite" },
              ]} />
              <ChoiceGroup legend="How often do you floss?" name="floss" columns={3} value={draft.floss} onChange={(v) => set("floss", v)} options={[
                { value: "daily", label: "Daily" }, { value: "sometimes", label: "Sometimes" }, { value: "rarely", label: "Rarely" },
              ]} />
            </>
          )}

          {step === 4 && (
            <>
              <ChoiceGroup legend="Style you like" name="vibe" value={draft.vibe} onChange={(v) => set("vibe", v)} options={[
                { value: "clean-casual", label: "Clean casual" }, { value: "smart", label: "Smart casual" }, { value: "classic", label: "Old money / quiet luxury" }, { value: "street", label: "Streetwear" },
                { value: "minimal", label: "Minimal" }, { value: "athletic", label: "Athletic" }, { value: "rugged", label: "Rugged / workwear" }, { value: "unsure", label: "Not sure yet" },
              ]} />
              <ChoiceGroup legend="Budget for the next few months (products + clothes)" name="budget" columns={3} value={draft.budget} onChange={(v) => set("budget", v)} options={[
                { value: "low", label: "Tight" }, { value: "mid", label: "Moderate" }, { value: "high", label: "Flexible" },
              ]} />
              <ChoiceGroup legend="Dress code at work or school" help="Used for haircut and wardrobe suggestions." name="dressCode" value={draft.dressCode} onChange={(v) => set("dressCode", v)} options={[
                { value: "casual", label: "Casual" }, { value: "smart", label: "Smart casual" }, { value: "formal", label: "Formal / suits" }, { value: "uniform", label: "Uniform" }, { value: "skip", label: "Doesn't apply" },
              ]} />
              <MultiChoice legend="Fit problems you notice" value={draft.fitIssues ?? []} onChange={(v) => set("fitIssues", v)} noneLabel="None" options={[
                { value: "tops-loose", label: "Tops hang loose" }, { value: "tops-tight", label: "Tops feel tight" }, { value: "pants-long", label: "Pants bunch at the ankle" }, { value: "pants-baggy", label: "Pants too baggy" },
              ]} />
              <ChoiceGroup legend="Contrast between your hair and skin" help="Dark hair with light skin = high. Similar depth = low." name="contrast" columns={3} value={draft.contrast} onChange={(v) => set("contrast", v)} options={[
                { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" },
              ]} />
              <ChoiceGroup legend="Which looks better next to your face?" help="A simple stylist test for undertone." name="undertone" value={draft.undertone} onChange={(v) => set("undertone", v)} options={[
                { value: "cool", label: "Silver" }, { value: "warm", label: "Gold" }, { value: "neutral", label: "Both" }, { value: "unsure", label: "Not sure" },
              ]} />
              <div className="grid gap-6 sm:grid-cols-2">
                <ChoiceGroup legend="Build (optional)" name="build" columns={1} value={draft.build} onChange={(v) => set("build", v)} options={[
                  { value: "slim", label: "Slim" }, { value: "average", label: "Average" }, { value: "broad", label: "Broad / muscular" }, { value: "heavier", label: "Heavier" }, { value: "skip", label: "Prefer not to say" },
                ]} />
                <ChoiceGroup legend="Height (optional)" name="height" columns={1} value={draft.height} onChange={(v) => set("height", v)} options={[
                  { value: "shorter", label: "Shorter than average" }, { value: "average", label: "Average" }, { value: "taller", label: "Taller than average" }, { value: "skip", label: "Prefer not to say" },
                ]} />
              </div>
              <ChoiceGroup legend="Training per week" name="training" columns={3} value={draft.training} onChange={(v) => set("training", v)} options={[
                { value: "0", label: "None" }, { value: "1-2", label: "1–2" }, { value: "3-4", label: "3–4" }, { value: "5+", label: "5+" },
              ]} />
              <ChoiceGroup legend="Body goal" name="bodyGoal" value={draft.bodyGoal} onChange={(v) => set("bodyGoal", v)} options={[
                { value: "leaner", label: "Get leaner" }, { value: "build", label: "Build muscle" }, { value: "posture", label: "Better posture" }, { value: "maintain", label: "Maintain" }, { value: "skip", label: "Skip this area" },
              ]} />
              <ChoiceGroup legend="Sleep on a typical night" name="sleep" columns={3} value={draft.sleep} onChange={(v) => set("sleep", v)} options={[
                { value: "<6", label: "Under 6 h" }, { value: "6-7", label: "6–7 h" }, { value: "7-9", label: "7–9 h" }, { value: "9+", label: "9+ h" },
              ]} />
            </>
          )}

          {step === 5 && (
            <>
              <ChoiceGroup legend="Do you prefer natural or organic products?" help="We'll show what to look for on labels. Natural isn't automatically safer or more effective." name="natural" columns={3} value={draft.natural} onChange={(v) => set("natural", v)} options={[
                { value: "prefer", label: "Prefer natural/organic" }, { value: "mix", label: "Mix of both" }, { value: "none", label: "No preference" },
              ]} />
              <ChoiceGroup legend="Where do you like to shop?" name="shopping" columns={3} value={draft.shopping} onChange={(v) => set("shopping", v)} options={[
                { value: "local", label: "Local stores" }, { value: "online", label: "Online" }, { value: "both", label: "Both" },
              ]} />
              <ChoiceGroup legend="Open to seeing a professional (dermatologist, dentist) if it would help?" name="proOpen" columns={3} value={draft.proOpen} onChange={(v) => set("proOpen", v)} options={[
                { value: "yes", label: "Yes" }, { value: "maybe", label: "Maybe" }, { value: "no", label: "Rather not" },
              ]} />
              <fieldset>
                <legend className="text-[15px] font-medium text-foreground">Product preferences <span className="font-normal text-muted-foreground">(optional)</span></legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {([["fragranceFree", "Fragrance-free"], ["vegan", "Vegan"], ["crueltyFree", "Cruelty-free"]] as const).map(([k, l]) => (
                    <label key={k} className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm focus-within:ring-2 focus-within:ring-white/40", draft[k] ? "border-white/35 bg-white/[0.1] text-foreground" : "border-white/10 text-muted-foreground")}>
                      <input type="checkbox" className="sr-only" checked={!!draft[k]} onChange={(e) => set(k, e.target.checked)} />
                      {draft[k] && <Check className="h-3.5 w-3.5" aria-hidden="true" />} {l}
                    </label>
                  ))}
                </div>
              </fieldset>
              <MultiChoice legend="Known allergies or sensitivities (optional)" help="Only ones you already know about. We use this to leave things out; we can't test for allergies." value={draft.allergies ?? []} onChange={(v) => set("allergies", v)} noneLabel="None I know of" options={[
                { value: "fragrance", label: "Fragrance" }, { value: "essential-oils", label: "Essential oils" }, { value: "salicylates", label: "Aspirin / salicylates" }, { value: "benzoyl-peroxide", label: "Benzoyl peroxide" },
                { value: "lanolin", label: "Lanolin" }, { value: "sunscreen-filters", label: "Some sunscreens" }, { value: "nickel", label: "Nickel (jewelry)" },
              ]} />
              <YesNo legend="Do you usually dislike how you look in photos? (optional)" help="Very common, and usually about the camera more than your face. We'll start with photo basics." name="photoDislike" value={draft.photoDislike} onChange={(v) => set("photoDislike", v)} />
              <ChoiceGroup legend="How much do worries about your appearance affect your day? (optional)" help="Helps us pace your plan. Your answer stays on this device." name="worry" value={draft.worry} onChange={(v) => set("worry", v)} options={[
                { value: "rarely", label: "Rarely" }, { value: "sometimes", label: "Sometimes" }, { value: "often", label: "A lot" }, { value: "skip", label: "Prefer not to say" },
              ]} />
            </>
          )}

          {step === 6 && (
            <>
              {latest && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-muted-foreground">
                  <p className="text-foreground">Only changed answers?</p>
                  <p className="mt-1">Rebuild your plan with the photos you already added. New photos are best every {reanalyzeDays(state.profile?.worry)}+ days.</p>
                  <button type="button" onClick={() => { if (validate()) rebuildOnly(); }} className="btn-primary btn-sm mt-3">Rebuild with current photos</button>
                </div>
              )}
              {!latest && answerEffects(draft).length > 0 && (
                <section aria-labelledby="effects-h" className="rounded-2xl border border-white/10 p-4">
                  <h2 id="effects-h" className="font-display text-base font-semibold text-foreground">Your answers, your plan</h2>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {answerEffects(draft).map((e) => (
                      <li key={e} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ede6d6]" aria-hidden="true" />{e}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-foreground">One photo left. It sets your haircut and frame suggestions.</p>
                </section>
              )}
              <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <li className="flex gap-2"><Sun className="mt-0.5 h-4 w-4 shrink-0 text-silver-bright" aria-hidden="true" />Face a window in daylight. No light behind you.</li>
                <li className="flex gap-2"><ScanFace className="mt-0.5 h-4 w-4 shrink-0 text-silver-bright" aria-hidden="true" />Arm's length, lens at eye level, relaxed face.</li>
                <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-silver-bright" aria-hidden="true" />No filters, beauty mode, hats or glasses.</li>
              </ul>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {SLOTS.map((s) => (
                  <PhotoInput key={s.slot} label={s.label} hint={s.hint} required={s.required} facing={s.facing} value={photos[s.slot]} onChange={(v) => setPhotos((p) => ({ ...p, [s.slot]: v }))} />
                ))}
              </div>
              <p className="flex gap-2 rounded-xl border border-white/10 p-3 text-sm leading-6 text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-silver-bright" aria-hidden="true" />
                Photos are checked and saved only in this browser on this device. Hairline, side and crown photos are for tracking over time; we don't diagnose hair or skin from photos.
              </p>
              <label htmlFor="face-consent" className="flex cursor-pointer gap-3 rounded-xl border border-white/10 p-3 text-sm leading-6 text-foreground focus-within:ring-2 focus-within:ring-white/40">
                <input id="face-consent" type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setMissing(null); }} className="mt-1 h-4 w-4 shrink-0 accent-white" />
                <span>
                  I agree that GlowMax measures facial landmarks in my photos, on this device, to build my plan. The photos and measurements stay in this browser and I can delete them any time in Settings. To run the scan, my browser downloads the open-source model from Google's tfhub.dev; my photo is not sent.{" "}
                  <Link to="/privacy#photos" className="underline underline-offset-4" target="_blank" rel="noopener noreferrer">How photos are handled</Link>
                </span>
              </label>
            </>
          )}
        </div>

        {missing && <p role="alert" className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-sm text-amber-100">{missing}</p>}

        <div className="sticky bottom-0 -mx-4 mt-10 flex items-center justify-between gap-3 glass-bar border-t border-white/[0.07] px-4 py-4 sm:static sm:bg-none sm:backdrop-filter-none sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button type="button" onClick={() => (step === 0 ? navigate(state.analyses.length ? "/app" : "/") : setStep(step - 1))} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>
          {step < 6 ? (
            <button type="button" onClick={next} className="btn-primary">Continue</button>
          ) : latest && cooldown > 0 ? (
            <span className="text-sm text-muted-foreground">New photo analysis in {cooldown} days</span>
          ) : (
            <button type="button" onClick={runScan} className="btn-primary">Check my photos</button>
          )}
        </div>
      </div>
    </Shell>
  );
};

const Shell = ({ step, onExit, children }: { step: number; onExit: () => void; children: React.ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-white/[0.07]">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link to="/" aria-label="Home"><LogoMark /></Link>
        <ol className="flex flex-1 items-center justify-center gap-1.5 px-4" aria-label="Setup progress">
          {STEPS.map((s, i) => (
            <li key={s} className={cn("h-1.5 flex-1 rounded-full sm:max-w-14", i <= step ? "bg-foreground" : "bg-white/15")} aria-current={i === step ? "step" : undefined}>
              <span className="sr-only">{s}{i < step ? " (done)" : ""}</span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={onExit} className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label="Exit setup" title="Exit setup">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
    <main id="main" className="px-4 pb-10 pt-8 sm:pt-12">{children}</main>
  </div>
);

const SHAPE_PATHS: Record<FaceShape, string> = {
  oval: "M20 3 C31 3 35 12 35 22 C35 33 28 41 20 41 C12 41 5 33 5 22 C5 12 9 3 20 3 Z",
  round: "M20 5 C31 5 36 13 36 22 C36 32 29 39 20 39 C11 39 4 32 4 22 C4 13 9 5 20 5 Z",
  square: "M7 6 C12 4 28 4 33 6 C35 14 35 26 34 33 C30 39 10 39 6 33 C5 26 5 14 7 6 Z",
  oblong: "M9 2 C14 1 26 1 31 2 C33 12 33 30 31 37 C27 42 13 42 9 37 C7 30 7 12 9 2 Z",
  heart: "M4 8 C8 3 32 3 36 8 C37 18 33 28 26 35 C23 39 17 39 14 35 C7 28 3 18 4 8 Z",
  diamond: "M20 2 C25 5 34 14 35 20 C34 28 26 38 20 41 C14 38 6 28 5 20 C6 14 15 5 20 2 Z",
};
const ShapeGlyph = ({ shape, active }: { shape: FaceShape; active: boolean }) => (
  <svg viewBox="0 0 40 44" className="h-11 w-10 shrink-0" aria-hidden="true">
    <path d={SHAPE_PATHS[shape]} fill={active ? "hsl(0 0% 100% / 0.12)" : "none"} stroke={active ? "hsl(0 0% 95%)" : "hsl(0 0% 60%)"} strokeWidth="1.6" />
  </svg>
);

export default Onboarding;
