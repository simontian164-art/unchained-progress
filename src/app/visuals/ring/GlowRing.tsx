import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * THE GLOWMAX RING — the product's one motion motif.
 *
 * Built from instrument geometry, not film imagery: an outer hairline (bezel), a 60-tick dial
 * (watch chapter ring), six independent arc segments (aperture blades) and a centre slot.
 *   orbit     segments drift at different speeds, the system "searching" (loading, scanning)
 *   progress  segments rotate toward alignment and lengthen as `progress` rises; ticks light up
 *   complete  segments lock into one closed ring; a single metallic glint travels the circumference
 * The same geometry is used for loading, assessment, daily missions, XP and unlocks.
 */

export const IVORY = "#ede6d6";
const R = 80; // segment ring radius in a 200×200 box
const C = 2 * Math.PI * R;
const SEGMENTS = 6;
// Each blade starts somewhere different; at progress 1 they all sit at their slot.
const OFFSETS = [140, -95, 60, -150, 110, -40];
const SPEEDS = [9, 13, 11, 15, 10, 17]; // seconds per revolution in orbit

export type RingState = "orbit" | "spin" | "progress" | "complete";

export const GlowRing = ({
  state = "progress",
  progress = 0,
  size = 200,
  color = IVORY,
  glint = false,
  className,
  children,
  label,
}: {
  state?: RingState;
  progress?: number;
  size?: number | string;
  color?: string;
  /** Run one metallic glint around the ring (e.g. on completion). */
  glint?: boolean;
  className?: string;
  children?: ReactNode;
  label?: string;
}) => {
  const reduce = useReducedMotion();
  const p = state === "complete" ? 1 : Math.max(0, Math.min(1, progress));
  const slot = 360 / SEGMENTS;
  // Blade length grows from 35% of its slot to 100% (closed ring).
  const blade = (state === "orbit" ? 0.3 : state === "spin" ? 0.6 : 0.35 + 0.65 * p) * (C / SEGMENTS);
  const litTicks = Math.round(p * 60);
  const uid = useId().replace(/:/g, "");
  // Blades are drawn into a mask, then a fixed-light metal stroke shows through it. The light source
  // stays put (top-left) while blades rotate under it, so they read as machined metal catching light
  // instead of flat dashes. Under the metal sits a soft dark offset for depth.
  const bw = state === "complete" ? 2.2 : 1.9;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }} role={label ? "img" : undefined} aria-label={label}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-lit`} gradientUnits="userSpaceOnUse" x1="30" y1="20" x2="170" y2="180">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.28" stopColor={color} />
            <stop offset="0.55" stopColor="#b8ad97" />
            <stop offset="0.78" stopColor={color} />
            <stop offset="1" stopColor="#8d826c" />
          </linearGradient>
          <mask id={`${uid}-blades`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
            {Array.from({ length: SEGMENTS }, (_, i) => {
              const base = i * slot - 90;
              const target = state === "orbit" || state === "spin" ? base : base + OFFSETS[i] * (1 - p);
              const moving = (state === "orbit" || state === "spin") && !reduce;
              return (
                <motion.g
                  key={i}
                  initial={false}
                  animate={moving ? { rotate: [base, base + (i % 2 ? -360 : 360)] } : { rotate: target }}
                  transition={moving ? { duration: state === "spin" ? 0.32 + i * 0.03 : SPEEDS[i], ease: "linear", repeat: Infinity } : { type: "spring", stiffness: 120, damping: 20, mass: 0.6 }}
                >
                  <motion.circle cx={100} cy={100} r={R} fill="none" stroke="#fff" strokeWidth={bw + 0.6} initial={false} animate={{ strokeDasharray: `${blade} ${C - blade}` }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />
                </motion.g>
              );
            })}
          </mask>
          <linearGradient id="gm-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#d9c08a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* bezel */}
        <circle cx={100} cy={100} r={96} fill="none" stroke={color} strokeOpacity={0.18} strokeWidth={0.75} />
        {/* dial: 60 ticks, every 5th longer */}
        <g>
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
            const long = i % 5 === 0;
            const r1 = 88;
            const r2 = long ? 92 : 90.5;
            return (
              <line
                key={i}
                x1={100 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)} x2={100 + r2 * Math.cos(a)} y2={100 + r2 * Math.sin(a)}
                stroke={color} strokeWidth={long ? 1 : 0.6}
                style={{ opacity: i < litTicks ? 0.9 : 0.2, transition: "opacity 200ms" }}
              />
            );
          })}
        </g>
        {/* inner guide ring: gives the blades a track to sit on */}
        <circle cx={100} cy={100} r={R - 6} fill="none" stroke={color} strokeOpacity={0.07} strokeWidth={0.6} />
        {/* aperture blades: shadow, then lit metal through the blade mask */}
        <g mask={`url(#${uid}-blades)`}>
          <circle cx={100.8} cy={101.2} r={R} fill="none" stroke="#000" strokeOpacity={0.55} strokeWidth={bw + 0.6} />
          <circle cx={100} cy={100} r={R} fill="none" stroke={`url(#${uid}-lit)`} strokeWidth={bw} />
        </g>
        {/* single metallic glint travelling once around the closed ring */}
        {glint && !reduce && (
          <motion.g initial={{ rotate: -90, opacity: 1 }} animate={{ rotate: 270, opacity: [1, 1, 0] }} transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}>
            <circle cx={100} cy={100} r={R} fill="none" stroke="url(#gm-metal)" strokeWidth={3} strokeDasharray={`${C * 0.08} ${C}`} />
          </motion.g>
        )}
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
};

/** Small instrument label: sentence case, quiet. (All-caps tracked labels read as template chrome.) */
export const RingLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("text-xs font-medium text-[#ede6d6]/75", className)}>{children}</span>
);
