import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

/**
 * Mechanical number: each digit is its own drum. When a digit changes, the old one leaves
 * downward-and-up (by direction) and the new one arrives, like a watch date wheel.
 * `tween` counts through intermediate values first (1,420 → 1,434 → 1,461 → 1,490).
 */
export const Odometer = ({ value, pad = 0, tween = false, duration = 0.7, className }: { value: number; pad?: number; tween?: boolean; duration?: number; className?: string }) => {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  // Values arriving faster than the drum can turn (e.g. a loader %) run as plain figures until they settle.
  const lastAt = useRef(0);
  const [fast, setFast] = useState(false);
  useEffect(() => {
    const now = performance.now();
    const quick = now - lastAt.current < 180;
    lastAt.current = now;
    if (quick) setFast(true);
    const t = setTimeout(() => setFast(false), 220);
    return () => clearTimeout(t);
  }, [value]);
  const dir = value >= prev.current ? 1 : -1;
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (!tween || reduce || from === value) return setShown(value);
    const c = animate(from, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [value, tween, reduce, duration]);
  const str = String(shown).padStart(pad, "0");
  const chars = Number.isFinite(shown) ? [...str.replace(/\B(?=(\d{3})+(?!\d))/g, pad ? "" : ",")] : [];
  // While counting through values, digits change too fast for drums (and re-used keys can strand
  // a digit mid-exit), so the count runs as plain tabular figures and the drums are used for steps.
  if ((tween && shown !== value) || fast) return <span className={className} aria-label={String(value)} style={{ fontVariantNumeric: "tabular-nums" }}>{str.replace(/\B(?=(\d{3})+(?!\d))/g, pad ? "" : ",")}</span>;
  return (
    <span className={className} aria-label={String(value)} style={{ display: "inline-flex", fontVariantNumeric: "tabular-nums" }}>
      {chars.map((ch, i) => (
        <span key={chars.length - i} aria-hidden="true" style={{ position: "relative", display: "inline-block", overflow: "hidden", height: "1.1em", lineHeight: "1.1em" }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={ch}
              style={{ display: "inline-block" }}
              initial={reduce ? false : { y: dir > 0 ? "100%" : "-100%", opacity: 0, rotateX: -40 }}
              animate={{ y: "0%", opacity: 1, rotateX: 0 }}
              exit={reduce ? undefined : { y: dir > 0 ? "-100%" : "100%", opacity: 0, rotateX: 40 }}
              transition={{ duration: tween ? 0.12 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
};
