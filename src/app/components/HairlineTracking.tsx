import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "../store";
import { PhotoInput } from "./PhotoInput";
import { HairlineAngleDiagram } from "../visuals/diagrams/HairlineAngles";
import { CompareSlider } from "../visuals/CompareSlider";
import type { HairlineAngle, HairlineSet } from "../types";

export const ANGLES: { id: HairlineAngle; label: string; hint: string; facing: "user" | "environment" }[] = [
  { id: "front", label: "Front hairline", hint: "Hair pushed back, face the camera, eyes level.", facing: "user" },
  { id: "left-temple", label: "Left temple", hint: "Turn your head about 45° to the right.", facing: "user" },
  { id: "right-temple", label: "Right temple", hint: "Turn your head about 45° to the left.", facing: "user" },
  { id: "top", label: "Top", hint: "Part your hair in the middle, tilt your head down; phone held above, looking straight down.", facing: "environment" },
  { id: "crown", label: "Crown", hint: "Ask someone, or use a second mirror. Same distance each time.", facing: "environment" },
];

export const CONDITIONS = [
  "Same room and light as last time (daylight from a window, not only a ceiling light)",
  "Hair dry and styled the way you usually wear it (pushed back for the front photo)",
  "Phone at arm's length, no zoom, no filters or beauty mode",
  "No hair fibres, concealer, hat marks or fresh product",
  "About the same time since your last haircut as last time",
];

/** Follow-up points after the baseline, in days. */
export const INTERVALS = [
  { days: 56, label: "8 weeks" },
  { days: 84, label: "12 weeks" },
  { days: 182, label: "6 months" },
];

const DAY = 86400000;
const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export const intervalLabel = (base: HairlineSet, set: HairlineSet) => {
  if (base.id === set.id) return "Baseline";
  const d = Math.round((new Date(set.date).getTime() - new Date(base.date).getTime()) / DAY);
  const w = Math.round(d / 7);
  return w >= 26 ? `${Math.round(d / 30.4)} months` : `${w} weeks`;
};

/** Next due date: the first interval point not yet covered by a set. */
export const nextDue = (sets: HairlineSet[], now = Date.now()) => {
  if (!sets.length) return { due: true, label: "Baseline" };
  const base = new Date(sets[0].date).getTime();
  const last = new Date(sets[sets.length - 1].date).getTime();
  const next = INTERVALS.find((i) => base + i.days * DAY > last + 7 * DAY) ?? { days: Math.round((last - base) / DAY) + 91, label: "every 3 months" };
  const at = base + next.days * DAY;
  return { due: now >= at - 3 * DAY, label: next.label, at: new Date(at).toISOString() };
};

