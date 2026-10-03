import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { AREA } from "../areas";
import { DUR, EASE, t } from "../motion";
import type { Analysis } from "../../types";

/**
 * GlowMax's signature moment, in two halves:
 *   1. ScanStage — the photo settles into a frame; three real checks tick; if landmarks were found,
 *      a faint outline of points appears (real detected points, not decoration).
 *   2. PlanBuild — the areas of the real analysis populate one by one, the real top 3 resolves, then
 *      "Your plan is ready". Always skippable; nothing waits on the animation.
 * Restrained on purpose: no grids, no crosshairs, no sweeping lasers, no percentages.
 */

const Step = ({ label, state }: { label: string; state: "wait" | "run" | "done" }) => (
  <li className="flex items-center gap-2.5 text-sm">
    <span className="relative flex h-5 w-5 items-center justify-center">
      {state === "done" ? (
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={t("fast")} className="flex h-5 w-5 items-center justify-center rounded-full bg-status-success/20 text-[hsl(142_50%_70%)]">
          <Check className="h-3 w-3" aria-hidden="true" />
        </motion.span>
      ) : (
        <span className={`h-2 w-2 rounded-full ${state === "run" ? "animate-pulse bg-white/70 motion-reduce:animate-none" : "bg-white/20"}`} />
      )}
    </span>
    <span className={state === "wait" ? "text-muted-foreground" : "text-foreground"}>{label}</span>
  </li>
);

export const ScanStage = ({ photo, done, outline }: { photo?: string; done: boolean; outline?: { x: number; y: number }[] }) => {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setTick(1), 600);
    const b = setTimeout(() => setTick(2), 1200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  const state = (i: number): "wait" | "run" | "done" => (done || tick > i ? "done" : tick === i ? "run" : "wait");
  return (
    <div className="mx-auto max-w-sm text-center">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: DUR.slow, ease: EASE }}
        className="relative mx-auto aspect-[3/4] w-56 overflow-hidden rounded-3xl border border-white/10 bg-black"
      >
        {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
        {/* soft framing guide while checking */}
        {!done && <div aria-hidden="true" className="absolute inset-[14%_18%] rounded-[50%] border border-dashed border-white/25" />}
        {done && outline && (
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {outline.map((p, i) => (
              <motion.circle
                key={i} cx={p.x * 100} cy={p.y * 100} r={0.7} fill="white"
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: DUR.base, delay: reduce ? 0 : i * 0.012 }}
              />
            ))}
          </svg>
        )}
      </motion.div>
      <ul className="mx-auto mt-6 w-fit space-y-2 text-left" aria-live="polite">
        <Step label="Lighting" state={state(0)} />
        <Step label="Sharpness and angle" state={state(1)} />
        <Step label="Face landmarks" state={done ? "done" : tick >= 2 ? "run" : "wait"} />
      </ul>
    </div>
  );
};

export const PlanBuild = ({ analysis, onDone }: { analysis: Analysis; onDone: () => void }) => {
  const reduce = useReducedMotion();
  const mods = analysis.modules;
  const [n, setN] = useState(reduce ? mods.length + 2 : 0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setN((x) => (x > mods.length + 1 ? x : x + 1)), 170);
    return () => clearInterval(id);
  }, [reduce, mods.length]);
  const topReady = n > mods.length;
  const ready = n > mods.length + 1;
  const top = analysis.top3.map((id) => analysis.recs.find((r) => r.id === id)!).filter(Boolean);
  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm text-muted-foreground" aria-live="polite">{ready ? "Done" : "Building your plan…"}</p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {mods.map((m, i) => {
          const A = AREA[m.id];
          const shown = n > i;
          return (
            <motion.li
              key={m.id}
              initial={false}
              animate={{ opacity: shown ? 1 : 0.25, y: shown ? 0 : 4 }}
              transition={t("base")}
              className="surface-inset flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
            >
              <A.icon className="h-4 w-4 shrink-0" style={{ color: A.color }} aria-hidden="true" />
              <span className="truncate text-foreground">{A.label}</span>
              {shown && <Check className="ml-auto h-3.5 w-3.5 text-[hsl(142_50%_70%)]" aria-label="ready" />}
            </motion.li>
          );
        })}
      </ul>
      <AnimatePresence>
        {topReady && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t("slow")} className="mt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your top 3</p>
            <ol className="mt-2 space-y-2">
              {top.map((r, i) => (
                <li key={r.id} className="flex items-center gap-3 rounded-xl border border-white/10 border-l-[3px] px-3 py-2.5 text-sm text-foreground" style={{ borderLeftColor: AREA[r.module].color }}>
                  <span className="font-display text-muted-foreground">{i + 1}</span>
                  {r.title}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-8 text-center">
        <AnimatePresence>
          {ready && (
            <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={t("slow")} className="font-display text-3xl font-semibold text-foreground">
              Your plan is ready
            </motion.h1>
          )}
        </AnimatePresence>
        <button type="button" onClick={onDone} className={ready ? "btn-primary mt-5" : "mt-5 text-sm text-muted-foreground underline underline-offset-4"}>
          {ready ? <>See my plan <ArrowRight className="h-4 w-4" aria-hidden="true" /></> : "Skip"}
        </button>
      </div>
    </div>
  );
};
