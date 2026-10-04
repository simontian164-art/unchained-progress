import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { xpBus, type XpEvent } from "../../feedback";
import { levelOf, pad2 } from "../../xp";
import { Odometer } from "./Odometer";

type Spark = { id: number; from: { x: number; y: number }; to: { x: number; y: number } };

/**
 * The XP bar that lives in the app header, so every reward has somewhere to GO.
 *  1. A completed action emits sparks from where you tapped.
 *  2. They travel to this bar (≈0.5s, slight arc, staggered).
 *  3. On arrival the fill eases forward, the total counts through its values, "+XP" shows, and a
 *     shine passes through the filled part. The app stays fully usable throughout.
 * At 90%+ of a level the bar's leading edge gently glows: "almost there".
 */
export const XpHud = ({ xp, onLevel }: { xp: number; onLevel?: (level: number) => void }) => {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(xp);
  const [gain, setGain] = useState<{ n: number; k: number } | null>(null);
  const [shine, setShine] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const real = useRef(xp);
  real.current = xp;
  const lvl = levelOf(shown);
  const lastLevel = useRef(lvl.level);

  // Arrival of XP from an action.
  useEffect(
    () =>
      xpBus.on((e: XpEvent) => {
        const land = () => {
          setShown(real.current);
          setGain({ n: e.amount, k: Date.now() });
          setShine((s) => s + 1);
        };
        const r = bar.current?.getBoundingClientRect();
        if (reduce || !e.from || !r) return land();
        const to = { x: r.left + r.width * Math.max(0.08, levelOf(real.current).progress), y: r.top + r.height / 2 };
        const base = Date.now();
        setSparks((s) => [...s, ...Array.from({ length: 5 }, (_, i) => ({ id: base + i, from: e.from!, to }))]);
        setTimeout(land, 560);
        setTimeout(() => setSparks((s) => s.filter((x) => x.id < base || x.id > base + 4)), 900);
      }),
    [reduce],
  );
  // Changes without an event (unticking, rebuilds) just settle.
  useEffect(() => {
    const t = setTimeout(() => setShown(real.current), 700);
    return () => clearTimeout(t);
  }, [xp]);
  useEffect(() => {
    if (lvl.level > lastLevel.current) onLevel?.(lvl.level);
    lastLevel.current = lvl.level;
  }, [lvl.level, onLevel]);
  useEffect(() => {
    if (!gain) return;
    const t = setTimeout(() => setGain(null), 1400);
    return () => clearTimeout(t);
  }, [gain]);

  const near = lvl.progress >= 0.9;
  return (
    <div className="flex items-center gap-2.5" aria-label={`Level ${lvl.level}, ${shown} XP, ${lvl.toNext} XP to next level`}>
      <span className="text-xs font-medium tabular-nums text-[#ede6d6]/70">Lv {pad2(lvl.level)}</span>
      <div ref={bar} className="relative h-[3px] w-16 overflow-visible rounded-full bg-white/10 sm:w-28 md:w-14 lg:w-28">
        <motion.div
          className="relative h-full overflow-hidden rounded-full"
          style={{ background: "linear-gradient(90deg,#bfb39b,#ede6d6 70%,#fff)" }}
          initial={false}
          animate={{ width: `${Math.max(2, lvl.progress * 100)}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence>
            {shine > 0 && !reduce && (
              <motion.span key={shine} aria-hidden="true" className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white to-transparent" initial={{ left: "-30%" }} animate={{ left: "120%" }} exit={{ opacity: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: "easeInOut" }} />
            )}
          </AnimatePresence>
        </motion.div>
        {near && (
          <span aria-hidden="true" className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#ede6d6] blur-[3px] motion-reduce:animate-none" style={{ left: `${lvl.progress * 100}%` }} />
        )}
      </div>
      <span className="relative text-[11px] text-[#ede6d6]/80 md:hidden lg:inline">
        <Odometer value={shown} tween />
        <AnimatePresence>
          {gain && (
            <motion.span key={gain.k} className="absolute -top-4 right-0 whitespace-nowrap text-[11px] font-medium text-[#e9d9a8]" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              +{gain.n} XP
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {sparks.length > 0 &&
        createPortal(
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
            {sparks.map((s, i) => {
              const mid = { x: (s.from.x + s.to.x) / 2 + (i % 2 ? 30 : -30), y: Math.min(s.from.y, s.to.y) - 40 };
              return (
                <motion.span
                  key={s.id}
                  className="absolute h-1.5 w-1.5 rounded-full bg-[#f4ead2] shadow-[0_0_8px_2px_rgba(244,234,210,0.55)]"
                  initial={{ x: s.from.x, y: s.from.y, scale: 0.6, opacity: 0 }}
                  animate={{ x: [s.from.x, mid.x, s.to.x], y: [s.from.y, mid.y, s.to.y], scale: [0.6, 1, 0.4], opacity: [0, 1, 0.9] }}
                  transition={{ duration: 0.5, delay: (s.id % 5) * 0.035, ease: [0.5, 0, 0.75, 0] }}
                />
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};