const HairlineTracking = () => {
  const { state, addHairlineSet, removeHairlineSet } = useApp();
  const sets = state.hairlineSets ?? [];
  const [checked, setChecked] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Partial<Record<HairlineAngle, string>>>({});
  const [early, setEarly] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [a, setA] = useState(0);
  const [b, setB] = useState(Math.max(0, sets.length - 1));
  const [confirm, setConfirm] = useState<string | null>(null);
  const [mode, setMode] = useState<"side" | "slider">("side");
  const due = nextDue(sets);
  const allChecked = checked.length === CONDITIONS.length;

  const save = () => {
    if (!photos.front) return;
    addHairlineSet({ id: `h-${Date.now()}`, date: new Date().toISOString(), photos, conditions: checked });
    setPhotos({});
    setChecked([]);
    setCapturing(false);
    setEarly(false);
    setB(sets.length); // the new set
  };

  const base = sets[0];
  const A = sets[Math.min(a, sets.length - 1)];
  const B = sets[Math.min(b, sets.length - 1)];

  return (
    <section id="hairline" aria-labelledby="hairline-h" className="surface-card scroll-mt-20 rounded-2xl p-5">
      <h2 id="hairline-h" className="font-display text-base font-semibold text-foreground">Hairline tracking</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Five controlled photos at baseline, 8 weeks, 12 weeks and 6 months. Consistency matters more than anything else: slow change is invisible in a mirror and easy to fake with light.
      </p>

      {sets.length >= 2 && A && B && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              Compare
              <select value={a} onChange={(e) => setA(Number(e.target.value))} className="h-9 rounded-lg border border-white/[0.12] bg-white/[0.03] px-2 text-foreground">
                {sets.map((s, i) => <option key={s.id} value={i}>{intervalLabel(base, s)} · {fmt(s.date)}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-muted-foreground">
              with
              <select value={b} onChange={(e) => setB(Number(e.target.value))} className="h-9 rounded-lg border border-white/[0.12] bg-white/[0.03] px-2 text-foreground">
                {sets.map((s, i) => <option key={s.id} value={i}>{intervalLabel(base, s)} · {fmt(s.date)}</option>)}
              </select>
            </label>
          </div>
          <div role="radiogroup" aria-label="Comparison view" className="mt-3 inline-flex rounded-full border border-white/10 p-0.5 text-xs">
            {(["side", "slider"] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={cn("rounded-full px-3 py-1 transition-colors", mode === m ? "bg-white/[0.12] text-foreground" : "text-muted-foreground")}>
                {m === "side" ? "Side by side" : "Slider"}
              </button>
            ))}
          </div>
          <ul className="mt-4 space-y-5">
            {ANGLES.filter((ang) => A.photos[ang.id] && B.photos[ang.id]).map((ang) => (
              <li key={ang.id}>
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <HairlineAngleDiagram angle={ang.id} className="h-6 w-6" /> {ang.label}
                </p>
                {mode === "slider" ? (
                  <CompareSlider className="mt-2 max-w-xs" before={A.photos[ang.id]!} after={B.photos[ang.id]!} beforeLabel={intervalLabel(base, A)} afterLabel={intervalLabel(base, B)} alt={ang.label} />
                ) : (
                  <div className="mt-2 grid max-w-md grid-cols-2 gap-2">
                    {[A, B].map((s, i) => (
                      <figure key={i}>
                        <img src={s.photos[ang.id]} alt={`${ang.label}, ${intervalLabel(base, s)}`} className="aspect-[3/4] w-full rounded-xl object-cover" loading="lazy" />
                        <figcaption className="mt-1 text-center text-[11px] text-muted-foreground">{intervalLabel(base, s)}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl border border-white/10 p-3 text-xs leading-5 text-muted-foreground">
            Lighting, hair length, styling, whether hair is wet or dry, and camera angle all change how a hairline looks, often more than real change does. Look for a
            difference that shows up consistently across several sets, not one pair. GlowMax doesn't judge whether it got better or worse; if you're concerned, bring these
            sets to a dermatologist.
          </p>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-white/10 p-4">
        {!capturing ? (
          <>
            {!sets.length && (
              <div className="mb-4 grid grid-cols-5 gap-2" aria-hidden="true">
                {ANGLES.map((ang) => (
                  <div key={ang.id} className="text-center">
                    <HairlineAngleDiagram angle={ang.id} className="mx-auto h-12 w-12" />
                    <p className="mt-1 text-[10px] leading-3 text-muted-foreground">{ang.label.replace(" hairline", "")}</p>
                  </div>
                ))}
              </div>
            )}
            {due.due || early ? (
              <p className="text-sm text-foreground">{sets.length ? `Your ${due.label} set is due.` : "No sets yet. Take a baseline today: five photos, about 3 minutes. Everything after is compared to it."}</p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Next set: <span className="text-foreground">{due.label}</span> after your baseline, around {fmt(due.at!)}. Comparing sooner mostly shows lighting and styling differences.{" "}
                <button type="button" onClick={() => setEarly(true)} className="text-foreground underline underline-offset-4">Take one anyway</button>
              </p>
            )}
            {(due.due || early) && (
              <button type="button" onClick={() => setCapturing(true)} className="btn-primary btn-sm mt-3">Take hairline set</button>
            )}
          </>
        ) : (
          <>
            <fieldset>
              <legend className="text-sm font-medium text-foreground">Before you start, confirm each one</legend>
              <ul className="mt-2 space-y-1.5">
                {CONDITIONS.map((c) => (
                  <li key={c}>
                    <label className="flex cursor-pointer gap-2 text-sm leading-6 text-muted-foreground">
                      <input type="checkbox" checked={checked.includes(c)} onChange={() => setChecked(checked.includes(c) ? checked.filter((x) => x !== c) : [...checked, c])} className="mt-1 accent-white" />
                      {c}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <div className={cn("mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5", !allChecked && "pointer-events-none opacity-40")} aria-disabled={!allChecked}>
              {ANGLES.map((ang) => (
                <div key={ang.id} className="space-y-2">
                  <HairlineAngleDiagram angle={ang.id} className="mx-auto h-16 w-16" />
                  <PhotoInput label={ang.label} hint={ang.hint} required={ang.id === "front"} facing={ang.facing} maxSide={480} value={photos[ang.id]} onChange={(v) => setPhotos({ ...photos, [ang.id]: v })} />
                </div>
              ))}
            </div>
            {!allChecked && <p className="mt-2 text-xs text-muted-foreground">Tick all five to enable the photos. Uncontrolled photos make comparisons misleading.</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={save} disabled={!allChecked || !photos.front} className="btn-primary btn-sm disabled:opacity-50">Save set</button>
              <button type="button" onClick={() => setCapturing(false)} className="btn-secondary btn-sm">Cancel</button>
            </div>
          </>
        )}
      </div>

      {sets.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2 text-xs">
          {sets.map((s) => (
            <li key={s.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-muted-foreground">
              {intervalLabel(base, s)} · {fmt(s.date)} · {Object.keys(s.photos).length} photo{Object.keys(s.photos).length === 1 ? "" : "s"}
              {confirm === s.id ? (
                <>
                  <button type="button" className="text-red-300" onClick={() => { removeHairlineSet(s.id); setConfirm(null); setA(0); setB(0); }}>Delete</button>
                  <button type="button" onClick={() => setConfirm(null)}>Keep</button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirm(s.id)} aria-label={`Delete set from ${fmt(s.date)}`} title="Delete"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default HairlineTracking;
