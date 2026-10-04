import { motion, useReducedMotion } from "framer-motion";
import { todayKey } from "../../store";
import { PHASES, PROGRAM_DAYS, pad2, phaseOf } from "../../xp";
import { RingLabel } from "./GlowRing";

/**
 * The 90-day journey as the GlowMax Ring: 90 ticks, one per day, in three phase arcs.
 * Active days glow, elapsed-but-quiet days stay dim (not red, not "missed"), today is marked.
 * Ticks light in sequence once on mount (~0.7s).
 */
export const JourneyDial = ({ startedAt, active, size = 260 }: { startedAt?: string; active: Set<string>; size?: number }) => {
  const reduce = useReducedMotion();
  const start = startedAt ? new Date(startedAt) : new Date();
  const today = Math.min(PROGRAM_DAYS, Math.floor((Date.now() - start.getTime()) / 86400000) + 1);
  const phase = phaseOf(today);
  const c = size / 2, R = size / 2 - 18;
  const days = Array.from({ length: PROGRAM_DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { n: i + 1, on: active.has(todayKey(d)) };
  });
  const gap = 0.05; // radians between phases
  const angle = (n: number) => {
    const p = PHASES.findIndex((x) => n >= x.from && n <= x.to);
    const span = (Math.PI * 2 - gap * 3) / PROGRAM_DAYS;
    return -Math.PI / 2 + gap / 2 + p * gap + (n - 1) * span;
  };
  return (
    <figure className="flex flex-col items-center" aria-label={`Day ${today} of ${PROGRAM_DAYS}, phase ${phase.n} ${phase.name}. Active on ${days.filter((d) => d.on).length} days.`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
          {days.map((d) => {
            const a = angle(d.n);
            const isToday = d.n === today;
            const past = d.n < today;
            const len = isToday ? 16 : d.on ? 11 : 7;
            const op = isToday ? 1 : d.on ? 0.9 : past ? 0.28 : 0.1;
            return (
              <motion.line
                key={d.n}
                x1={c + Math.cos(a) * (R - len)} y1={c + Math.sin(a) * (R - len)} x2={c + Math.cos(a) * R} y2={c + Math.sin(a) * R}
                stroke={isToday ? "#efe3c4" : "#ede6d6"} strokeWidth={isToday ? 2.2 : 1.4} strokeLinecap="round"
                initial={reduce ? false : { opacity: 0 }} animate={{ opacity: op }}
                transition={{ delay: reduce ? 0 : Math.min(d.n, today + 5) * 0.008, duration: 0.2 }}
              />
            );
          })}
          {PHASES.map((p, i) => {
            const a = (angle(p.from) + angle(p.to)) / 2;
            return (
              <text key={p.n} x={c + Math.cos(a) * (R + 11)} y={c + Math.sin(a) * (R + 11) + 3} textAnchor="middle" fontSize={8} letterSpacing={1.5} fill="#ede6d6" opacity={i === PHASES.indexOf(phase) ? 0.9 : 0.35}>
                {p.n}
              </text>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <RingLabel>Day</RingLabel>
          <p className="font-display text-5xl font-extralight tabular-nums text-[#ede6d6]">{pad2(today)}</p>
          <RingLabel className="text-[#ede6d6]/65">of {PROGRAM_DAYS}</RingLabel>
        </div>
      </div>
      <figcaption className="mt-4 text-center">
        <RingLabel className="text-[#efe3c4]">Phase {phase.n} · {phase.name}</RingLabel>
        <p className="mt-1 text-sm text-muted-foreground">{phase.focus}</p>
      </figcaption>
    </figure>
  );
};
