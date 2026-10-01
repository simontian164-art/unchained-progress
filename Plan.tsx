import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { AREA, NOT_FOR_ME, RecCard } from "../components/Bits";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ModuleId } from "../types";
import { useRebuild } from "../useRebuild";
import type { Horizon } from "../types";

const HORIZONS: { id: Horizon; title: string; hint: string }[] = [
  { id: "today", title: "Today", hint: "Up to 3 quick actions" },
  { id: "week", title: "This week", hint: "Your top priorities" },
  { id: "month", title: "This month", hint: "Once the basics are in place" },
  { id: "later", title: "Later", hint: "Only if you still want to" },
];

const Plan = () => {
  usePageMeta("Your plan");
  const { state, latest, toggleTask, setFeedback } = useApp();
  const rebuild = useRebuild();
  const hidden = latest!.hidden ?? [];
  const [area, setArea] = useState<ModuleId | "all">("all");
  const areas = [...new Set(state.tasks.map((t) => t.module))];
  const restore = (key: string) => {
    const next = { ...(state.feedback ?? {}) };
    delete next[key];
    setFeedback(key, null);
    if (state.profile) rebuild(state.profile, next);
  };
  const recById = new Map(latest!.recs.map((r) => [r.id, r]));
  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">Your plan</h1>
        <p className="mt-2 text-sm text-muted-foreground">{done} of {total} done. Ordered by impact and ease; you don't need to do everything.</p>
        <div role="radiogroup" aria-label="Show area" className="mt-4 flex flex-wrap gap-1.5">
          {(["all", ...areas] as const).map((id) => {
            const on = area === id;
            const A = id === "all" ? null : AREA[id];
            return (
              <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setArea(id)}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors", on ? "bg-white/[0.1] text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground")}
                style={on && A ? { borderColor: A.color } : undefined}>
                {A ? <A.icon className="h-3.5 w-3.5" style={{ color: A.color }} aria-hidden="true" /> : null}
                {A ? A.label : "Everything"}
              </button>
            );
          })}
        </div>
        {latest!.light && (
          <p className="mt-3 rounded-xl border border-white/15 bg-white/[0.04] p-3 text-sm leading-6 text-foreground">Your plan is short on purpose: a few steps, no photo-based observations, and check-ins every 4 weeks. Doing less is fine.</p>
        )}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Plan progress">
          <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
      </header>
      {HORIZONS.map((h) => {
        const tasks = state.tasks.filter((t) => t.horizon === h.id && (area === "all" || t.module === area));
        if (!tasks.length) return null;
        return (
          <section key={h.id} aria-labelledby={`h-${h.id}`} className="surface-card rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`h-${h.id}`} className="font-display text-lg font-semibold text-foreground">{h.title}</h2>
              <p className="text-xs text-muted-foreground">{h.hint}</p>
            </div>
            <div className="mt-4 space-y-2">
              {tasks.map((t) => recById.get(t.id) && <RecCard key={t.id} r={recById.get(t.id)!} done={t.done} onToggle={() => toggleTask(t.id)} />)}
            </div>
          </section>
        );
      })}
      {hidden.length > 0 && (
        <section aria-labelledby="h-hidden" className="rounded-2xl border border-dashed border-white/10 p-5">
          <h2 id="h-hidden" className="font-display text-base font-semibold text-foreground">Removed from your plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">You marked these "not for me", and your plan adjusted. Restore one any time.</p>
          <ul className="mt-3 space-y-2">
            {hidden.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-foreground">{h.title} <span className="text-xs text-muted-foreground">· {NOT_FOR_ME.find((x) => x.id === h.reason)?.label ?? "Not for me"}</span></span>
                <button type="button" onClick={() => restore(h.id)} className="text-xs text-foreground underline underline-offset-4">Restore</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Plan;
