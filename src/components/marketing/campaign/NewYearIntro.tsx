import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { campaignYear } from "@/config/site";

const KEY = "gm_ny";
const SEEN = "gm_ny_seen"; // once per visitor, not per session: a repeat visitor came to read, not to watch
const EASE = [0.22, 1, 0.36, 1] as const;
const SNAP = [0.65, 0, 0.35, 1] as const;
// Beats (ms). Total ≈ 1.6s, tap or Escape skips. Kept short: it sits in front of the first paint.
const BEATS = [{ at: 80, text: String(campaignYear()) }, { at: 420, text: "90 days." }, { at: 760, text: "Different standard." }];

/** Once per session: black → year → "90 days." → "Different standard." → the ring forms and opens into the hero. */
export const NewYearIntro = () => {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem(KEY) && !localStorage.getItem(SEEN);
    } catch {
      return false;
    }
  });
  const [beat, setBeat] = useState(-1);
  const [ring, setRing] = useState(false);
  const hole = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle at 50% 50%, transparent ${hole}px, #000 ${hole}px)`;

  const finish = () => {
    try { sessionStorage.setItem(KEY, "1"); localStorage.setItem(SEEN, "1"); } catch { /* ignore */ }
    setShow(false);
  };
  useEffect(() => {
    if (!show) return;
    if (reduce) return finish();
    const ts = BEATS.map((b, i) => setTimeout(() => setBeat(i), b.at));
    ts.push(setTimeout(() => setRing(true), 1060));
    ts.push(setTimeout(() => void animate(hole, Math.hypot(window.innerWidth, window.innerHeight), { duration: 0.4, ease: SNAP, onComplete: finish }), 1240));
    const k = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", k);
    return () => { ts.forEach(clearTimeout); window.removeEventListener("keydown", k); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduce]);

  if (!show) return null;
  return (
    <motion.div aria-hidden="true" onClick={finish} className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-[#000]" style={{ WebkitMaskImage: mask, maskImage: mask }}>
      <AnimatePresence mode="wait">
        {beat >= 0 && !ring && (
          <motion.p
            key={beat}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.14 } }}
            transition={{ duration: 0.3, ease: EASE }}
            className={beat === 0 ? "font-display text-7xl font-extralight tracking-tight text-[#ede6d6] sm:text-8xl" : "px-6 text-center font-display text-2xl font-light uppercase tracking-[0.2em] text-[#ede6d6] sm:text-4xl"}
          >
            {BEATS[beat].text}
          </motion.p>
        )}
      </AnimatePresence>
      {ring && (
        <svg viewBox="0 0 200 200" className="absolute h-56 w-56" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.circle
              key={i} cx={100} cy={100} r={80} fill="none" stroke="#ede6d6" strokeWidth={1.2} strokeLinecap="round"
              style={{ rotate: i * 60, transformOrigin: "100px 100px" }}
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1 / 6 - 0.012, opacity: 1 }}
              transition={{ duration: 0.25, delay: i * 0.025, ease: EASE }}
            />
          ))}
        </svg>
      )}
      <button type="button" onClick={finish} className="absolute bottom-6 right-6 text-xs text-white/60">Skip</button>
    </motion.div>
  );
};
