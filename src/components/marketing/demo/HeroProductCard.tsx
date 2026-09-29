import { motion, useReducedMotion } from "framer-motion";
import { Check, Scissors, Droplets, Shirt, Sparkles } from "lucide-react";
import { FacePortrait } from "./FacePortrait";
import { PriorityChip } from "./PriorityChip";

const FOCUS = [
  { icon: Scissors, area: "Hair", text: "Shorter, tapered sides with texture on top", priority: "High impact" as const },
  { icon: Droplets, area: "Skin", text: "3-step routine + daily SPF for T-zone shine", priority: "High impact" as const },
  { icon: Sparkles, area: "Grooming", text: "Define the stubble neckline", priority: "Quick win" as const },
  { icon: Shirt, area: "Style", text: "Size tops for the shoulders, then taper", priority: "Medium impact" as const },
];

/** Hero visual: a realistic app window showing an example analysis. */
export const HeroProductCard = () => {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* soft light behind the window, kept subtle */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[48px] opacity-60 blur-3xl"
        style={{ background: "radial-gradient(60% 50% at 50% 30%, hsl(42 50% 50% / 0.12), transparent 70%)" }}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="surface-card overflow-hidden rounded-[22px]"
      >
        {/* window chrome */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <p className="text-xs text-muted-foreground">Your analysis</p>
          <span className="example-badge">Example</span>
        </div>

        <div className="grid gap-0 md:grid-cols-[0.9fr_1.4fr]">
          {/* photo column */}
          <div className="border-b border-white/[0.07] p-4 sm:p-5 md:border-b-0 md:border-r">
            <FacePortrait className="mx-auto aspect-[300/340] w-full max-w-[220px] md:max-w-none" scanning />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
              {["Front", "Side", "Full body"].map((p) => (
                <div key={p} className="surface-inset flex items-center justify-center gap-1 rounded-lg py-1.5">
                  <Check className="h-3 w-3 text-status-success" aria-hidden="true" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* analysis column */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Analysis overview</p>
                <p className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">Your top focus areas</p>
              </div>
              <p className="text-xs text-muted-foreground">5 areas · 15 actions</p>
            </div>

            <ul className="mt-5 space-y-2.5">
              {FOCUS.map((f, i) => (
                <motion.li
                  key={f.area}
                  initial={reduce ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.5 + i * 0.12 }}
                  className="surface-inset flex items-start gap-3 rounded-xl p-3"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                    <f.icon className="h-4 w-4 text-silver-bright" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{f.area}</p>
                      <PriorityChip priority={f.priority} />
                    </div>
                    <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{f.text}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="surface-inset rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">This week</p>
                <p className="mt-1 text-sm text-foreground">Book haircut · Start AM/PM routine</p>
              </div>
              <div className="surface-inset rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Next check-in</p>
                <p className="mt-1 text-sm text-foreground">New photos in 4 weeks</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
