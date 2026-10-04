import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { AREA } from "../areas";
import { GlowRing, RingLabel } from "../ring/GlowRing";
import { t } from "../motion";
import type { Analysis } from "../../types";

/**
 * The assessment sequence, built from the GlowMax Ring:
 *   ScanStage  portrait fades in → one vertical light pass → fine markers settle on the areas the
 *              plan covers (placed from the landmarks actually detected) → three real checks tick.
 *   PlanBuild  thin lines converge on the ring → "Building your protocol" while the real areas
 *              register → "Assessment complete" → the real top 3. Skippable at every point.
 * Deliberately NOT a face-recognition look: no mesh, no boxes, no IDs, no percentages on the face.
 */

type Pt = { x: number; y: number };
const EASE = [0.22, 1, 0.36, 1] as const;

// Indices into detector.ts OUTLINE_IDX: 0 forehead top, 8 right cheek edge, 18 chin, 28 left cheek edge, 36/37 eye corners.
const markersFrom = (o?: Pt[]): { label: string; at: Pt; side: "l" | "r" }[] => {
  if (o && o.length >= 38) {
    const top = o[0], chin = o[18], l = o[28], r = o[8], eyes = { x: (o[36].x + o[37].x) / 2, y: (o[36].y + o[37].y) / 2 };
    const h = chin.y - top.y;
    return [
      { label: "Hair", at: { x: top.x - 0.05, y: top.y - h * 0.12 }, side: "l" },
      { label: "Hairline", at: { x: top.x + 0.04, y: top.y + h * 0.02 }, side: "r" },
      { label: "Brows", at: { x: eyes.x - (r.x - l.x) * 0.18, y: eyes.y - h * 0.08 }, side: "l" },
      { label: "Skin", at: { x: r.x - (r.x - l.x) * 0.15, y: eyes.y + h * 0.18 }, side: "r" },
      { label: "Facial hair", at: { x: chin.x - 0.03, y: chin.y - h * 0.08 }, side: "l" },
      { label: "Profile", at: { x: r.x, y: eyes.y + h * 0.05 }, side: "r" },
    ];
  }
  return [
    { label: "Hair", at: { x: 0.45, y: 0.16 }, side: "l" },
    { label: "Hairline", at: { x: 0.55, y: 0.26 }, side: "r" },
    { label: "Brows", at: { x: 0.4, y: 0.38 }, side: "l" },
    { label: "Skin", at: { x: 0.62, y: 0.52 }, side: "r" },
    { label: "Facial hair", at: { x: 0.47, y: 0.7 }, side: "l" },
    { label: "Profile", at: { x: 0.7, y: 0.44 }, side: "r" },
  ];
};

