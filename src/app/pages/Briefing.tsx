import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { RingLabel } from "../visuals/ring/GlowRing";
import { Odometer } from "../visuals/ring/Odometer";
import { AREA } from "../visuals/areas";
import { dayNumber, pad2, phaseOf, streakInfo, weekStats } from "../xp";
import { shareCard } from "../share";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Weekly briefing (L2, ~1.6s total): week number → rule extends → four counters roll up in sequence →
 * biggest win → next week's focus. Reads like an end-of-week report, not a game screen.
 */
const Briefing = () => {
  usePageMeta("Weekly briefing");
  const { state, latest } = useApp();
  const a = latest!;
  const light = !!a.light;
  const w = weekStats(state, a);
  const st = streakInfo(state);
  const day = dayNumber(state.planStartedAt);
  const week = Math.floor((day - 1) / 7) + 1;
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 350);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    { label: "Days active", v: w.days, suffix: "/7" },
    ...(light ? [] : [{ label: "XP earned", v: w.xp, prefix: "+" }, st.streak > 0 ? { label: "Day streak", v: st.streak } : { label: "Plan tasks done", v: state.tasks.filter((t) => t.done).length }]),
    { label: "Routine done", v: w.routinePct, suffix: "%" },
  ];
  const item = { h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } } };

  return (
    <motion.div initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.12 } } }} className="mx-auto max-w-2xl">
      <motion.p variants={item}><RingLabel>Weekly briefing · Phase {phaseOf(day).n}</RingLabel></motion.p>
      <motion.h1 variants={item} className="mt-2 font-display text-5xl font-extralight tracking-tight text-foreground">Week {pad2(week)}</motion.h1>
      <motion.div variants={{ h: { scaleX: 0 }, s: { scaleX: 1, transition: { duration: 0.5, ease: EASE } } }} className="my-6 h-px origin-left bg-[#ede6d6]/30" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={item} className="surface-card rounded-2xl p-4">
            <p className="font-display text-3xl font-light text-foreground">
              {s.prefix}
              <Odometer value={go ? s.v : 0} tween duration={0.8} />
              <span className="text-base text-muted-foreground">{s.suffix}</span>
            </p>
            <RingLabel className="mt-1 block">{s.label}</RingLabel>
          </motion.div>
        ))}
      </div>

      <motion.section variants={item} className="mt-6 rounded-2xl border border-[#ede6d6]/15 p-5">
        <RingLabel className="text-[#efe3c4]">Your biggest win</RingLabel>
        <p className="mt-2 text-lg text-foreground">{w.win ?? "This week starts with one step. Do one thing on Today."}</p>
      </motion.section>

      <motion.section variants={item} className="mt-4 rounded-2xl border border-white/10 p-5">
        <RingLabel>Next week's focus</RingLabel>
        {w.focus.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {w.focus.map((m) => {
              const A = AREA[m];
              return (
                <li key={m} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-foreground">
                  <A.icon className="h-4 w-4" style={{ color: A.color }} aria-hidden="true" /> {A.label}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Your plan is clear. Keep the routine and take your next check-in on time.</p>
        )}
      </motion.section>

      <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
        <Link to="/app" className="btn-primary press">Back to today</Link>
        <button type="button" className="btn-secondary press" onClick={() => shareCard({ eyebrow: "Weekly briefing", big: pad2(week), title: `Week ${pad2(week)}`, sub: `${w.days}/7 days · ${w.routinePct}% routine`, ring: w.days / 7 })}>
          <Share2 className="h-4 w-4" aria-hidden="true" /> Share week
        </button>
      </motion.div>
      <p className="mt-4 text-xs text-muted-foreground">Shared cards contain only these numbers. Never your photo or assessment.</p>
    </motion.div>
  );
};

export default Briefing;
