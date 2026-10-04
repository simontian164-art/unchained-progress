import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { Share2 } from "lucide-react";
import { GlowRing, IVORY, RingLabel } from "./GlowRing";
import { Odometer } from "./Odometer";
import { pad2 } from "../../xp";
import { fx } from "../../feedback";

/**
 * GlowMax moments, ordered by the reward hierarchy (see motion.ts):
 *   L2 DayComplete · L3 Milestone · L4 LevelUp, ProtocolUnlock · plus the RingLoader.
 * All are skippable (tap / Escape), none blocks navigation, all collapse under reduced motion.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const SNAP = [0.65, 0, 0.35, 1] as const;

export const useCountUp = (to: number, duration = 0.8, from = 0) => {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : from);
  useEffect(() => {
    if (reduce) return setV(to);
    const c = animate(from, to, { duration, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to, from, duration, reduce]);
  return v;
};

const useDismiss = (onDone: () => void, ms: number) => {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current(), ms);
    const k = (e: KeyboardEvent) => e.key === "Escape" && done.current();
    window.addEventListener("keydown", k);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", k);
    };
  }, [ms]);
};

/** Tiny points drifting outward once. Not confetti: metallic dust, 20 points, one shot. */
const Dust = ({ n = 20, radius = 170 }: { n?: number; radius?: number }) => {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 3) * 0.2;
        const r = radius * (0.6 + ((i * 37) % 40) / 100);
        return (
          <motion.span
            key={i}
            className="absolute h-[3px] w-[3px] rounded-full bg-[#efe3c4]"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r, opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.4 + (i % 4) * 0.15, ease: [0.16, 1, 0.3, 1], delay: 0.05 * (i % 5) }}
          />
        );
      })}
    </div>
  );
};

// ─── Loader ───────────────────────────────────────────────────────
const LINES = ["Analyzing hair", "Reading profile", "Building routine", "Preparing protocol"];

/**
 * A point pulses; arcs appear one by one at different speeds; ticks fill in; context lines rotate;
 * the percentage only completes when `ready` is true; blades snap into one ring with a sweep;
 * "Protocol ready" holds ~400ms; then the ring's centre expands past the viewport and becomes the
 * mask that reveals the app. No hard cut.
 */