const Step = ({ label, state }: { label: string; state: "wait" | "run" | "done" }) => (
  <li className="flex items-center gap-2.5">
    <span className="relative flex h-4 w-4 items-center justify-center">
      {state === "done" ? (
        <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={t("fast")} className="flex h-4 w-4 items-center justify-center rounded-full border border-[#ede6d6]/60 text-[#ede6d6]">
          <Check className="h-2.5 w-2.5" aria-hidden="true" />
        </motion.span>
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${state === "run" ? "animate-pulse bg-[#ede6d6] motion-reduce:animate-none" : "bg-white/20"}`} />
      )}
    </span>
    <RingLabel className={state === "wait" ? "text-white/50" : ""}>{label}</RingLabel>
  </li>
);

export const ScanStage = ({ photo, done, outline }: { photo?: string; done: boolean; outline?: Pt[] }) => {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [ratio, setRatio] = useState<number | null>(null); // image width / height
  useEffect(() => {
    const a = setTimeout(() => setTick(1), 600);
    const b = setTimeout(() => setTick(2), 1200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  useEffect(() => {
    if (!photo) return;
    const i = new Image();
    i.onload = () => setRatio(i.naturalWidth / i.naturalHeight);
    i.src = photo;
  }, [photo]);
  const state = (i: number): "wait" | "run" | "done" => (done || tick > i ? "done" : tick === i ? "run" : "wait");

  // Map image-space points into the 3:4 frame (object-cover crop).
  const frame = 3 / 4;
  const map = (p: Pt): Pt => {
    if (!ratio) return p;
    if (ratio > frame) { const s = ratio / frame; return { x: (p.x - 0.5) * s + 0.5, y: p.y }; }
    const s = frame / ratio; return { x: p.x, y: (p.y - 0.5) * s + 0.5 };
  };
  // Markers appear once the scan has finished, at the detected positions (or neutral ones if none).
  const markers = done ? markersFrom(outline).map((m) => ({ ...m, at: map(m.at) })) : [];

  return (
    <div className="mx-auto max-w-sm text-center">
      <div className="relative mx-auto w-48 sm:w-60">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-[28px] border border-white/10 bg-black"
        >
          {photo && <img src={photo} alt="" className="h-full w-full object-cover grayscale-[35%]" />}
          {/* one vertical light pass */}
          {!reduce && (
            <motion.div aria-hidden="true" className="absolute inset-y-0 w-[18%] bg-gradient-to-r from-transparent via-white/25 to-transparent mix-blend-screen" initial={{ left: "-20%" }} animate={{ left: "105%" }} transition={{ duration: 1.1, delay: 0.35, ease: [0.45, 0, 0.2, 1] }} />
          )}
        </motion.div>
        {/* markers sit outside the photo edge, with a hairline leader to the point */}
        <svg viewBox="0 0 100 133.33" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {markers.map((m, i) => {
            const x = m.at.x * 100, y = m.at.y * 133.33;
            const ex = m.side === "l" ? -6 : 106;
            return (
              <g key={m.label}>
                {/* ring marker → leader line → label, each marker ~120ms after the last */}
                <motion.circle cx={x} cy={y} r={1.8} fill="none" stroke="#ede6d6" strokeWidth={0.4} initial={reduce ? false : { scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ transformOrigin: `${x}px ${y}px` }} transition={{ delay: 0.05 + i * 0.12, duration: 0.3, ease: EASE }} />
                <circle cx={x} cy={y} r={0.5} fill="#ede6d6" />
                <motion.line x1={x + (m.side === "l" ? -1.8 : 1.8)} y1={y} x2={ex} y2={y} stroke="#ede6d6" strokeOpacity={0.45} strokeWidth={0.3} initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.17 + i * 0.12, duration: 0.3, ease: EASE }} />
              </g>
            );
          })}
        </svg>
        {markers.map((m, i) => (
          <motion.span
            key={m.label}
            initial={reduce ? false : { opacity: 0, x: m.side === "l" ? 6 : -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12, duration: 0.25 }}
            className="absolute whitespace-nowrap text-[11px] font-medium text-[#ede6d6]/85"
            style={{ top: `calc(${m.at.y * 100}% - 6px)`, ...(m.side === "l" ? { right: "calc(100% + 16px)" } : { left: "calc(100% + 16px)" }) }}
          >
            {m.label}
          </motion.span>
        ))}
      </div>
      <ul className="mx-auto mt-7 w-fit space-y-2 text-left" aria-live="polite">
        <Step label="Lighting" state={state(0)} />
        <Step label="Sharpness & angle" state={state(1)} />
        <Step label="Landmarks" state={done ? "done" : tick >= 2 ? "run" : "wait"} />
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
    const start = setTimeout(() => {
      const id = setInterval(() => setN((x) => (x > mods.length + 1 ? (clearInterval(id), x) : x + 1)), 150);
    }, 350);
    return () => clearTimeout(start);
  }, [reduce, mods.length]);
  const ready = n > mods.length;
  const top = analysis.top3.map((id) => analysis.recs.find((r) => r.id === id)!).filter(Boolean);
  const current = mods[Math.min(n, mods.length) - 1];
  return (
    <div className="relative mx-auto max-w-md text-center">
      {/* thin lines converging on the ring */}
      {!reduce && (
        <svg aria-hidden="true" viewBox="0 0 400 300" className="pointer-events-none absolute -top-10 left-1/2 h-[300px] w-[400px] -translate-x-1/2 overflow-visible">
          {[[-120, -40], [520, -40], [-120, 340], [520, 340], [200, -160]].map(([x, y], i) => (
            <motion.line key={i} x1={x} y1={y} x2={200} y2={110} stroke="#ede6d6" strokeWidth={0.6} initial={{ pathLength: 0, opacity: 0.6 }} animate={{ pathLength: 1, opacity: 0 }} transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }} />
          ))}
        </svg>
      )}
      <GlowRing state={ready ? "complete" : n === 0 ? "orbit" : "progress"} progress={Math.min(1, n / mods.length)} size={200} glint={ready} className="mx-auto">
        <AnimatePresence mode="wait">
          {ready ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={t("base")}>
              <Check className="mx-auto h-6 w-6 text-[#ede6d6]" aria-hidden="true" />
            </motion.div>
          ) : current ? (
            <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }} className="flex flex-col items-center gap-1">
              {(() => { const A = AREA[current.id]; return <A.icon className="h-5 w-5" style={{ color: A.color }} aria-hidden="true" />; })()}
              <RingLabel>{AREA[current.id].label}</RingLabel>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </GlowRing>
      <p className="mt-6" aria-live="polite"><RingLabel>{ready ? "Assessment complete" : "Building your protocol"}</RingLabel></p>
      <AnimatePresence>
        {ready && (
          <motion.ol initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.08 } } }} className="mt-6 space-y-2 text-left">
            {top.map((r, i) => (
              <motion.li key={r.id} variants={{ h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } } }} className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-foreground">
                <span className="font-display text-xs tabular-nums text-muted-foreground">0{i + 1}</span>
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: AREA[r.module].color }} />
                {r.title}
              </motion.li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
      <button type="button" onClick={onDone} className={ready ? "btn-primary mt-7" : "mt-7 text-sm text-muted-foreground underline underline-offset-4"}>
        {ready ? <>See my plan</> : "Skip"}
      </button>
    </div>
  );
};
