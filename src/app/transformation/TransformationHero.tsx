import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Check, ChevronDown, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useDigitalProfile } from "@/app/digital/useDigitalProfile";
import { PoseGuide, ScanSweep } from "@/app/digital/ui";
import guestPortrait from "@/assets/guest-digital-you.jpg";
import {
  generateProjection, loadProjections, saveProjection,
  type HaircutChoice, type ProjectionRecord, type ProjectionSettings, type ProjectionStage,
} from "./futureSelf";

const STAGES: ProjectionStage[] = [0, 30, 60, 90];
const HAIRCUTS: { value: HaircutChoice; label: string }[] = [
  { value: "keep", label: "Current" }, { value: "clean", label: "Clean" },
  { value: "textured", label: "Textured" }, { value: "short", label: "Short" },
];
const DEFAULTS: ProjectionSettings = { eyebrows: true, haircut: "clean", skin: true, weightDeltaKg: 0 };

const sameSettings = (a: ProjectionSettings, b: ProjectionSettings) =>
  a.eyebrows === b.eyebrows && a.haircut === b.haircut && a.skin === b.skin && a.weightDeltaKg === b.weightDeltaKg;

export default function TransformationHero({ guest }: { guest: boolean }) {
  const { modelUrl, urls, state } = useDigitalProfile();
  const source = modelUrl ?? urls.body_front ?? urls.head_front ?? (guest ? guestPortrait : undefined);
  const [stage, setStage] = useState<ProjectionStage>(0);
  const [settings, setSettings] = useState<ProjectionSettings>(DEFAULTS);
  const [records, setRecords] = useState<ProjectionRecord[]>(loadProjections);
  const [preview, setPreview] = useState<string>();
  const [partial, setPartial] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion();
  const stageRecord = records.find((r) => r.stage === stage);
  const selectedImage = preview ?? stageRecord?.image ?? source;
  const stale = stage !== 0 && stage !== 0 && !!stageRecord && !sameSettings(stageRecord.settings, settings);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useSpring(useTransform(x, [-1, 1], [-5, 5]), { stiffness: 120, damping: 20 });
  const rotateX = useSpring(useTransform(y, [-1, 1], [3, -3]), { stiffness: 120, damping: 20 });
  const frame = useRef<HTMLDivElement>(null);
  const activeGoals = useMemo(() => [
    settings.eyebrows && "Defined brows",
    settings.haircut !== "keep" && `${HAIRCUTS.find((h) => h.value === settings.haircut)?.label} haircut`,
    settings.skin && "Clearer-looking skin",
    settings.weightDeltaKg !== 0 && `${settings.weightDeltaKg > 0 ? "+" : ""}${settings.weightDeltaKg} kg target`,
  ].filter(Boolean) as string[], [settings]);

  const updateStage = (next: ProjectionStage) => { setStage(next); setPreview(undefined); setError(undefined); };
  async function createProjection() {
    if (!source) return;
    setBusy(true); setError(undefined); setPreview(undefined);
    try {
      let final = "";
      await generateProjection(source, stage, settings, (image, isFinal) => {
        setPreview(image); setPartial(!isFinal); if (isFinal) final = image;
      });
      if (!final) throw new Error("The projection returned no final image.");
      const record: ProjectionRecord = { stage, settings: { ...settings }, image: final, generatedAt: new Date().toISOString() };
      saveProjection(record);
      setRecords((all) => [record, ...all.filter((r) => r.stage !== stage)]);
    } catch (e) { setError(e instanceof Error ? e.message : "The projection could not be generated."); }
    finally { setBusy(false); setPartial(false); }
  }

  return (
    <section aria-labelledby="future-heading" className="relative -mx-4 overflow-hidden border-y border-border bg-card/40 sm:-mx-6 lg:mx-0 lg:rounded-md lg:border">
      <div className="grid min-h-[620px] lg:grid-cols-[minmax(0,1.35fr)_minmax(310px,.65fr)]">
        <div className="relative min-h-[560px] overflow-hidden bg-background">
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase text-gold">Digital You</p>
              <h1 id="future-heading" className="mt-2 max-w-lg font-display text-3xl font-semibold leading-tight text-foreground sm:text-5xl">You, head to toe — and who you become.</h1>
            </div>
            <span className="rounded-md border border-border bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">AI projection</span>
          </div>

          <div className="absolute inset-0 flex items-end justify-center pt-28 [perspective:1200px]">
            {state === "loading" && !source ? <div className="h-3/4 w-1/2 animate-pulse bg-muted" /> : source ? (
              <motion.div
                ref={frame}
                className="relative h-[78%] w-[min(78%,520px)] touch-none overflow-hidden [transform-style:preserve-3d]"
                style={reduce ? undefined : { rotateX, rotateY }}
                onPointerMove={(e) => {
                  if (reduce || !frame.current) return;
                  const r = frame.current.getBoundingClientRect();
                  x.set(((e.clientX - r.left) / r.width) * 2 - 1);
                  y.set(((e.clientY - r.top) / r.height) * 2 - 1);
                }}
                onPointerLeave={() => { x.set(0); y.set(0); }}
              >
                <motion.img
                  key={`${stage}-${selectedImage}`}
                  src={selectedImage}
                  alt={stage === 0 ? "Your current Digital You" : `Your projected Digital You at day ${stage}`}
                  width={1024} height={1536}
                  className={cn("h-full w-full object-contain object-bottom transition-[filter,opacity] duration-500", partial && "blur-xl", stale && "opacity-60")}
                  initial={reduce ? false : { opacity: 0, scale: 0.985 }} animate={{ opacity: stale ? 0.6 : 1, scale: 1 }}
                />
                {busy && <ScanSweep />}
              </motion.div>
            ) : <div className="relative h-[72%] w-[min(70%,430px)]"><PoseGuide area="body" /></div>}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/80 to-transparent px-5 pb-5 pt-24 sm:px-7">
            <div role="tablist" aria-label="Transformation timeline" className="grid grid-cols-4 border-y border-border bg-background/70 backdrop-blur">
              {STAGES.map((day) => <button key={day} type="button" role="tab" aria-selected={stage === day} onClick={() => updateStage(day)} className={cn("relative min-h-14 px-2 text-sm transition-colors", stage === day ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <span className="block text-[10px] uppercase">{day === 0 ? "Current" : "Projected"}</span>
                <span className="font-semibold">{day === 0 ? "Now" : `${day} days`}</span>
                {stage === day && <motion.span layoutId="timeline" className="absolute inset-x-2 bottom-0 h-0.5 bg-gold" />}
              </button>)}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Drag across the person for depth. Projections show possibilities, not guaranteed outcomes.</p>
          </div>
        </div>

        <div className="border-t border-border bg-card p-5 sm:p-7 lg:border-l lg:border-t-0">
          <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-h-11 w-full items-center justify-between text-left">
            <span><span className="block text-xs font-semibold uppercase text-gold">Future settings</span><span className="mt-1 block text-lg font-semibold text-foreground">Build the target</span></span>
            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
          {open && <div className="mt-6 space-y-7">
            <ControlToggle label="Eyebrows" body="Neater and subtly more defined" checked={settings.eyebrows} onChange={(value) => setSettings((s) => ({ ...s, eyebrows: value }))} />
            <ControlToggle label="Skin" body="Clearer and more even-looking, same tone" checked={settings.skin} onChange={(value) => setSettings((s) => ({ ...s, skin: value }))} />
            <div>
              <p className="text-sm font-medium text-foreground">Haircut</p>
              <div className="mt-3 grid grid-cols-4 gap-1" role="radiogroup" aria-label="Haircut target">
                {HAIRCUTS.map((h) => <button key={h.value} type="button" role="radio" aria-checked={settings.haircut === h.value} onClick={() => setSettings((s) => ({ ...s, haircut: h.value }))} className={cn("min-h-10 rounded-md border px-1 text-xs", settings.haircut === h.value ? "border-gold bg-gold-muted text-foreground" : "border-border text-muted-foreground hover:text-foreground")}>{h.label}</button>)}
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between"><p className="text-sm font-medium text-foreground">Target weight change</p><p className="font-display text-xl text-foreground">{settings.weightDeltaKg > 0 ? "+" : ""}{settings.weightDeltaKg} kg</p></div>
              <Slider className="mt-4" min={-18} max={18} step={1} value={[settings.weightDeltaKg]} onValueChange={([value]) => setSettings((s) => ({ ...s, weightDeltaKg: value }))} aria-label="Target weight change in kilograms" />
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>Lose 18</span><span>Maintain</span><span>Gain 18</span></div>
            </div>
          </div>}

          <div className="mt-7 border-t border-border pt-5">
            <div className="flex flex-wrap gap-2">{activeGoals.length ? activeGoals.map((goal) => <span key={goal} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"><Check className="h-3 w-3" />{goal}</span>) : <span className="text-xs text-muted-foreground">Current appearance selected</span>}</div>
            {!source ? <Button asChild className="mt-5 w-full"><Link to="/app/you/scan">Create Digital You</Link></Button> : stage === 0 ? <Button className="mt-5 w-full" disabled={busy} onClick={() => void createProjection()}><Sparkles />{busy ? "Building full-body avatar…" : stageRecord ? "Rebuild full-body avatar" : "Build my full-body avatar"}</Button> : <Button className="mt-5 w-full" disabled={busy} onClick={() => void createProjection()}><Sparkles />{busy ? "Creating projection…" : stale ? "Update projection" : stageRecord ? `Regenerate day ${stage}` : `Generate day ${stage}`}</Button>}
            {(stageRecord || preview) && <Button variant="ghost" className="mt-2 w-full text-muted-foreground" onClick={() => { setPreview(undefined); setRecords((all) => all.filter((r) => r.stage !== stage)); }}><RotateCcw />Clear this stage</Button>}
            {error && <div role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground"><p>{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void createProjection()}>Try again</Button></div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlToggle({ label, body, checked, onChange }: { label: string; body: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4"><span><span className="block text-sm font-medium text-foreground">{label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{body}</span></span><input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-muted transition-colors peer-checked:bg-gold"><span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-5 peer-checked:bg-background" /></span></label>;
}
