import { Link } from "react-router-dom";
import { Camera, Check, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { t } from "../visuals/motion";
import { GlowRing, RingLabel } from "../visuals/ring/GlowRing";
import { dayNumber, levelName, levelOf, missionOf, pad2, phaseOf, PROGRAM_DAYS, streakInfo, totalXp, XP, xpToday } from "../xp";
import { reward } from "../feedback";
import { usePageMeta } from "@/hooks/usePageMeta";
import { todayKey, useApp } from "../store";
import { RecCard } from "../components/Bits";
import { ReminderCard } from "../components/ReminderCard";
import type { RoutineStep } from "../types";
import TransformationHero from "../transformation/TransformationHero";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

/** Days in the last 7 where at least the morning or evening routine was fully done. No streaks: missing a day costs nothing. */
export const daysThisWeek = (log: Record<string, string[]>, am: string[], pm: string[]) => {
  let n = 0;
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const day = log[todayKey(d)] ?? [];
    if (am.every((id) => day.includes(id)) || pm.every((id) => day.includes(id))) n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
};

export const checkInEvery = (worry?: string) => (worry === "often" ? 28 : 14);

/** Small progress ring for a routine block (the GlowMax Ring, reduced to its arc). */
const MiniRing = ({ value, size = 22 }: { value: number; size?: number }) => {
  const r = size / 2 - 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(237,230,214,0.15)" strokeWidth={1.5} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ede6d6" strokeWidth={1.5} strokeLinecap="round" strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - value) }} transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.6 }} />
    </svg>
  );
};

/** Streak, prestige version: a number and seven dots, light travels across once. No flames, nothing to "lose" on screen. */
const Streak = ({ n, last7 }: { n: number; last7: boolean[] }) => (
  <div className="flex items-center gap-3">
    <div>
      <p className="text-xs text-muted-foreground">Streak</p>
      {n > 0 ? (
        <p className="font-display text-lg tabular-nums text-foreground">{pad2(n)} <span className="text-xs text-muted-foreground">day{n === 1 ? "" : "s"}</span></p>
      ) : (
        <p className="text-sm text-foreground">Starts today</p>
      )}
    </div>
    <div className="relative flex gap-1.5 overflow-hidden py-1" aria-label={`Active on ${last7.filter(Boolean).length} of the last 7 days`}>
      {last7.map((on, i) => (
        <motion.span key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 * i, duration: 0.25 }} className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-[#ede6d6]" : "bg-white/15", i === 6 && on && "shadow-[0_0_8px_rgba(237,230,214,0.7)]")} />
      ))}
      <motion.span aria-hidden="true" className="absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-white/60 to-transparent" initial={{ left: "-20%" }} animate={{ left: "120%" }} transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }} />
    </div>
  </div>
);

