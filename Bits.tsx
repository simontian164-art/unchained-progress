import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Brush, Camera, ChevronDown, ClipboardList, Clock, Droplet, Dumbbell, Eye, Home, Scissors, ScanFace, Shirt, ShoppingBag, Smile, Stethoscope, Leaf, ThumbsDown, ThumbsUp, HelpCircle, Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleId, NotForMeReason, Observation, Rec, RecKind, Status, Timeframe } from "../types";
import { useApp } from "../store";
import { useRebuild } from "../useRebuild";

export const STATUS_STYLE: Record<Status, { label: string; cls: string; hint: string }> = {
  strong: { label: "Strong", cls: "border-status-success/35 bg-status-success/10 text-[hsl(142_50%_70%)]", hint: "Already working well" },
  opportunity: { label: "Opportunity", cls: "border-white/15 bg-white/[0.05] text-silver-bright", hint: "Worth improving when you have time" },
  priority: { label: "Priority", cls: "border-[hsl(42_70%_50%/0.35)] bg-[hsl(42_70%_50%/0.1)] text-[hsl(42_80%_72%)]", hint: "Likely to matter most for your goal" },
};

export const StatusPill = ({ status }: { status: Status }) => (
  <span title={STATUS_STYLE[status].hint} className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", STATUS_STYLE[status].cls)}>
    {STATUS_STYLE[status].label}
  </span>
);

export const KIND: Record<RecKind, { label: string; icon: typeof Home }> = {
  home: { label: "At home", icon: Home },
  lifestyle: { label: "Habit", icon: Leaf },
  product: { label: "Product", icon: ShoppingBag },
  barber: { label: "Barber / stylist", icon: Scissors },
  professional: { label: "Professional", icon: Stethoscope },
};

/**
 * One colour + icon per area, used everywhere (cards, report sections, plan filters), so people can
 * tell hair from skin from style at a glance without reading.
 */
export const AREA: Record<ModuleId, { label: string; icon: typeof Home; color: string }> = {
  face: { label: "Face", icon: ScanFace, color: "#cbd5e1" },
  hair: { label: "Hair", icon: Scissors, color: "#facc15" },
  beard: { label: "Facial hair", icon: Brush, color: "#fb923c" },
  skin: { label: "Skin", icon: Droplet, color: "#f472b6" },
  eyes: { label: "Eyes & brows", icon: Eye, color: "#38bdf8" },
  smile: { label: "Smile", icon: Smile, color: "#2dd4bf" },
  style: { label: "Style", icon: Shirt, color: "#a78bfa" },
  body: { label: "Body", icon: Dumbbell, color: "#f87171" },
};

export const AreaChip = ({ id, className }: { id: ModuleId; className?: string }) => {
  const A = AREA[id];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider", className)} style={{ color: A.color }}>
      <A.icon className="h-3.5 w-3.5" aria-hidden="true" />
      {A.label}
    </span>
  );
};

export const AreaIcon = ({ id, size = "md" }: { id: ModuleId; size?: "sm" | "md" }) => {
  const A = AREA[id];
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center rounded-lg", size === "sm" ? "h-6 w-6" : "h-8 w-8")}
      style={{ background: `${A.color}1f`, color: A.color }}
    >
      <A.icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </span>
  );
};

const WHEN: Record<Timeframe, string> = { immediate: "Instant", weeks: "Shows in weeks", months: "Shows in months" };

/** Plain-language signs instead of a grid of Impact/Effort/Cost/Time values. */
export const RecTags = ({ r }: { r: Rec }) => {
  const K = KIND[r.kind];
  const sign = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5";
  return (
    <ul className="flex flex-wrap gap-1.5 text-[11px]" aria-label="About this step">
      <li className={cn(sign, "border-white/10 text-muted-foreground")}>
        <K.icon className="h-3 w-3" aria-hidden="true" /> {K.label}
      </li>
      {r.impact === "high" && (
        <li className={cn(sign, "border-[hsl(42_70%_50%/0.35)] bg-[hsl(42_70%_50%/0.1)] text-[hsl(42_80%_72%)]")}>
          <Zap className="h-3 w-3" aria-hidden="true" /> Big impact
        </li>
      )}
      {r.effort === "low" && (
        <li className={cn(sign, "border-sky-400/30 bg-sky-400/[0.08] text-sky-200")}>
          <Timer className="h-3 w-3" aria-hidden="true" /> Quick
        </li>
      )}
      {r.effort === "high" && <li className={cn(sign, "border-white/10 text-muted-foreground")}>Takes effort</li>}
      <li className={cn(sign, r.cost === "free" ? "border-status-success/35 bg-status-success/10 text-[hsl(142_50%_70%)]" : "border-white/10 text-foreground")}>
        {r.cost === "free" ? "Free" : r.cost}
        {r.cost !== "free" && <span className="sr-only"> cost</span>}
      </li>
      <li className={cn(sign, "border-white/10 text-muted-foreground")}>
        <Clock className="h-3 w-3" aria-hidden="true" /> {WHEN[r.timeframe]}
      </li>
    </ul>
  );
};

