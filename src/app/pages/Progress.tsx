import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { todayKey, useApp } from "../store";
import { CompareSlider } from "../visuals/CompareSlider";
import { EmptyState } from "../visuals/EmptyState";
import { Camera } from "lucide-react";
import { checkInEvery } from "./Today";
import HairlineTracking from "../components/HairlineTracking";
import { JourneyDial } from "../visuals/ring/JourneyDial";
import { activeDays, pad2 } from "../xp";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Share of daily routine steps completed, per week, for the last 6 weeks. */
const weeklyCompletion = (log: Record<string, string[]>, stepCount: number) => {
  const out: { label: string; pct: number }[] = [];
  const end = new Date();
  for (let w = 5; w >= 0; w--) {
    let done = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(end);
      day.setDate(end.getDate() - (w * 7 + d));
      done += Math.min(stepCount, (log[todayKey(day)] ?? []).length);
    }
    out.push({ label: w === 0 ? "This wk" : `${w}w ago`, pct: stepCount ? Math.round((done / (stepCount * 7)) * 100) : 0 });
  }
  return out;
};

const Progress = () => {
  usePageMeta("Progress");
  const { state, latest, removeCheckIn } = useApp();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [hash]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const every = checkInEvery(state.profile?.worry);
  const lastDate = state.checkIns[0]?.date ?? state.planStartedAt;
  const due = Math.max(0, every - (lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : every));

  const baseline = state.photos.find((p) => p.slot === "front");
  const series = [...state.checkIns].reverse();
  const first = baseline ? { photo: baseline.dataUrl, date: baseline.takenAt } : series[0] ? { photo: series[0].photo, date: series[0].date } : null;
  const last = state.checkIns[0];
  const stepCount = latest ? latest.routine.am.length + latest.routine.pm.length : 0;
  const weeks = useMemo(() => weeklyCompletion(state.routineLog, stepCount), [state.routineLog, stepCount]);
  const tasksDone = state.tasks.filter((t) => t.done).length;


  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">Progress</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tracked on what you do and your own photos every {every} days. No scores, no comparisons with anyone else.</p>
      </header>

      <section aria-label="Your 90 days" className="surface-card flex justify-center rounded-2xl p-6">
        <JourneyDial startedAt={state.planStartedAt} active={activeDays(state)} />
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs text-muted-foreground">Plan actions done</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-foreground">
            {tasksDone}<span className="text-base text-muted-foreground">/{state.tasks.length}</span>
          </p>
        </div>
        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs text-muted-foreground">Check-ins</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-foreground">{state.checkIns.length}</p>
        </div>
        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs text-muted-foreground">Routine this week</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-foreground">{weeks[5].pct}%</p>
        </div>
      </div>

      <section aria-labelledby="habit" className="surface-card rounded-2xl p-5">
        <h2 id="habit" className="font-display text-base font-semibold text-foreground">Daily routine, last 6 weeks</h2>
        <div className="mt-5 grid h-40 grid-cols-6 items-end gap-3" role="img" aria-label={`Routine completion by week: ${weeks.map((w) => `${w.label} ${w.pct}%`).join(", ")}`}>
          {weeks.map((w) => (
            <div key={w.label} className="flex h-full flex-col items-center justify-end gap-2">
              <span className="text-[11px] tabular-nums text-muted-foreground">{w.pct}%</span>
              <div className="relative w-full flex-1 overflow-hidden rounded-md bg-white/[0.05]">
                <div className="absolute inset-x-0 bottom-0 rounded-md bg-silver-bright/80" style={{ height: `${w.pct}%` }} />
              </div>
              <span className="text-[11px] text-muted-foreground">{w.label}</span>
            </div>
          ))}
        </div>
      </section>

      {first?.photo && last?.photo && (
        <section aria-labelledby="compare" className="surface-card rounded-2xl p-5">
          <h2 id="compare" className="font-display text-base font-semibold text-foreground">
            Before and now
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag across the photo to compare. Same frame and crop; nothing is edited.
          </p>
          <CompareSlider className="mx-auto mt-4 max-w-sm" before={first.photo} after={last.photo} beforeLabel={`Before · ${fmt(first.date)}`} afterLabel={`Now · ${fmt(last.date)}`} alt="Progress photo" caption={(() => { const n = Math.max(1, Math.round((new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000) + 1); return `Day 01 vs Day ${pad2(n)} · ${n} days of consistency`; })()} />
        </section>
      )}

      {(latest?.hairline || (state.hairlineSets?.length ?? 0) > 0) ? (
        <HairlineTracking />
      ) : (
        <details className="surface-card rounded-2xl p-5">
          <summary className="hit cursor-pointer font-display text-base font-semibold text-foreground">Hairline tracking (optional)</summary>
          <div className="mt-3"><HairlineTracking /></div>
        </details>
      )}

      <Link to="/app/checkin" className="surface-card press flex items-center justify-between gap-4 rounded-2xl p-5 hover:border-white/20">
        <span>
          <span className="block font-display text-base font-semibold text-foreground">{due === 0 ? "Check-in due" : "Next check-in"}</span>
          <span className="text-sm text-muted-foreground">{due === 0 ? "Take today's photo to compare with day 01." : `In ${due} day${due === 1 ? "" : "s"}.`}</span>
        </span>
        <span className={due === 0 ? "btn-primary btn-sm" : "btn-secondary btn-sm"}><Camera className="h-4 w-4" aria-hidden="true" /> {due === 0 ? "Take check-in" : "Open"}</span>
      </Link>

      {state.checkIns.length === 0 && (
        <EmptyState
          icon={Camera}
          title="No check-ins yet"
          body={`Your first check-in is due ${due > 0 ? `in ${due} days` : "now"}. Take it in the same spot and light as your setup photo so the before/now comparison is fair.`}
        />
      )}
      {state.checkIns.length > 0 && (
        <section aria-labelledby="history">
          <h2 id="history" className="font-display text-base font-semibold text-foreground">History</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {state.checkIns.map((c) => (
              <li key={c.id} className="surface-card overflow-hidden rounded-2xl">
                {c.photo && <img src={c.photo} alt={`Check-in from ${fmt(c.date)}`} className="aspect-[3/4] w-full object-cover" />}
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{fmt(c.date)}</p>
                    {confirmId === c.id ? (
                      <span className="flex gap-1">
                        <button type="button" className="rounded px-2 py-1 text-xs text-red-300 hover:bg-red-500/10" onClick={() => { removeCheckIn(c.id); setConfirmId(null); }}>Delete</button>
                        <button type="button" className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-white/5" onClick={() => setConfirmId(null)}>Keep</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => setConfirmId(c.id)} aria-label={`Delete check-in from ${fmt(c.date)}`} title="Delete" className="rounded p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {c.note && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Progress;
