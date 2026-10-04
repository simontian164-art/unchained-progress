import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import type { AgeRange, Goal } from "../types";
import { GUIDANCE, PhotoRejected, preparePhoto, type CheckStage } from "../digital/photoCheck";
import { IMAGE_KINDS, type ImageKind, type PreparedImage, type UnitSystem } from "../digital/types";
import { useDigitalProfile } from "../digital/useDigitalProfile";
import { AccountGate } from "../digital/AccountGate";
import { FlowShell, PortraitFrame, PoseGuide } from "../digital/ui";
import { inRange, inToCm, kgToLb, lbToKg, cmToFtIn, cmToIn, round1, RANGES, type MeasureKey } from "../digital/units";

const GOALS: { value: Goal; label: string }[] = [
  { value: "overall", label: "Look more put-together" }, { value: "work", label: "Look sharper for work" }, { value: "dating", label: "Dating" },
  { value: "event", label: "A specific event" }, { value: "confidence", label: "Feel more confident" },
];
const AGES: AgeRange[] = ["18-24", "25-34", "35-44", "45+"];
const STAGE_TEXT: Record<CheckStage, string> = { file: "Reading photo…", dimensions: "Checking size…", person: "Checking the photo…", encode: "Preparing…" };

type Shot = PreparedImage & { url: string };
type Step = "intro" | ImageKind | "details" | "saving";