export const SourceBadge = ({ source }: { source: Observation["source"] }) => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
    {source === "answers" ? <ClipboardList className="h-3 w-3" aria-hidden="true" /> : <Camera className="h-3 w-3" aria-hidden="true" />}
    {source === "answers" ? "Your answers" : source === "photo" ? "Your photo" : "Photo + answers"}
  </span>
);

/**
 * Photo observations are shown (they carry caveats worth reading); things the user told us are
 * folded into one line so sections stay short.
 */
export const ObservationList = ({ items }: { items: Observation[] }) => {
  const photo = items.filter((o) => o.source !== "answers");
  const answers = items.filter((o) => o.source === "answers");
  return (
    <div className="space-y-2">
      {photo.map((o, i) => (
        <div key={i} className="surface-inset rounded-xl p-3 text-sm">
          <div className="flex flex-wrap items-start gap-2">
            <SourceBadge source={o.source} />
            <span className="min-w-0 flex-1 leading-6 text-foreground">{o.text}</span>
          </div>
          {o.caveat && <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{o.caveat}</p>}
        </div>
      ))}
      {answers.length > 0 && (
        <details className="surface-inset group rounded-xl p-3 text-sm">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-muted-foreground hover:text-foreground">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            What you told us ({answers.length})
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="mt-2 space-y-1.5">
            {answers.map((o, i) => (
              <li key={i} className="leading-6 text-foreground">
                • {o.text}
                {o.caveat && <span className="block pl-3 text-xs leading-5 text-muted-foreground">{o.caveat}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

/** Recs that have a longer how-to in /app/guides. */
const GUIDE_FOR: Record<string, string> = {
  "body-posture": "posture",
  "eyes-brows": "balance",
  "style-closet": "style",
  "style-capsule": "style",
  "style-tailor": "fit",
};

export const NOT_FOR_ME: { id: NotForMeReason; label: string }[] = [
  { id: "expensive", label: "Too expensive" },
  { id: "maintenance", label: "Too much upkeep" },
  { id: "style", label: "Don't like the style" },
  { id: "tried", label: "Already tried it" },
  { id: "own", label: "Already doing / own it" },
  { id: "goals", label: "Doesn't fit my goals" },
  { id: "other", label: "Other" },
];

const BASIS_LABEL: Record<NonNullable<Rec["basis"]>, string> = {
  answers: "Based on your answers",
  "answers+photo": "Based on your answers, plus a small nudge from your photo",
  photo: "Based on your photo only, so treat it as a maybe (light and angle affect it)",
  general: "General good practice",
};

/** "Helpful" / "Not for me". Not-for-me removes the rec and rebuilds the plan immediately. */
const useRecFeedback = (r: Rec) => {
  const { state, setFeedback } = useApp();
  const rebuild = useRebuild();
  const key = r.ref ? `${r.id}:${r.ref}` : r.id;
  const cur = state.feedback?.[key];
  const give = (verdict: "helpful" | "not", reason?: NotForMeReason) => {
    const f = verdict === "helpful" && cur?.verdict === "helpful" ? null : { verdict, reason, ref: r.ref, at: new Date().toISOString() };
    const next = { ...(state.feedback ?? {}) };
    if (f) next[key] = f;
    else delete next[key];
    setFeedback(key, f);
    if (state.profile) rebuild(state.profile, next);
  };
  return { cur, give };
};

type Panel = "steps" | "why" | "not" | null;

export const RecCard = ({ r, open: openInit = false, done, onToggle, feedback = true }: { r: Rec; open?: boolean; done?: boolean; onToggle?: () => void; feedback?: boolean }) => {
  const [panel, setPanel] = useState<Panel>(openInit ? "steps" : null);
  const toggle = (p: Panel) => setPanel(panel === p ? null : p);
  const { cur, give } = useRecFeedback(r);
  const hasSteps = r.steps.length > 0 || r.id === "hair-cut" || !!r.shopIds?.length || !!GUIDE_FOR[r.id];
  const link = "inline-flex items-center gap-1 text-sm hover:underline";
  const iconBtn = "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors";
  return (
    <div
      className={cn("rounded-xl border border-l-[3px] p-4 transition-colors", done ? "border-status-success/30 bg-status-success/[0.04]" : "border-white/10")}
      style={{ borderLeftColor: AREA[r.module].color }}
    >
      <div className="flex items-start gap-3">
        {onToggle && (
          <label className="mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/30 focus-within:ring-2 focus-within:ring-white/40">
            <input type="checkbox" className="sr-only" checked={!!done} onChange={onToggle} aria-label={`Mark "${r.title}" done`} />
            {done && <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-status-success" />}
          </label>
        )}
        <div className="min-w-0 flex-1">
          <AreaChip id={r.module} />
          <p className={cn("mt-1 text-[15px] font-medium", done ? "text-muted-foreground line-through" : "text-foreground")}>{r.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{r.detail}</p>
          <div className="mt-2.5">
            <RecTags r={r} />
          </div>

          {/* one row of actions */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {hasSteps && (
              <button type="button" onClick={() => toggle("steps")} aria-expanded={panel === "steps"} className={cn(link, "text-foreground")}>
                How to do it <ChevronDown className={cn("h-4 w-4 transition-transform", panel === "steps" && "rotate-180")} aria-hidden="true" />
              </button>
            )}
            {r.why && r.why.length > 0 && (
              <button type="button" onClick={() => toggle("why")} aria-expanded={panel === "why"} className={cn(link, "text-muted-foreground hover:text-foreground")}>
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" /> Why this?
              </button>
            )}
            {feedback && (
              <span className="ml-auto flex gap-1.5">
                <button type="button" onClick={() => give("helpful")} aria-pressed={cur?.verdict === "helpful"} aria-label="Helpful" title="Helpful"
                  className={cn(iconBtn, cur?.verdict === "helpful" ? "border-status-success/50 bg-status-success/10 text-[hsl(142_50%_70%)]" : "border-white/10 text-muted-foreground hover:text-foreground")}>
                  <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => toggle("not")} aria-expanded={panel === "not"} aria-label="Not for me" title="Not for me"
                  className={cn(iconBtn, panel === "not" ? "border-white/30 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground")}>
                  <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            )}
          </div>

          {panel === "steps" && (
            <div className="mt-3 space-y-3">
              {r.steps.length > 0 && (
                <ol className="space-y-2">
                  {r.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-6 text-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-[11px] text-muted-foreground">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              )}
              <div className="flex flex-wrap gap-2">
                {r.id === "hair-cut" && (
                  <Link to="/app/barber" className="btn-secondary btn-sm">
                    <Scissors className="h-3.5 w-3.5" aria-hidden="true" /> Show my barber
                  </Link>
                )}
                {GUIDE_FOR[r.id] && (
                  <Link to={`/app/guides#${GUIDE_FOR[r.id]}`} className="btn-secondary btn-sm">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Full guide
                  </Link>
                )}
                {r.shopIds?.length ? (
                  <Link to={`/app/shop#${r.shopIds[0]}`} className="btn-secondary btn-sm">
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" /> What to buy
                  </Link>
                ) : null}
              </div>
            </div>
          )}
          {panel === "why" && r.why && (
            <div className="surface-inset mt-3 rounded-lg p-3 text-xs leading-5">
              <p className="font-medium text-foreground">Why this is in your plan</p>
              <ul className="mt-1 space-y-1 text-foreground">{r.why.map((w) => <li key={w}>• {w}</li>)}</ul>
              <p className="mt-2 text-muted-foreground">{BASIS_LABEL[r.basis ?? "answers"]}. <Link to="/app/start" className="underline underline-offset-2">Not accurate? Update your answers</Link></p>
            </div>
          )}
          {panel === "not" && (
            <fieldset className="mt-3">
              <legend className="text-xs text-muted-foreground">Not for you? Tell us why and your plan updates right away.</legend>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {NOT_FOR_ME.filter((x) => x.id !== "style" || r.ref).map((x) => (
                  <button key={x.id} type="button" onClick={() => { give("not", x.id); setPanel(null); }} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-foreground hover:border-white/25">
                    {x.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </div>
    </div>
  );
};

export const Section = ({ title, id, children, action }: { title: string; id?: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section aria-labelledby={id ? `${id}-h` : undefined} id={id} className="surface-card scroll-mt-20 rounded-2xl p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id={id ? `${id}-h` : undefined} className="font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);