export const RingLoader = ({ ready, onDone }: { ready: boolean; onDone: () => void }) => {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [line, setLine] = useState(0);
  const [stage, setStage] = useState<"point" | "arcs" | "load" | "ready" | "open">(reduce ? "load" : "point");
  const hole = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle at 50% 50%, transparent ${hole}px, #000 ${hole}px)`;

  useEffect(() => {
    if (reduce) return;
    const a = setTimeout(() => setStage("arcs"), 260);
    const b = setTimeout(() => setStage("load"), 520);
    const c = animate(0, 90, { duration: 1.25, delay: 0.3, ease: [0.3, 0.8, 0.4, 1], onUpdate: (x) => setPct(Math.round(x)) });
    const w = setInterval(() => setLine((i) => Math.min(i + 1, LINES.length - 1)), 360);
    return () => { clearTimeout(a); clearTimeout(b); c.stop(); clearInterval(w); };
  }, [reduce]);

  useEffect(() => {
    if (!ready || (pct < 90 && !reduce)) return;
    if (reduce) return onDone();
    const c = animate(pct, 100, { duration: 0.2, onUpdate: (x) => setPct(Math.round(x)) });
    const a = setTimeout(() => { setStage("ready"); fx("ready"); }, 220);
    const b = setTimeout(() => {
      setStage("open");
      animate(hole, Math.hypot(window.innerWidth, window.innerHeight), { duration: 0.55, ease: SNAP, onComplete: onDone });
    }, 220 + 420);
    return () => { c.stop(); clearTimeout(a); clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pct >= 90, reduce]);

  const ringState = stage === "ready" || stage === "open" || pct >= 100 ? "complete" : pct < 35 ? "orbit" : "progress";
  return (
    <motion.div
      role="status" aria-live="polite" aria-label={stage === "ready" ? "Protocol ready" : "Loading"}
      onClick={() => ready && onDone()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000]"
      style={{ WebkitMaskImage: mask, maskImage: mask }}
    >
      <motion.div animate={stage === "open" ? { scale: 2.2, opacity: 0 } : { scale: 1, opacity: 1 }} transition={{ duration: 0.55, ease: SNAP }} className="flex flex-col items-center">
        <div className="relative" style={{ width: 230, height: 230 }}>
          {/* the point */}
          <motion.span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ede6d6]" initial={{ scale: 0 }} animate={{ scale: stage === "point" ? [0, 1.6, 1] : 0, opacity: stage === "point" ? 1 : 0 }} transition={{ duration: 0.35 }} />
          <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: stage === "point" ? 0 : 1, scale: stage === "point" ? 0.85 : 1 }} transition={{ duration: 0.35, ease: EASE }}>
            <GlowRing state={ringState} progress={pct / 100} size={230} glint={stage === "ready"}>
              <span className="font-display text-4xl font-extralight tracking-tight text-[#ede6d6] transition-opacity duration-300" style={{ opacity: stage === "point" || stage === "arcs" ? 0 : 1 }}>
                <Odometer value={pct} />
                <span className="text-base text-[#ede6d6]/65">%</span>
              </span>
            </GlowRing>
          </motion.div>
        </div>
        <div className="mt-8 h-5 overflow-hidden text-center">
          <AnimatePresence mode="wait">
            <motion.div key={stage === "ready" || stage === "open" ? "ready" : stage === "load" ? line : "init"} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
              <RingLabel className={stage === "ready" ? "text-[#efe3c4]" : ""}>
                {stage === "ready" || stage === "open" ? "Protocol ready" : stage === "load" ? LINES[line] : "Initializing"}
              </RingLabel>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── L2 · Day complete ────────────────────────────────────────────