// ─── one photo ───────────────────────────────────────────────────────────
const PhotoStep = ({ kind, shot, onShot }: { kind: ImageKind; shot?: Shot; onShot: (s: Shot | undefined) => void }) => {
  const meta = IMAGE_KINDS.find((k) => k.kind === kind)!;
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<CheckStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const take = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      const p = await preparePhoto(kind, file, setStage);
      onShot({ ...p, url: URL.createObjectURL(p.blob) });
    } catch (e) {
      setError(e instanceof PhotoRejected ? e.message : "Couldn't use that photo. Try another.");
      onShot(undefined);
    } finally {
      setStage(null);
      if (camera.current) camera.current.value = "";
      if (library.current) library.current.value = "";
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:items-start">
      {/* Sized to the viewport height on phones so the capture buttons stay on screen without scrolling. */}
      <PortraitFrame ratio={meta.area === "head" ? "3/4" : "9/16"} className="mx-auto w-full md:mx-0" style={{ maxWidth: `min(340px, calc(48svh * ${meta.area === "head" ? 0.75 : 0.5625}))` }}>
        {shot ? <img src={shot.url} alt={`Your ${meta.label.toLowerCase()} photo`} className="absolute inset-0 h-full w-full object-cover" /> : <PoseGuide area={meta.area} />}
        {stage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60" role="status" aria-live="polite">
            <Loader2 className="h-6 w-6 animate-spin text-[#ede6d6] motion-reduce:animate-none" aria-hidden="true" />
            <span className="text-sm text-[#ede6d6]">{STAGE_TEXT[stage]}</span>
          </div>
        )}
      </PortraitFrame>
      <div className="flex flex-col">
        {/* Phones: action first, tips below. Larger screens: tips first. */}
        <ul className="order-2 mt-6 space-y-2 text-[15px] leading-6 text-muted-foreground md:order-1 md:mt-0">
          {GUIDANCE[kind].map((g) => <li key={g} className="flex gap-2.5"><span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#cdbb93]" />{g}</li>)}
        </ul>
        <div className="order-1 md:order-2">
        <input ref={camera} type="file" accept="image/*" capture={meta.area === "head" ? "user" : "environment"} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => take(e.target.files?.[0])} />
        <input ref={library} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => take(e.target.files?.[0])} />
        <div className="flex flex-col gap-3 sm:flex-row md:mt-6">
          <button type="button" disabled={!!stage} onClick={() => camera.current?.click()} className="btn-primary disabled:opacity-60"><Camera className="h-4 w-4" aria-hidden="true" /> {shot ? "Retake" : "Take photo"}</button>
          <button type="button" disabled={!!stage} onClick={() => library.current?.click()} className="btn-secondary disabled:opacity-60"><ImagePlus className="h-4 w-4" aria-hidden="true" /> Choose from library</button>
        </div>
        <div aria-live="polite" className="mt-4 space-y-2">
          {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/[0.06] p-3 text-sm leading-6 text-red-100">{error}</p>}
          {shot && !error && (
            <>
              <p className="flex items-center gap-2 text-sm text-foreground"><Check className="h-4 w-4 text-[#cdbb93]" aria-hidden="true" /> {shot.checks.person === "passed" ? "Looks good." : "Photo added."}</p>
              {shot.checks.warnings.map((w) => <p key={w} className="text-sm leading-6 text-muted-foreground">{w}</p>)}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

// ─── measurements ────────────────────────────────────────────────────────
interface Details { units: UnitSystem; ageRange?: AgeRange; goal?: Goal; heightCm?: number; weightKg?: number; waistCm?: number; chestCm?: number; shoulderCm?: number }

const NumField = ({ id, label, value, onChange, suffix, optional, step = 1 }: { id: string; label: string; value?: number; onChange: (v: number | undefined) => void; suffix: string; optional?: boolean; step?: number }) => (
  <div>
    <label htmlFor={id} className="text-[15px] font-medium text-foreground">{label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}</label>
    <div className="relative mt-2">
      <input id={id} type="number" inputMode="decimal" step={step} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} className="h-12 w-full rounded-xl border border-white/[0.14] bg-white/[0.03] px-4 pr-14 text-[17px] tabular-nums text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40" />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>
    </div>
  </div>
);

const DetailsStep = ({ d, set }: { d: Details; set: (p: Partial<Details>) => void }) => {
  const imp = d.units === "imperial";
  const ftin = d.heightCm !== undefined ? cmToFtIn(d.heightCm) : undefined;
  const len = (k: "waistCm" | "chestCm" | "shoulderCm", label: string) => (
    <NumField id={k} label={label} optional suffix={imp ? "in" : "cm"} step={0.5}
      value={d[k] === undefined ? undefined : imp ? round1(cmToIn(d[k]!)) : d[k]}
      onChange={(v) => set({ [k]: v === undefined ? undefined : imp ? round1(inToCm(v)) : v })} />
  );
  return (
    <div className="max-w-xl space-y-6">
      <div role="radiogroup" aria-label="Units" className="inline-flex rounded-full border border-white/10 p-1">
        {(["metric", "imperial"] as const).map((u) => (
          <button key={u} type="button" role="radio" aria-checked={d.units === u} onClick={() => set({ units: u })} className={cn("hit rounded-full px-4 py-2 text-sm", d.units === u ? "bg-white/[0.12] text-foreground" : "text-muted-foreground")}>
            {u === "metric" ? "cm, kg" : "ft, lb"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {imp ? (
          <div>
            <span className="text-[15px] font-medium text-foreground">Height</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["ft", "in"] as const).map((u) => (
                <div key={u} className="relative">
                  <label htmlFor={`h-${u}`} className="sr-only">Height, {u === "ft" ? "feet" : "inches"}</label>
                  <input id={`h-${u}`} type="number" inputMode="numeric" value={ftin ? ftin[u === "ft" ? "ft" : "inch"] : ""} onChange={(e) => {
                    const v = e.target.value === "" ? 0 : Number(e.target.value);
                    const ft = u === "ft" ? v : ftin?.ft ?? 0;
                    const inch = u === "in" ? v : ftin?.inch ?? 0;
                    set({ heightCm: ft || inch ? round1(inToCm(ft * 12 + inch)) : undefined });
                  }} className="h-12 w-full rounded-xl border border-white/[0.14] bg-white/[0.03] px-4 pr-10 text-[17px] tabular-nums text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40" />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{u}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <NumField id="height" label="Height" suffix="cm" value={d.heightCm} onChange={(v) => set({ heightCm: v })} />
        )}
        <NumField id="weight" label="Weight" suffix={imp ? "lb" : "kg"} step={imp ? 1 : 0.1} value={d.weightKg === undefined ? undefined : imp ? Math.round(kgToLb(d.weightKg)) : d.weightKg} onChange={(v) => set({ weightKg: v === undefined ? undefined : imp ? round1(lbToKg(v)) : v })} />
        <div>
          <label htmlFor="age" className="text-[15px] font-medium text-foreground">Age range</label>
          <select id="age" value={d.ageRange ?? ""} onChange={(e) => set({ ageRange: e.target.value as AgeRange })} className="mt-2 h-12 w-full rounded-xl border border-white/[0.14] bg-white/[0.03] px-4 text-[17px] text-foreground">
            <option value="" disabled>Choose…</option>
            {AGES.map((a) => <option key={a} value={a}>{a.replace("-", "–")}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="goal" className="text-[15px] font-medium text-foreground">Current goal</label>
          <select id="goal" value={d.goal ?? ""} onChange={(e) => set({ goal: e.target.value as Goal })} className="mt-2 h-12 w-full rounded-xl border border-white/[0.14] bg-white/[0.03] px-4 text-[17px] text-foreground">
            <option value="" disabled>Choose…</option>
            {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>
      <details className="rounded-2xl border border-white/10 p-4">
        <summary className="hit cursor-pointer text-[15px] font-medium text-foreground">Add body measurements (optional)</summary>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Use a soft tape, over light clothing. Waist at the navel, chest at the fullest point, shoulders across the back from one shoulder tip to the other.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {len("waistCm", "Waist")}
          {len("chestCm", "Chest")}
          {len("shoulderCm", "Shoulders")}
        </div>
      </details>
      <p className="text-sm leading-6 text-muted-foreground">These are your own numbers. GlowMax uses them to fit style and physique suggestions; they aren't medical measurements.</p>
    </div>
  );
};

const detailsError = (d: Details): string | null => {
  if (d.heightCm === undefined || d.weightKg === undefined || !d.ageRange) return "Add your height, weight and age range to continue.";
  const names: Record<MeasureKey, string> = { heightCm: "Height", weightKg: "Weight", waistCm: "Waist", chestCm: "Chest", shoulderCm: "Shoulders" };
  for (const k of Object.keys(RANGES) as MeasureKey[]) if (!inRange(k, d[k])) return `${names[k]} looks off. Check the number and the units.`;
  return null;
};

// ─── the flow ────────────────────────────────────────────────────────────
const DigitalScan = () => {
  usePageMeta("Digital You scan");
  const nav = useNavigate();
  const [params] = useSearchParams();
  const retake = params.get("retake") as ImageKind | null;
  const detailsOnly = params.get("step") === "details";
  const returnTo = params.get("return"); // "model": came from "Change source photo"
  const { state, latest } = useApp();
  const { service, bundle, state: load } = useDigitalProfile();
  const light = !!latest?.light;

  const steps: Step[] = useMemo(() => {
    if (retake && IMAGE_KINDS.some((k) => k.kind === retake)) return [retake, "saving"];
    if (detailsOnly) return ["details", "saving"];
    return ["intro", ...IMAGE_KINDS.map((k) => k.kind), "details", "saving"];
  }, [retake, detailsOnly]);
  const [i, setI] = useState(0);
  const step = steps[i];
  const [shots, setShots] = useState<Partial<Record<ImageKind, Shot>>>({});
  const [consent, setConsent] = useState(false);
  const [details, setDetails] = useState<Details>({ units: state.profile?.country === "US" ? "imperial" : "metric", ageRange: state.profile?.age, goal: state.profile?.goal });
  const [problem, setProblem] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [savedKinds, setSavedKinds] = useState<ImageKind[]>([]);
  const headRef = useRef<HTMLHeadingElement>(null);

  // Prefill details from an existing profile.
  useEffect(() => {
    if (!bundle) return;
    setDetails((d) => ({ ...d, units: bundle.profile.unitSystem, ageRange: bundle.profile.ageRange ?? d.ageRange, goal: bundle.profile.goal ?? d.goal, heightCm: bundle.latest?.heightCm, weightKg: bundle.latest?.weightKg, waistCm: bundle.latest?.waistCm, chestCm: bundle.latest?.chestCm, shoulderCm: bundle.latest?.shoulderCm }));
  }, [bundle]);
  useEffect(() => {
    headRef.current?.focus();
    window.scrollTo({ top: 0 });
    setProblem(null);
  }, [i]);
  useEffect(() => () => Object.values(shots).forEach((s) => s && URL.revokeObjectURL(s.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const where = service?.mode === "account" ? "privately in your account" : "on this device only";
  const meta = IMAGE_KINDS.find((k) => k.kind === step);
  const required = meta ? !!retake || (meta.required && !(light && meta.area === "body")) : false;

  const save = async () => {
    if (!service) return;
    const kinds = (Object.keys(shots) as ImageKind[]).filter((k) => !savedKinds.includes(k));
    setProblem(null);
    setProgress({ done: 0, total: kinds.length + 1 });
    try {
      if (!bundle) await service.createProfile({ status: "draft", ageRange: details.ageRange, goal: details.goal, unitSystem: details.units });
      let done = 0;
      for (const k of kinds) {
        await service.uploadProfileImage(k, shots[k]!);
        setSavedKinds((s) => [...s, k]);
        setProgress({ done: ++done, total: kinds.length + 1 });
      }
      if (!retake) {
        const { heightCm, weightKg, waistCm, chestCm, shoulderCm } = details;
        await service.recordMeasurements({ heightCm, weightKg, waistCm, chestCm, shoulderCm });
      }
      const complete = retake || detailsOnly ? undefined : "active";
      await service.updateProfile({ ageRange: details.ageRange, goal: details.goal, unitSystem: details.units, ...(complete ? { status: complete } : {}), ...(kinds.length ? { lastScanAt: new Date().toISOString() } : {}) });
      setProgress({ done: kinds.length + 1, total: kinds.length + 1 });
      nav(returnTo === "model" ? "/app/you/model" : "/app/you", { replace: true, state: { saved: true } });
    } catch (e) {
      setProblem(e instanceof Error && /quota|full/i.test(e.message) ? "This device is out of storage space. Free some space and try again." : "Saving didn't finish. Your photos are still here; try again.");
      setProgress(null);
    }
  };

  const next = () => {
    if (step === "intro" && !consent) return setProblem("Tick the box to continue.");
    if (meta && required && !shots[meta.kind]) return setProblem("This photo is needed for your baseline. Take one to continue.");
    if (step === "details") {
      const err = detailsError(details);
      if (err) return setProblem(err);
    }
    const n = i + 1;
    setI(n);
    if (steps[n] === "saving") void save();
  };

  if (load === "signed-out") return <FlowShell onClose={() => nav(returnTo === "model" ? "/app/you/model" : "/app/you")}><AccountGate /></FlowShell>;
  if (load === "loading" && !service) return <FlowShell onClose={() => nav(returnTo === "model" ? "/app/you/model" : "/app/you")}><p className="py-20 text-center text-muted-foreground" role="status">Loading…</p></FlowShell>;

  const title =
    step === "intro" ? "Build your digital profile" : step === "details" ? "Your details" : step === "saving" ? "Saving your profile" : meta!.label;
  const photoSteps = steps.filter((s) => s !== "intro" && s !== "saving");
  const pos = (photoSteps as Step[]).indexOf(step);

  return (
    <FlowShell onClose={() => nav(returnTo === "model" ? "/app/you/model" : "/app/you")} progress={pos >= 0 ? (pos + 1) / photoSteps.length : step === "saving" ? 1 : 0}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {pos >= 0 && <p className="text-sm text-muted-foreground">Step {pos + 1} of {photoSteps.length}{meta && !required ? ", optional" : ""}</p>}
          <h1 ref={headRef} tabIndex={-1} className="mt-1 font-display text-3xl font-semibold text-foreground outline-none sm:text-4xl">{title}</h1>

          {step === "intro" && (
            <div className="mt-4 max-w-xl">
              <p className="text-lg leading-8 text-muted-foreground">Create a visual baseline so GlowMax can personalise your style, physique and appearance recommendations.</p>
              <h2 className="mt-8 text-[15px] font-medium text-foreground">What you'll add, about 3 minutes</h2>
              <ul className="mt-3 divide-y divide-white/[0.08] border-y border-white/[0.08] text-[15px]">
                <li className="flex justify-between py-3"><span className="text-foreground">Face and shoulders photo</span><span className="text-muted-foreground">Required</span></li>
                <li className="flex justify-between py-3"><span className="text-foreground">Left and right profile</span><span className="text-muted-foreground">Optional</span></li>
                <li className="flex justify-between py-3"><span className="text-foreground">Full-body photo, front</span><span className="text-muted-foreground">{light ? "Optional" : "Required"}</span></li>
                <li className="flex justify-between py-3"><span className="text-foreground">Full-body photo, side</span><span className="text-muted-foreground">Optional</span></li>
                <li className="flex justify-between py-3"><span className="text-foreground">Height, weight, age range</span><span className="text-muted-foreground">Required</span></li>
              </ul>
              <label htmlFor="dy-consent" className="mt-6 flex cursor-pointer gap-3 rounded-2xl border border-white/10 p-4 text-[15px] leading-6 text-foreground focus-within:ring-2 focus-within:ring-white/40">
                <input id="dy-consent" type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setProblem(null); }} className="mt-1 h-5 w-5 shrink-0 accent-[#cdbb93]" />
                <span>I agree that GlowMax stores these photos and details {where} to personalise my style, hair and physique suggestions. I can replace or delete them at any time.</span>
              </label>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Photos are checked on your device first and their location data is removed. Nobody else can see them.</p>
            </div>
          )}

          {meta && <div className="mt-6"><PhotoStep kind={meta.kind} shot={shots[meta.kind]} onShot={(s) => { setProblem(null); setShots((p) => { const o = p[meta.kind]; if (o) URL.revokeObjectURL(o.url); const n = { ...p }; if (s) n[meta.kind] = s; else delete n[meta.kind]; return n; }); }} /></div>}

          {step === "details" && <div className="mt-6"><DetailsStep d={details} set={(p) => { setProblem(null); setDetails((d) => ({ ...d, ...p })); }} /></div>}

          {step === "saving" && (
            <div className="mt-8 max-w-md" role="status" aria-live="polite">
              {progress ? (
                <>
                  <div className="h-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full bg-[#cdbb93]" animate={{ width: `${(progress.done / progress.total) * 100}%` }} transition={{ duration: 0.3 }} /></div>
                  <p className="mt-3 text-sm text-muted-foreground">{progress.done < progress.total ? `Saving ${progress.done + 1} of ${progress.total}…` : "Done."}</p>
                </>
              ) : null}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {problem && <p role="alert" className="mt-6 max-w-xl rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-sm text-amber-100">{problem}</p>}

      {step !== "saving" ? (
        <div className="sticky bottom-0 -mx-4 mt-10 flex items-center justify-between gap-3 glass-bar border-t border-white/[0.07] px-4 py-4 sm:static sm:bg-none sm:backdrop-filter-none sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button type="button" onClick={() => (i === 0 ? nav(returnTo === "model" ? "/app/you/model" : "/app/you") : setI(i - 1))} className="btn-secondary">{i === 0 ? "Cancel" : "Back"}</button>
          <div className="flex items-center gap-2">
            {meta && !required && !shots[meta.kind] && <button type="button" onClick={() => setI(i + 1)} className="hit px-3 text-[15px] text-muted-foreground underline underline-offset-4">Skip</button>}
            <button type="button" onClick={next} className="btn-primary">{step === "intro" ? "Start scan" : steps[i + 1] === "saving" ? "Save" : "Continue"}</button>
          </div>
        </div>
      ) : (
        !progress && <div className="mt-6 flex gap-3"><button type="button" onClick={() => void save()} className="btn-primary">Try again</button><button type="button" onClick={() => setI(i - 1)} className="btn-secondary">Back</button></div>
      )}
    </FlowShell>
  );
};

export default DigitalScan;
