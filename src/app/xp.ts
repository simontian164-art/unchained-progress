/**
 * Progress points (XP) and levels. Earned ONLY for actions (routine steps, plan tasks, check-ins,
 * hairline sets) — never for how anyone looks. Derived from data the app already stores, so
 * XP can never be lost.
 */
import type { AppState, Analysis } from "./types";
import { todayKey } from "./store";

export const XP = { routineStep: 5, task: 40, taskHigh: 60, checkIn: 50, hairlineSet: 50 } as const;
/**
 * Front-loaded level curve. Early levels come fast (the first in ~2 days of routine) so the system
 * proves itself in week one; later levels stretch so a 90-day member reaches about level 8.
 * Cumulative XP needed to REACH each level (index 0 = level 1).
 */
export const LEVEL_AT = [0, 120, 350, 700, 1150, 1700, 2350, 3100, 3950, 4900];
const levelStart = (lvl: number) => (lvl <= LEVEL_AT.length ? LEVEL_AT[lvl - 1] : LEVEL_AT[LEVEL_AT.length - 1] + (lvl - LEVEL_AT.length) * 1000);
export const LEVEL_NAMES = ["Baseline", "Foundations", "Momentum", "Refinement", "Precision", "Signature", "Command", "Mastery"];

export const levelName = (lvl: number) => LEVEL_NAMES[Math.min(lvl - 1, LEVEL_NAMES.length - 1)];
export const pad2 = (n: number) => String(n).padStart(2, "0");

export function totalXp(state: AppState, latest?: Analysis) {
  const high = new Set(latest?.recs.filter((r) => r.impact === "high").map((r) => r.id) ?? []);
  const routine = Object.values(state.routineLog).reduce((n, d) => n + d.length, 0) * XP.routineStep;
  const tasks = state.tasks.filter((t) => t.done).reduce((n, t) => n + (high.has(t.id) ? XP.taskHigh : XP.task), 0);
  return routine + tasks + state.checkIns.length * XP.checkIn + (state.hairlineSets?.length ?? 0) * XP.hairlineSet;
}

export function levelOf(xp: number) {
  let level = 1;
  while (levelStart(level + 1) <= xp) level++;
  const start = levelStart(level), size = levelStart(level + 1) - start;
  const into = xp - start;
  return { level, into, size, toNext: size - into, progress: into / size, nextAt: start + size };
}

export function xpToday(state: AppState, latest?: Analysis) {
  const high = new Set(latest?.recs.filter((r) => r.impact === "high").map((r) => r.id) ?? []);
  const steps = (state.routineLog[todayKey()] ?? []).length * XP.routineStep;
  // Tasks don't store completion dates; count today's mission tasks that are done.
  const tasks = state.tasks.filter((t) => t.done && t.horizon === "today").reduce((n, t) => n + (high.has(t.id) ? XP.taskHigh : XP.task), 0);
  return steps + tasks;
}

export const dayNumber = (startedAt?: string) => (startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 86400000) + 1 : 1);

/** "Seen once" flags for celebrations, kept per browser. Fails safe (shows nothing) without storage. */
const SEEN = "glowmax_seen_v1";
export const seen = {
  get(): Record<string, string | number> {
    try {
      return JSON.parse(localStorage.getItem(SEEN) || "{}");
    } catch {
      return {};
    }
  },
  set(k: string, v: string | number) {
    try {
      localStorage.setItem(SEEN, JSON.stringify({ ...seen.get(), [k]: v }));
    } catch {
      /* storage unavailable */
    }
  },
};

// ─── Days, streaks, phases ─────────────────────────────────────────
const dayKey = (d: Date) => todayKey(d);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

/** A day counts as "active" if any routine step or plan task was completed that day. */
export function activeDays(state: AppState) {
  const set = new Set(Object.entries(state.routineLog).filter(([, v]) => v.length).map(([k]) => k));
  state.tasks.forEach((t) => t.done && t.doneOn && set.add(t.doneOn));
  return set;
}

/**
 * Forgiving streak: consecutive active days ending today (or yesterday, if today isn't done yet).
 * Missing a day ends it quietly — the 90-day Day count never resets, and the app says "welcome back".
 */
