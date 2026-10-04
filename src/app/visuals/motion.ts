/**
 * Motion tokens. One curve, three speeds. Every animation answers: what changed, what can I touch,
 * what's processing, what finished, where did it go. Reduced motion is handled globally by
 * <MotionConfig reducedMotion="user"> (transforms are dropped; opacity fades remain).
 */
import type { Transition, Variants } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const; // decelerate: things arrive and settle
export const EASE_EXIT = [0.4, 0, 1, 1] as const; // accelerate: things leave
export const DUR = { fast: 0.15, base: 0.24, slow: 0.4 } as const;

export const t = (d: keyof typeof DUR = "base", delay = 0): Transition => ({ duration: DUR[d], ease: EASE, delay });

/** Content that appears (panels, rows). */
export const appear: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: t("base") },
  exit: { opacity: 0, y: -4, transition: { duration: DUR.fast, ease: EASE_EXIT } },
};

/** Expand/collapse in place (accordions, "how to do it"). */
export const collapse: Variants = {
  hidden: { opacity: 0, height: 0 },
  show: { opacity: 1, height: "auto", transition: t("base") },
  exit: { opacity: 0, height: 0, transition: { duration: DUR.fast, ease: EASE_EXIT } },
};

/** Items leaving a list (a recommendation you removed): slide out and collapse, so you see where it went. */
export const leave = { opacity: 0, x: 24, height: 0, marginTop: 0, transition: { duration: DUR.base, ease: EASE_EXIT } };

/**
 * Springs. Tap = immediate and firm; ring = mechanical settle; number = smooth, no overshoot.
 */
export const SPRING = {
  tap: { type: "spring", stiffness: 700, damping: 32 } as Transition,
  ring: { type: "spring", stiffness: 120, damping: 20, mass: 0.6 } as Transition,
  card: { type: "spring", stiffness: 260, damping: 26 } as Transition,
};

/**
 * Reward hierarchy. Bigger reward = rarer + longer. Never block the next action.
 *   L1 micro      checkbox, routine step         200–500ms   tick, tiny XP transfer, light haptic
 *   L2 daily      all of today done              700–1500ms  ring closes, streak, medium haptic
 *   L3 milestone  7/30 days, phase change        1.5–2.5s    fuller reveal, shareable
 *   L4 major      level up, 90 days, unlock      2–4s        cinematic, rare, tap-through
 */
export const REWARD = {
  micro: { ms: 450 },
  daily: { ms: 1500 },
  milestone: { ms: 2400 },
  major: { ms: 3200 },
} as const;
