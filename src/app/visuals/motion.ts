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