export function streakInfo(state: AppState) {
  const act = activeDays(state);
  const todayDone = act.has(dayKey(daysAgo(0)));
  let n = 0;
  for (let i = todayDone ? 0 : 1; act.has(dayKey(daysAgo(i))); i++) n++;
  const last7 = Array.from({ length: 7 }, (_, i) => act.has(dayKey(daysAgo(6 - i))));
  const everActive = act.size > 0;
  const returning = everActive && !todayDone && !act.has(dayKey(daysAgo(1)));
  return { streak: n, todayDone, last7, returning };
}

export const PROGRAM_DAYS = 90;
export const PHASES = [
  { n: "I", name: "Foundation", from: 1, to: 30, focus: "Routine, haircut and the basics" },
  { n: "II", name: "Refinement", from: 31, to: 60, focus: "Re-analysis and fine-tuning what's working" },
  { n: "III", name: "Presence", from: 61, to: 90, focus: "Style, posture and making it automatic" },
] as const;
export const phaseOf = (day: number) => PHASES.find((p) => day >= p.from && day <= p.to) ?? PHASES[2];

export function weekStats(state: AppState, latest?: Analysis) {
  const keys = Array.from({ length: 7 }, (_, i) => dayKey(daysAgo(i)));
  const act = activeDays(state);
  const high = new Set(latest?.recs.filter((r) => r.impact === "high").map((r) => r.id) ?? []);
  const steps = keys.reduce((n, k) => n + (state.routineLog[k]?.length ?? 0), 0);
  const weekTasks = state.tasks.filter((t) => t.done && t.doneOn && keys.includes(t.doneOn));
  const xp = steps * XP.routineStep + weekTasks.reduce((n, t) => n + (high.has(t.id) ? XP.taskHigh : XP.task), 0);
  const perDay = (latest?.routine.am.length ?? 0) + (latest?.routine.pm.length ?? 0);
  const routinePct = perDay ? Math.round((steps / (perDay * 7)) * 100) : 0;
  // Biggest win: the routine step done most often this week, else the most recent task finished.
  const count = new Map<string, number>();
  keys.forEach((k) => (state.routineLog[k] ?? []).forEach((id) => count.set(id, (count.get(id) ?? 0) + 1)));
  const topStep = [...count.entries()].sort((a, b) => b[1] - a[1])[0];
  const stepLabel = topStep && [...(latest?.routine.am ?? []), ...(latest?.routine.pm ?? [])].find((s) => s.id === topStep[0]);
  const win = weekTasks[0]?.title ?? (stepLabel ? `${stepLabel.label}, ${topStep![1]} times` : undefined);
  const openMods = state.tasks.filter((t) => !t.done && (t.horizon === "today" || t.horizon === "week" || t.horizon === "month")).map((t) => t.module);
  const focus = [...new Set(openMods)].slice(0, 2);
  return { days: keys.filter((k) => act.has(k)).length, xp, routinePct, win, focus };
}

/** Today's mission: today's plan tasks + every routine step. Shared by the HUD and the reward director. */
export function missionOf(state: AppState, latest: Analysis) {
  const done = state.routineLog[todayKey()] ?? [];
  const today = state.tasks.filter((t) => t.horizon === "today");
  const routineIds = [...latest.routine.am, ...latest.routine.pm].map((x) => x.id);
  const total = today.length + routineIds.length;
  const n = today.filter((x) => x.done).length + routineIds.filter((id) => done.includes(id)).length;
  return { done: n, total, complete: total > 0 && n === total };
}

/** What each level points you at. These areas already exist; the level-up is the moment we hand them over. */
export const PROTOCOL_AT: Record<number, { title: string; to: string }> = {
  2: { title: "Hair Strategy", to: "/app/barber" },
  3: { title: "Style Protocol", to: "/app/guides" },
  4: { title: "Posture & Presence", to: "/app/guides" },
  5: { title: "Hair Refinement", to: "/app/barber" },
  6: { title: "Re-analysis", to: "/app/progress" },
};
