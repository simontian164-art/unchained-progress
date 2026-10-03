import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock, Timer, Zap } from "lucide-react";
import { AREA } from "@/app/visuals/areas";
import { HaircutDiagram } from "@/app/visuals/diagrams/HaircutDiagram";
import { FacePortrait } from "./FacePortrait";

// Same areas, colours and signs as the real app, so the hero is an honest preview.
const FOCUS = [
  { id: "hair" as const, text: "New haircut: textured crop with a fringe", sign: "Big impact" },
  { id: "skin" as const, text: "Wear sunscreen every morning", sign: "Big impact" },
  { id: "beard" as const, text: "Shape it as heavy stubble (3–5 mm)", sign: "Quick" },
  { id: "style" as const, text: "Get key pieces tailored", sign: "Shows in weeks" },
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
            <FacePortrait className="mx-auto aspect-[300/340] w-full max-w-[220px] md:max-w-none" />
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
              {FOCUS.map((f, i) => {
                const A = AREA[f.id];
                const SignIcon = f.sign === "Big impact" ? Zap : f.sign === "Quick" ? Timer : Clock;
                return (
                  <motion.li
                    key={f.id}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-white/10 border-l-[3px] p-3"
                    style={{ borderLeftColor: A.color }}
                  >
                    <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider" style={{ color: A.color }}>
                      <A.icon className="h-3 w-3" aria-hidden="true" /> {A.label}
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">{f.text}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                      <SignIcon className="h-3 w-3" aria-hidden="true" /> {f.sign}
                    </span>
                  </motion.li>
                );
              })}
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="surface-inset flex items-center gap-2 rounded-xl p-3">
                <HaircutDiagram cutId="crop" className="h-12 w-12 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Barber card</p>
                  <p className="mt-0.5 text-sm text-foreground">Ready to show</p>
                </div>
              </div>
              <div className="surface-inset rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Morning routine</p>
                <p className="mt-1 text-sm text-foreground">Cleanse → Moisturize → SPF</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