const Routine = ({ title, icon: Icon, steps, done, onToggle }: { title: string; icon: typeof Sun; steps: RoutineStep[]; done: string[]; onToggle: (id: string) => void }) => {
  const count = steps.filter((s) => done.includes(s.id)).length;
  return (
    <section aria-labelledby={`r-${title}`} className="surface-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 id={`r-${title}`} className="font-display text-base font-semibold text-foreground">{title}</h2>
        <AnimatePresence mode="wait" initial={false}>
          {count === steps.length && steps.length > 0 ? (
            <motion.span key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={t("base")} className="inline-flex items-center gap-1 rounded-full bg-status-success/15 px-2 py-0.5 text-xs text-[hsl(142_50%_70%)]">
              <Check className="h-3 w-3" aria-hidden="true" /> Done
            </motion.span>
          ) : (
            <motion.span key="count" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground"><MiniRing value={steps.length ? count / steps.length : 0} />{count}/{steps.length}</motion.span>
          )}
        </AnimatePresence>
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => {
          const on = done.includes(s.id);
          return (
            <li key={s.id}>
              <label className={cn("press flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-white/40", on ? "border-status-success/30 bg-status-success/[0.06]" : "border-white/10 hover:border-white/20")}>
                <input type="checkbox" checked={on} onChange={(e) => { if (!on) reward(e.currentTarget.parentElement, XP.routineStep); onToggle(s.id); }} className="sr-only" />
                <span aria-hidden="true" className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150", on ? "border-status-success bg-status-success text-background" : "border-white/30")}>
                  {on && <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={t("fast")}><Check className="h-3.5 w-3.5" strokeWidth={3} /></motion.span>}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-sm", on ? "text-muted-foreground line-through" : "text-foreground")}>{s.label}</span>
                  {s.detail && <span className="block text-xs leading-5 text-muted-foreground">{s.detail}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const Today = () => {
  usePageMeta("Today");
  const { state, latest, toggleRoutine, toggleTask } = useApp();
  const a = latest!;
  const done = state.routineLog[todayKey()] ?? [];
  const recById = new Map(a.recs.map((r) => [r.id, r]));
  const today = state.tasks.filter((t) => t.horizon === "today");
  const week = state.tasks.filter((t) => t.horizon === "week");
  const todayOpen = today.filter((t) => !t.done);
  const days = daysThisWeek(state.routineLog, a.routine.am.map((s) => s.id), a.routine.pm.map((s) => s.id));
  const every = checkInEvery(state.profile?.worry);
  const last = state.checkIns[0]?.date ?? state.planStartedAt;
  const since = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : 0;
  const due = Math.max(0, every - since);
  const weekNo = state.planStartedAt ? Math.floor((Date.now() - new Date(state.planStartedAt).getTime()) / (7 * 86400000)) + 1 : 1;

  // ── Daily mission + XP (actions only; nothing here is about appearance). Rewards are played by RewardDirector. ──
  const light = !!a.light; // calmer mode: progress ring stays, XP and streak fanfare are off
  const { done: missionDone, total: missionTotal, complete } = missionOf(state, a);
  const lvl = levelOf(totalXp(state, a));
  const gained = xpToday(state, a);
  const day = dayNumber(state.planStartedAt);
  const phase = phaseOf(day);
  const st = streakInfo(state);

  return (
    <div className="space-y-6">
      <TransformationHero guest={state.profile?.name === "Guest"} />

      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-sm text-muted-foreground">Day {Math.min(day, PROGRAM_DAYS)} of {PROGRAM_DAYS}, {phase.name.toLowerCase()} phase</p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-foreground">{greeting()}{state.profile?.name ? `, ${state.profile.name}` : ""}</h2>
        </div>
        <Link to="/app/briefing" className="press inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-foreground hover:border-white/25">
          Week {weekNo} briefing
        </Link>
      </header>

      {st.returning && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={t("base")} className="rounded-2xl border border-[#ede6d6]/15 bg-[#ede6d6]/[0.04] px-4 py-3 text-sm text-foreground">
          <RingLabel className="text-[#efe3c4]">Welcome back</RingLabel>
          <span className="ml-2">Day {pad2(day)} continues here. One step is enough to restart.</span>
        </motion.p>
      )}

      <div className="flex items-end justify-between gap-4 pt-2"><div><p className="text-xs font-semibold uppercase text-gold">Your actions</p><h2 className="mt-1 font-display text-2xl font-semibold text-foreground">What moves you forward today</h2></div></div>

      {/* Mission HUD: the GlowMax Ring as today's progress */}
      <section aria-label="Today's mission" className="surface-card flex items-center gap-5 overflow-hidden rounded-2xl p-5">
        <GlowRing state={complete ? "complete" : "progress"} progress={missionTotal ? missionDone / missionTotal : 0} size={96} glint={complete} label={`${missionDone} of ${missionTotal} done today`}>
          <span className="font-display text-xl font-light tabular-nums text-[#ede6d6]">{missionDone}<span className="text-xs text-[#ede6d6]/65">/{missionTotal}</span></span>
        </GlowRing>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div><dt className="text-xs text-muted-foreground">Today</dt><dd className="font-display text-lg tabular-nums text-foreground">{complete ? "Complete" : `${missionDone} / ${missionTotal}`}</dd></div>
            {light ? (
              <div><dt className="text-xs text-muted-foreground">Phase {phase.n}</dt><dd className="text-sm text-foreground">{phase.name}</dd></div>
            ) : (
              <div className="min-w-0"><dt className="text-xs text-muted-foreground">+{gained} XP today</dt><dd className="font-display text-lg tabular-nums text-foreground">Level {pad2(lvl.level)}</dd><dd className="text-xs text-muted-foreground">{levelName(lvl.level)}</dd></div>
            )}
          </dl>
          {!light && <Streak n={st.streak} last7={st.last7} />}
        </div>
      </section>

      <section aria-labelledby="today-h" className="surface-card rounded-2xl p-5 sm:p-6">
        <h2 id="today-h" className="font-display text-lg font-semibold text-foreground">Today</h2>
        {todayOpen.length ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">{todayOpen.length} small thing{todayOpen.length === 1 ? "" : "s"}. That's enough for today.</p>
            <div className="mt-4 space-y-2">{todayOpen.map((t, i) => recById.get(t.id) && <RecCard key={t.id} r={recById.get(t.id)!} done={t.done} next={i === 0} onToggle={() => toggleTask(t.id)} />)}</div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{today.length ? "Done for today. Nothing else needed." : "Nothing new today. Keep your routine going."}</p>
        )}
      </section>


      <div className="grid gap-4 md:grid-cols-2">
        <Routine title="Morning" icon={Sun} steps={a.routine.am} done={done} onToggle={(id) => toggleRoutine(id)} />
        <Routine title="Evening" icon={Moon} steps={a.routine.pm} done={done} onToggle={(id) => toggleRoutine(id)} />
      </div>

      {/* The reminder is asked for right after the first win of the day, with the reason in the question.
          It sits BELOW the routine so appearing never shifts what you are tapping. */}
      {!light && st.todayDone && (
        <ReminderCard
          day={day}
          context={complete ? `Day ${pad2(day)} done. Want a nudge at this time tomorrow so Day ${pad2(day + 1)} happens too?` : `Good start on Day ${pad2(day)}. Want a nudge at this time each day, so you don't have to remember?`}
        />
      )}

      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="week-h" className="surface-card min-w-0 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 id="week-h" className="font-display text-base font-semibold text-foreground">This week</h2>
            <Link to="/app/plan" className="hit text-sm text-muted-foreground hover:text-foreground">Full plan</Link>
          </div>
          {week.length ? (
            <ul className="mt-3 space-y-2">
              {week.map((t) => (
                <li key={t.id}>
                  <label className="press flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-3 hover:border-white/20 focus-within:ring-2 focus-within:ring-white/40">
                    <input type="checkbox" checked={t.done} onChange={(e) => { if (!t.done) reward(e.currentTarget.parentElement, recById.get(t.id)?.impact === "high" ? XP.taskHigh : XP.task); toggleTask(t.id); }} className="sr-only" />
                    <span aria-hidden="true" className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", t.done ? "border-status-success bg-status-success text-background" : "border-white/30")}>{t.done && <Check className="h-3.5 w-3.5" />}</span>
                    <span className={cn("flex-1 text-sm", t.done ? "text-muted-foreground line-through" : "text-foreground")}>{t.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nothing else this week.</p>
          )}
        </section>
        <section aria-labelledby="ci-h" className="surface-card flex flex-col rounded-2xl p-5">
          <h2 id="ci-h" className="font-display text-base font-semibold text-foreground">Check-in</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
            {due === 0 ? "A check-in photo is due. Same spot, light and distance as your first photo." : `Next check-in in ${due} day${due === 1 ? "" : "s"}. Checking more often mostly shows lighting changes.`}
          </p>
          <Link to={due === 0 ? "/app/checkin" : "/app/progress"} className={cn("mt-4", due === 0 ? "btn-primary" : "btn-secondary")}>{due === 0 ? "Take check-in" : "View progress"}</Link>
        </section>
      </div>
    </div>
  );
};

export default Today;
