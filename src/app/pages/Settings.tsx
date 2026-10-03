import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Download, HeartHandshake, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "../engine/local";
import { useRebuild } from "../useRebuild";
import type { Profile } from "../types";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FEATURES, SITE } from "@/config/site";
import { useApp } from "../store";

const Settings = () => {
  usePageMeta("Settings");
  const { state, resetAll } = useApp();
  const rebuild = useRebuild();
  const p = state.profile!;
  const [saved, setSaved] = useState(false);
  const update = (patch: Partial<Profile>) => {
    rebuild({ ...p, ...patch });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [exported, setExported] = useState(false);
  const size = (() => {
    try {
      return Math.round(new Blob([JSON.stringify(state)]).size / 1024);
    } catch {
      return 0;
    }
  })();

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${SITE.name.toLowerCase()}-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Settings</h1>

      <section aria-labelledby="answers" className="surface-card rounded-2xl p-5">
        <h2 id="answers" className="font-display text-base font-semibold text-foreground">Your answers</h2>
        <p className="mt-1 text-sm text-muted-foreground">Changed your routine, haircut or goals? Update your answers and your plan rebuilds.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/start" className="btn-secondary btn-sm">Update answers</Link>
          <Link to="/app/start?step=photos" className="btn-secondary btn-sm">New photos & re-analyze</Link>
        </div>
      </section>

      <section aria-labelledby="prefs" className="surface-card rounded-2xl p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="prefs" className="font-display text-base font-semibold text-foreground">Shopping preferences</h2>
          {saved && <span role="status" className="text-xs text-status-success">Saved · shopping list updated</span>}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="set-country" className="text-sm text-muted-foreground">Country</label>
            <select id="set-country" value={p.country} onChange={(e) => update({ country: e.target.value as Profile["country"] })} className="mt-1 h-11 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-sm text-foreground">
              {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="set-shop" className="text-sm text-muted-foreground">Where you shop</label>
            <select id="set-shop" value={p.shopping} onChange={(e) => update({ shopping: e.target.value as Profile["shopping"] })} className="mt-1 h-11 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-sm text-foreground">
              <option value="both">Local and online</option><option value="local">Local stores</option><option value="online">Online</option>
            </select>
          </div>
          <div>
            <label htmlFor="set-natural" className="text-sm text-muted-foreground">Natural / organic</label>
            <select id="set-natural" value={p.natural} onChange={(e) => update({ natural: e.target.value as Profile["natural"] })} className="mt-1 h-11 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-sm text-foreground">
              <option value="prefer">Prefer natural/organic</option><option value="mix">Mix of both</option><option value="none">No preference</option>
            </select>
          </div>
          <div>
            <label htmlFor="set-budget" className="text-sm text-muted-foreground">Budget</label>
            <select id="set-budget" value={p.budget} onChange={(e) => update({ budget: e.target.value as Profile["budget"] })} className="mt-1 h-11 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-sm text-foreground">
              <option value="low">Tight</option><option value="mid">Moderate</option><option value="high">Flexible</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {([["fragranceFree", "Fragrance-free"], ["vegan", "Vegan"], ["crueltyFree", "Cruelty-free"]] as const).map(([k, l]) => (
            <label key={k} className={cn("inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm focus-within:ring-2 focus-within:ring-white/40", p[k] ? "border-white/35 bg-white/[0.1] text-foreground" : "border-white/10 text-muted-foreground")}>
              <input type="checkbox" className="sr-only" checked={p[k]} onChange={(e) => update({ [k]: e.target.checked })} />
              {p[k] && <Check className="h-3.5 w-3.5" aria-hidden="true" />} {l}
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="plan" className="surface-card rounded-2xl p-5">
        <h2 id="plan" className="font-display text-base font-semibold text-foreground">Plan & billing</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {FEATURES.payments
            ? "Manage your subscription, payment method and invoices."
            : "Early access. Billing isn't connected yet, so there's nothing to manage and you haven't been charged."}
        </p>
        {FEATURES.payments && <button type="button" className="btn-secondary btn-sm mt-4">Manage billing</button>}
      </section>

      <section aria-labelledby="privacy" className="surface-card rounded-2xl p-5">
        <h2 id="privacy" className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-silver-bright" aria-hidden="true" /> Your photos and data
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Everything, including your photos, is stored only in this browser on this device ({size} KB). It isn't uploaded.
          That also means clearing your browser data, or switching device, starts you over, so export a copy if you want one.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={exportData} className="btn-secondary btn-sm">
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export my data
          </button>
          {!confirm ? (
            <button type="button" onClick={() => setConfirm(true)} className="btn-secondary btn-sm text-red-300">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete everything
            </button>
          ) : (
            <div role="alertdialog" aria-labelledby="del-q" className="w-full rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p id="del-q" className="text-sm text-foreground">Delete all photos, answers, analyses and progress from this device? This can't be undone.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => { resetAll(); navigate("/", { replace: true }); }} className="btn-sm inline-flex items-center rounded-full bg-red-500 px-4 font-medium text-white hover:bg-red-400">
                  Yes, delete everything
                </button>
                <button type="button" onClick={() => setConfirm(false)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
        {exported && <p role="status" className="mt-3 text-sm text-muted-foreground">Your data file was saved to your downloads.</p>}
      </section>

      <section aria-labelledby="wb" className="surface-card rounded-2xl p-5">
        <h2 id="wb" className="flex items-center gap-2 font-display text-base font-semibold text-foreground"><HeartHandshake className="h-4 w-4 text-silver-bright" aria-hidden="true" /> Keeping it healthy</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The plan is paced on purpose: a few actions at a time, check-ins every couple of weeks, no scores. If thinking about your appearance takes up
          a lot of your day, stops you doing things, or feels distressing, a doctor or therapist can help. You don't need to finish this plan first.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link> · <Link to="/terms" className="underline underline-offset-4">Terms</Link> · <Link to="/contact" className="underline underline-offset-4">Contact</Link>
      </p>
    </div>
  );
};

export default Settings;