export const DayComplete = ({ done, total, day, streak, last7, onShare, onDone }: { done: number; total: number; day: number; streak: number; last7: boolean[]; onShare?: () => void; onDone: () => void }) => {
  useDismiss(onDone, 4200);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setClosed(true); fx("day"); }, 220);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      role="status" aria-live="polite"
      initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}
      className="fixed inset-x-3 bottom-24 z-[90] mx-auto max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d]/95 p-5 shadow-2xl backdrop-blur md:bottom-8"
      onClick={onDone}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {closed && <motion.span aria-hidden="true" className="absolute inset-0 rounded-full border border-[#ede6d6]/50" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.9, opacity: 0 }} transition={{ duration: 0.9, ease: EASE }} />}
          <GlowRing state={closed ? "complete" : "progress"} progress={0.86} size={74} glint={closed}>
            <span className="font-display text-sm tabular-nums text-[#ede6d6]">{done}/{total}</span>
          </GlowRing>
        </div>
        <div className="min-w-0 flex-1">
          <RingLabel>Today complete</RingLabel>
          <p className="mt-0.5 font-display text-2xl font-light text-[#ede6d6]">Day {pad2(day)}</p>
          <div className="mt-2 flex items-center gap-1.5" aria-label={`${streak} day streak`}>
            {last7.map((on, i) => (
              <motion.span key={i} className="h-1.5 w-4 rounded-full" initial={{ backgroundColor: i === 6 ? "rgba(255,255,255,0.12)" : on ? "#ede6d6" : "rgba(255,255,255,0.12)" }} animate={{ backgroundColor: on ? "#ede6d6" : "rgba(255,255,255,0.12)" }} transition={{ delay: i === 6 ? 0.5 : 0, duration: 0.3 }} />
            ))}
            <span className="ml-1 text-xs text-[#ede6d6]/75">{streak > 1 ? "Streak extended" : "Day logged"}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
        <RingLabel className="text-[#ede6d6]/65">Come back tomorrow.</RingLabel>
        {onShare && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onShare(); }} className="inline-flex items-center gap-1 text-xs text-[#ede6d6] underline-offset-4 hover:underline">
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Share
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── L3 · Milestone / phase ───────────────────────────────────────
export const Milestone = ({ eyebrow, big, title, sub, onShare, onDone }: { eyebrow: string; big: string; title: string; sub?: string; onShare?: () => void; onDone: () => void }) => {
  useDismiss(onDone, onShare ? 5200 : 3200); // longer when there's a button to reach
  useEffect(() => fx("day"), []);
  return (
    <motion.div role="status" aria-live="polite" onClick={onDone} className="fixed inset-0 z-[95] flex cursor-pointer items-center justify-center bg-[#000]/92 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
      <div className="relative text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div className="shrink-0" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 0.5 }} transition={{ duration: 0.8, ease: EASE }}>
            <GlowRing state="complete" size={300} glint />
          </motion.div>
        </div>
        <motion.div className="relative" initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.18 } } }}>
          <motion.p variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0 } }}><RingLabel>{eyebrow}</RingLabel></motion.p>
          <motion.div variants={{ h: { opacity: 0, scaleX: 0 }, s: { opacity: 1, scaleX: 1 } }} className="mx-auto my-3 h-px w-24 bg-[#ede6d6]/40" />
          <motion.p variants={{ h: { opacity: 0, y: 14, filter: "blur(8px)" }, s: { opacity: 1, y: 0, filter: "blur(0px)" } }} className={`font-display font-extralight text-[#ede6d6] ${big.length > 4 ? "text-5xl sm:text-6xl" : "text-6xl"}`}>{big}</motion.p>
          <motion.p variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} className="mt-2 font-display text-xl text-[#ede6d6]">{title}</motion.p>
          {sub && <motion.p variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} className="mt-4"><RingLabel className="text-[#efe3c4]">{sub}</RingLabel></motion.p>}
          {onShare && (
            <motion.button variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} type="button" onClick={(e) => { e.stopPropagation(); onShare(); }} className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-[#ede6d6]">
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Share
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── L4 · Level up ────────────────────────────────────────────────
/**
 * 1 ring completes → 2 background darkens → 3 ring centres → 4 blades accelerate ~300ms →
 * 5 hard stop → 6 flash around the circumference → 7–8 old numeral leaves downward as the new one
 * rises → 9 LEVEL 05 / title → 10 dust drifts out → 11 new protocol → 12 CTA. Tap-through allowed
 * after the reveal (~1.3s).
 */
export const LevelUp = ({ level, name, protocol, onView, onShare, onDone }: { level: number; name: string; protocol?: string; onView?: () => void; onShare?: () => void; onDone: () => void }) => {
  const [step, setStep] = useState<"spin" | "stop" | "reveal">("spin");
  const [num, setNum] = useState(level - 1);
  const [canSkip, setCanSkip] = useState(false);
  useDismiss(onDone, 5200);
  useEffect(() => {
    fx("level");
    const a = setTimeout(() => setStep("stop"), 380);
    const b = setTimeout(() => { setStep("reveal"); setNum(level); }, 700);
    const c = setTimeout(() => setCanSkip(true), 1300);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, [level]);
  return (
    <motion.div
      role="dialog" aria-modal="true" aria-label={`Level ${level}: ${name}`}
      onClick={() => canSkip && onDone()}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-[96] flex items-center justify-center bg-[#000]/95 backdrop-blur-sm"
    >
      <div className="relative flex flex-col items-center text-center">
        {/* ring and numeral share one box so they stay concentric */}
        <div className="relative flex h-[260px] w-[260px] items-center justify-center">
          <motion.div className="absolute inset-0" initial={{ scale: 0.4, y: 120, opacity: 0 }} animate={{ scale: step === "reveal" ? 1.08 : 1, y: 0, opacity: 1 }} transition={{ duration: 0.45, ease: EASE }}>
            <GlowRing state={step === "spin" ? "spin" : "complete"} size={260} glint={step !== "spin"} />
          </motion.div>
          {step === "reveal" && <Dust />}
          <span className="relative font-display text-[96px] font-extralight leading-none text-[#ede6d6]" style={{ perspective: 400 }}>
            <Odometer value={num} pad={2} />
          </span>
        </div>
        <AnimatePresence>
          {step === "reveal" && (
            <motion.div initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }} className="relative mt-2 flex flex-col items-center">
              <motion.p variants={{ h: { opacity: 0, letterSpacing: "0.6em" }, s: { opacity: 1, letterSpacing: "0.28em" } }} className="text-xs font-medium text-[#ede6d6]/80">Level {pad2(level)}</motion.p>
              <motion.p variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0 } }} className="mt-1 font-display text-3xl text-[#ede6d6]">{name}</motion.p>
              {protocol && (
                <motion.div variants={{ h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0 } }} className="mt-7 rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-3">
                  <RingLabel className="text-[#efe3c4]">Your next protocol</RingLabel>
                  <p className="mt-0.5 text-[15px] text-[#ede6d6]">{protocol}</p>
                </motion.div>
              )}
              <motion.div variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} className="mt-5 flex items-center gap-3">
                {onView && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); onView(); }} className="btn-primary btn-sm">
                    Open protocol
                  </button>
                )}
                {onShare && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); onShare(); }} className="btn-secondary btn-sm">
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" /> Share
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── L4 · Protocol ready ─────────────────────────────────────────
/**
 * Four thin ring quadrants surround the card. They rotate a few degrees and part, a narrow vertical
 * highlight opens through the centre, and the card rises forward with depth. The mechanism is the
 * "lock": no padlock icon.
 */
