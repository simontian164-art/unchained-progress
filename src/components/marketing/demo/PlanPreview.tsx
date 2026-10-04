import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { EXAMPLE_PROGRESS, EXAMPLE_ROADMAP } from "@/data/exampleAnalysis";
import { FacePortrait } from "./FacePortrait";

/** Plan horizons with a progress line that draws in on scroll. */
export const RoadmapPreview = () => {
  const reduce = useReducedMotion();
  return (
    <div className="surface-card rounded-[22px] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Your plan</p>
        <span className="example-badge">Example</span>
      </div>
      <div className="relative mt-6">
        {/* connecting line (desktop) */}
        <div className="absolute left-0 right-0 top-[11px] hidden h-px bg-white/10 md:block" aria-hidden="true">
          <motion.div
            className="h-px origin-left bg-[hsl(42_70%_63%)]"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 0.3 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <ol className="grid gap-4 md:grid-cols-4">
          {EXAMPLE_ROADMAP.map((p, i) => (
            <li key={p.phase} className="relative">
              <span
                className={
                  "relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border text-[11px] " +
                  (i === 0
                    ? "border-[hsl(42_70%_63%)] bg-[hsl(42_70%_63%)] text-background"
                    : "border-white/20 bg-background text-muted-foreground")
                }
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="mt-3 text-xs text-muted-foreground">{p.phase}</p>
              <p className="mt-1 font-display text-base font-semibold text-foreground">{p.title}</p>
              <ul className="mt-2 space-y-1.5">
                {p.tasks.map((t, j) => {
                  const done = i === 0 && j < 2;
                  return (
                    <li key={t} className="flex gap-2 text-sm leading-5 text-muted-foreground">
                      {done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-label="Done" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
                      )}
                      <span className={done ? "text-foreground" : undefined}>{t}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

/** Progress tracking: habit completion + side-by-side check-in photos. */
export const ProgressPreview = () => {
  const reduce = useReducedMotion();
  const max = Math.max(...EXAMPLE_PROGRESS.map((w) => w.planned));
  const total = EXAMPLE_PROGRESS.reduce((a, w) => a + w.completed, 0);
  const planned = EXAMPLE_PROGRESS.reduce((a, w) => a + w.planned, 0);
  return (
    <div className="surface-card rounded-[22px] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Progress</p>
        <span className="example-badge">Example</span>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs text-muted-foreground">Plan actions completed per week</p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">
            {total}/{planned} <span className="text-sm font-normal text-muted-foreground">in 6 weeks</span>
          </p>
          <div
            className="mt-4 flex h-28 items-end gap-2"
            role="img"
            aria-label={`Bar chart: actions completed per week: ${EXAMPLE_PROGRESS.map((w) => `${w.week} ${w.completed} of ${w.planned}`).join(", ")}`}
          >
            {EXAMPLE_PROGRESS.map((w, i) => (
              <div key={w.week} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex h-24 w-full items-end overflow-hidden rounded-md bg-white/[0.04]">
                  <motion.div
                    className="w-full rounded-md bg-silver-bright/80"
                    style={reduce ? { height: `${(w.completed / max) * 100}%` } : undefined}
                    initial={reduce ? false : { height: 0 }}
                    whileInView={reduce ? undefined : { height: `${(w.completed / max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground" aria-hidden="true">
                  {w.week}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-52">
          {(["Week 1", "Week 6"] as const).map((l) => (
            <figure key={l}>
              <FacePortrait
                className="aspect-[3/4]"
                showMesh={false}
                variant={l === "Week 6" ? "after" : "before"}
                label={`Illustrative check-in photo, ${l}`}
              />
              <figcaption className="mt-1.5 text-center text-[11px] text-muted-foreground">{l}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Progress is tracked on what you do (routines, appointments, check-ins) and your own side-by-side photos. No
        attractiveness scores.
      </p>
    </div>
  );
};
