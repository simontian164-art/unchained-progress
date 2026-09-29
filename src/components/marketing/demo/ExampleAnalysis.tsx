import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Check, Loader2, Clock, Target, Camera, ListChecks } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EXAMPLE_FACE_NOTES,
  EXAMPLE_FOCUS_AREAS,
  EXAMPLE_PROFILE,
  EXAMPLE_STRENGTHS,
} from "@/data/exampleAnalysis";
import { FacePortrait } from "./FacePortrait";
import { PriorityChip } from "./PriorityChip";

const STEPS = [
  "Checking photo quality and lighting",
  "Mapping facial landmarks",
  "Reviewing skin, hair and grooming",
  "Reviewing fit and proportions",
  "Building your plan",
];

/** Animated "analysis in progress" list that completes once scrolled into view. */
export const AnalysisSteps = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [done, setDone] = useState(reduce ? STEPS.length : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    if (done >= STEPS.length) return;
    const t = setTimeout(() => setDone((d) => d + 1), done === 0 ? 400 : 650);
    return () => clearTimeout(t);
  }, [inView, done, reduce]);

  return (
    <div ref={ref} className="surface-card rounded-2xl p-5" aria-live="polite">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {done >= STEPS.length ? "Analysis complete" : "Analyzing your photos…"}
        </p>
        <span className="example-badge">Example</span>
      </div>
      <ul className="mt-4 space-y-3">
        {STEPS.map((s, i) => {
          const complete = i < done;
          const active = i === done;
          return (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span className="flex h-5 w-5 items-center justify-center" aria-hidden="true">
                {complete ? (
                  <Check className="h-4 w-4 text-status-success" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                )}
              </span>
              <span className={complete ? "text-foreground" : "text-muted-foreground"}>{s}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const ExampleAnalysis = () => (
  <div className="surface-card overflow-hidden rounded-[22px]">
    {/* header */}
    <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="example-badge">Example analysis</span>
          <span className="text-xs text-muted-foreground">Sample profile · not a real user</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold text-foreground sm:text-2xl">
          5 focus areas, prioritized by impact
        </h3>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:text-right">
        <div>
          <dt className="text-xs text-muted-foreground">Photos</dt>
          <dd className="text-foreground">{EXAMPLE_PROFILE.photos.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Age</dt>
          <dd className="text-foreground">{EXAMPLE_PROFILE.age}</dd>
        </div>
      </dl>
    </div>

    <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
      {/* left rail */}
      <aside className="order-2 space-y-5 border-t border-white/[0.07] p-5 sm:p-6 lg:order-1 lg:border-r lg:border-t-0">
        <FacePortrait className="mx-auto aspect-[300/340] w-full max-w-[200px] lg:max-w-none" />
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Target className="h-3.5 w-3.5" aria-hidden="true" /> Goal
          </p>
          <p className="mt-1.5 text-sm text-foreground">{EXAMPLE_PROFILE.goal}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Working in your favor</p>
          <ul className="mt-2 space-y-1.5">
            {EXAMPLE_STRENGTHS.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Face notes</p>
          <dl className="mt-2 space-y-2">
            {EXAMPLE_FACE_NOTES.map((n) => (
              <div key={n.label} className="surface-inset rounded-lg px-3 py-2">
                <dt className="text-[11px] text-muted-foreground">{n.label}</dt>
                <dd className="text-sm text-foreground">{n.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>

      {/* focus areas */}
      <div className="order-1 p-5 sm:p-6 lg:order-2">
        <Tabs defaultValue={EXAMPLE_FOCUS_AREAS[0].id}>
          <TabsList
            aria-label="Focus areas"
            className="flex h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0"
          >
            {EXAMPLE_FOCUS_AREAS.map((f) => (
              <TabsTrigger
                key={f.id}
                value={f.id}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-muted-foreground data-[state=active]:border-white/25 data-[state=active]:bg-white/[0.08] data-[state=active]:text-foreground"
              >
                {f.area}
              </TabsTrigger>
            ))}
          </TabsList>

          {EXAMPLE_FOCUS_AREAS.map((f) => (
            <TabsContent key={f.id} value={f.id} className="mt-5 focus-visible:ring-0">
              <div className="flex flex-wrap items-center gap-2">
                <PriorityChip priority={f.priority} />
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {f.effort}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="surface-inset rounded-xl p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" /> What we noticed
                  </p>
                  <p className="mt-2 text-[15px] leading-6 text-foreground">{f.observation}</p>
                </div>
                <div className="surface-inset rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommendation</p>
                  <p className="mt-2 text-[15px] leading-6 text-foreground">{f.recommendation}</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/[0.07] p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Your steps
                </p>
                <ol className="mt-3 space-y-2.5">
                  {f.steps.map((s, i) => (
                    <li key={s} className="flex gap-3 text-[15px] leading-6 text-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-[11px] text-muted-foreground">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              {f.area === "Skin" && (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Skin suggestions are general cosmetic guidance, not a diagnosis. See a dermatologist for acne, irritation or
                  anything that concerns you.
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  </div>
);