export const ProtocolUnlock = ({ title, children, onView, onDone }: { title: string; children?: ReactNode; onView?: () => void; onDone: () => void }) => {
  useDismiss(onDone, 3600);
  useEffect(() => fx("unlock"), []);
  const R = 150;
  const quad = (i: number) => {
    const a0 = (i * 90 + 8) * (Math.PI / 180);
    const a1 = (i * 90 + 82) * (Math.PI / 180);
    return `M ${R * Math.cos(a0)} ${R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)}`;
  };
  const dirs = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
  return (
    <motion.div role="dialog" aria-modal="true" aria-label={`Protocol ready: ${title}`} onClick={onDone} className="fixed inset-0 z-[95] flex cursor-pointer items-center justify-center bg-[#000]/90 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
      <svg aria-hidden="true" viewBox="-200 -200 400 400" className="absolute h-[400px] w-[400px] overflow-visible">
        {dirs.map(([dx, dy], i) => (
          <motion.path key={i} d={quad(i)} fill="none" stroke={IVORY} strokeWidth={1.2} strokeLinecap="round" initial={{ rotate: 0, x: 0, y: 0, opacity: 0.9 }} animate={{ rotate: 6, x: dx * 14, y: dy * 14, opacity: 0.55 }} transition={{ duration: 0.55, ease: SNAP, delay: 0.2 }} />
        ))}
        <motion.line x1={0} y1={-170} x2={0} y2={170} stroke={IVORY} strokeWidth={1} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 0.9, 0.15] }} transition={{ duration: 0.7, delay: 0.3 }} />
      </svg>
      <motion.div
        style={{ transformPerspective: 800 }}
        initial={{ rotateX: 22, y: 24, scale: 0.88, opacity: 0, filter: "blur(6px)" }}
        animate={{ rotateX: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.45 }}
        className="relative w-[230px] rounded-2xl border border-white/12 bg-[#0b0b0b] p-5 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <GlowRing state="complete" size={56} glint className="mx-auto" />
        <p className="mt-3"><RingLabel>Protocol ready</RingLabel></p>
        <p className="mt-1 font-display text-xl text-[#ede6d6]">{title}</p>
        {children}
        <button type="button" onClick={() => (onView ? onView() : onDone())} className="mt-4 inline-flex items-center gap-1 text-sm text-[#ede6d6] hover:underline">
          View protocol
        </button>
      </motion.div>
    </motion.div>
  );
};
