import { Link } from "react-router-dom";
import { ArrowRight, Camera, Check, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { todayKey, useApp } from "../store";
import { RecCard } from "../components/Bits";
import type { RoutineStep } from "../types";

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

const Routine = ({ title, icon: Icon, steps, done, onToggle }: { title: string; icon: typeof Sun; steps: RoutineStep[]; done: string[]; onToggle: (id: string) => void }) => {
  const count = steps.filter((s) => done.includes(s.id)).length;
  return (
    <section aria-labelledby={`r-${title}`} className="surface-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 id={`r-${title}`} className="flex items-center gap-2 font-display text-base font-semibold text-foreground"><Icon className="h-4 w-4 text-silver-bright" aria-hidden="true" /> {title}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">{count}/{steps.length}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => {
          const on = done.includes(s.id);
          return (
            <li key={s.id}>
              <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-white/40", on ? "border-status-success/30 bg-status-success/[0.06]" : "border-white/10 hover:border-white/20")}>
                <input type="checkbox" checked={on} onChange={() => onToggle(s.id)} className="sr-only" />
                <span aria-hidden="true" className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", on ? "border-status-success bg-status-success text-background" : "border-white/30")}>{on && <Check className="h-3.5 w-3.5" />}</span>
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Week {weekNo} of your plan</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">{greeting()}{state.profile?.name ? `, ${state.profile.name}` : ""}</h1>
        </div>
        <p className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-foreground">Routine this week: <span className="tabular-nums">{days}</span> of 7 days</p>
      </header>

      <section aria-labelledby="today-h" className="surface-card rounded-2xl p-5 sm:p-6">
        <h2 id="today-h" className="font-display text-lg font-semibold text-foreground">Today</h2>
        {todayOpen.length ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">{todayOpen.length} small thing{todayOpen.length === 1 ? "" : "s"}. That's enough for today.</p>
            <div className="mt-4 space-y-2">{todayOpen.map((t) => recById.get(t.id) && <RecCard key={t.id} r={recById.get(t.id)!} done={t.done} onToggle={() => toggleTask(t.id)} />)}</div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{today.length ? "Done for today. Nothing else needed." : "Nothing new today. Keep your routine going."}</p>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Routine title="Morning" icon={Sun} steps={a.routine.am} done={done} onToggle={(id) => toggleRoutine(id)} />
        <Routine title="Evening" icon={Moon} steps={a.routine.pm} done={done} onToggle={(id) => toggleRoutine(id)} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="week-h" className="surface-card min-w-0 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 id="week-h" className="font-display text-base font-semibold text-foreground">This week</h2>
            <Link to="/app/plan" className="text-sm text-muted-foreground hover:text-foreground">Full plan</Link>
          </div>
          {week.length ? (
            <ul className="mt-3 space-y-2">
              {week.map((t) => (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-3 hover:border-white/20 focus-within:ring-2 focus-within:ring-white/40">
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="sr-only" />
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
          <h2 id="ci-h" className="flex items-center gap-2 font-display text-base font-semibold text-foreground"><Camera className="h-4 w-4 text-silver-bright" aria-hidden="true" /> Check-in</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
            {due === 0 ? "A check-in photo is due. Same spot, light and distance as your first photo." : `Next check-in in ${due} day${due === 1 ? "" : "s"}. Checking more often mostly shows lighting changes.`}
          </p>
          <Link to="/app/progress" className={cn("mt-4", due === 0 ? "btn-primary" : "btn-secondary")}>{due === 0 ? "Take check-in" : "View progress"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </section>
      </div>
    </div>
  );
};

export default Today;
