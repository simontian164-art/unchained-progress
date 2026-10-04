import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { RoutineSteps } from "../visuals/RoutineSteps";
import { HaircutDiagram } from "../visuals/diagrams/HaircutDiagram";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Check, CircleCheck, HeartHandshake, Info, MapPin, RefreshCw, Scissors, ShoppingBag, Sparkles } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { SHAPE_DESCRIPTION, SHAPE_LABEL } from "../engine/face";
import { mapsUrl } from "../engine/local";
import { AREA, AreaIcon, ObservationList, RecCard, Section, StatusPill } from "../components/Bits";
import type { ProNote } from "../types";

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

export const PRO_LABEL: Record<ProNote["who"], string> = {
  dermatologist: "Dermatologist",
  "hair-loss": "Dermatologist or hair-loss professional",
  dentist: "Dentist",
  orthodontist: "Orthodontist",
  doctor: "Doctor",
  barber: "Barber / stylist",
  stylist: "Stylist",
  tailor: "Tailor",
  therapist: "Doctor or therapist",
  optician: "Optician",
};

const APPROACH: Record<string, { label: string; hint: string }> = {
  style: { label: "Style around it", hint: "Nothing to fix; the right cut handles it" },
  track: { label: "Track it", hint: "Controlled photos at 8 weeks, 12 weeks and 6 months" },
  care: { label: "Change hair care", hint: "Less tension, heat or chemical stress" },
  pro: { label: "Consider a professional", hint: "They can examine your scalp; photos can't" },
};

const PHOTO_LABEL: Record<string, string> = { front: "Front", left: "Left", right: "Right", hairline: "Hairline", crown: "Crown", smile: "Smile", body: "Full body" };

const Report = () => {
  usePageMeta("Your analysis");
  const { latest, state, toggleTask } = useApp();
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const a = latest!;
  const p = state.profile!;
  const recById = new Map(a.recs.map((r) => [r.id, r]));
  const doneIds = new Set(state.tasks.filter((t) => t.done).map((t) => t.id));

  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [hash]);

  const pros = Object.entries(
    a.pros.reduce<Record<string, ProNote[]>>((acc, n) => ((acc[n.who] ||= []).push(n), acc), {}),
  ) as [ProNote["who"], ProNote[]][];

  return (
    <div className="space-y-6">
      {(params.get("new") === "1" || params.get("updated") === "1") && (
        <p role="status" className="flex items-start gap-3 rounded-2xl border border-status-success/30 bg-status-success/[0.08] p-4 text-sm text-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />
          <span>
            {params.get("updated") ? "Your plan has been rebuilt with your new answers." : "Your analysis and plan are ready."} Start with your top 3; everything else can wait.
          </span>
        </p>
      )}

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Analysis from {fmt(a.createdAt)}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">Your analysis</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/barber" className="btn-secondary btn-sm"><Scissors className="h-3.5 w-3.5" aria-hidden="true" /> Show my barber</Link>
          <Link to="/app/shop" className="btn-secondary btn-sm"><ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" /> Shop my plan</Link>
          <Link to="/app/start?step=photos" className="btn-secondary btn-sm"><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Re-analyze</Link>
        </div>
      </header>

      {a.wellbeing && (
        <div className="flex gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-5 text-sm leading-6 text-foreground">
          <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-silver-bright" aria-hidden="true" />
          <p>{a.wellbeing}</p>
        </div>
      )}

      <Section title="What's already working" id="working">
        <ul className="grid gap-2 sm:grid-cols-2">
          {a.working.map((w) => (
            <li key={w} className="flex gap-2 text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />{w}</li>
          ))}
        </ul>
      </Section>

      {a.keep && a.keep.length > 0 && (
        <Section title="No change needed" id="keep" action={<span className="text-xs text-muted-foreground">Keep doing these</span>}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {a.keep.map((k) => (
              <li key={k.id} className="surface-inset flex gap-3 rounded-xl p-3">
                <span className="relative">
                  <AreaIcon id={k.module} size="sm" />
                  <CircleCheck className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-background text-status-success" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{k.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{k.why}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Your top 3" id="top3" action={<span className="text-xs text-muted-foreground">Chosen for impact, ease and your goal</span>}>
        <ol className="space-y-3">
          {a.top3.map((id, i) => {
            const r = recById.get(id)!;
            return (
              <li key={id} className="flex gap-3">
                <span className="mt-4 font-display text-lg font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1"><RecCard r={r} done={doneIds.has(id)} onToggle={() => toggleTask(id)} /></div>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">Everything else is in <Link to="/app/plan" className="text-foreground underline underline-offset-4">your plan</Link>, spread over the coming weeks.</p>
      </Section>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="surface-card overflow-hidden rounded-2xl">
            <div className="grid grid-cols-3 gap-1 p-1">
              {state.photos.map((ph) => (
                <figure key={ph.slot} className={ph.slot === "front" ? "col-span-3" : ""}>
                  <img src={ph.dataUrl} alt={`Your ${PHOTO_LABEL[ph.slot].toLowerCase()} photo`} className={`${ph.slot === "front" ? "max-h-72 lg:max-h-none" : ""} aspect-[3/4] w-full rounded-xl object-cover`} />
                  {ph.slot !== "front" && <figcaption className="py-1 text-center text-[11px] text-muted-foreground">{PHOTO_LABEL[ph.slot]}</figcaption>}
                </figure>
              ))}
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground">Face shape</p>
              <p className="mt-1 font-display text-xl font-semibold text-foreground">{SHAPE_LABEL[a.faceShape]}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{SHAPE_DESCRIPTION[a.faceShape]}</p>
              <p className="mt-2 text-xs text-muted-foreground">{a.faceShapeSource === "measured" ? "Estimated from your photo." : "Chosen by you."} <Link to="/app/start?step=photos" className="underline underline-offset-2">Change</Link></p>
            </div>
          </div>
          {a.photoChecks.some((c) => !c.ok) && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-4 text-sm">
              <p className="font-medium text-amber-100">Your photo could be better</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">{a.photoChecks.filter((c) => !c.ok).map((c) => <li key={c.id}>{c.tip}</li>)}</ul>
            </div>
          )}
          <nav aria-label="Areas" className="surface-card hidden rounded-2xl p-4 lg:block">
            <ul className="space-y-1">
              {a.modules.map((m) => (
                <li key={m.id}>
                  <a href={`#${m.id}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
                    <span className="flex min-w-0 items-center gap-2"><AreaIcon id={m.id} size="sm" /> <span className="truncate">{m.title}</span></span> <StatusPill status={m.status} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 space-y-4">
          {a.modules.map((m) => (
            <section key={m.id} id={m.id} aria-labelledby={`${m.id}-h`} className="surface-card scroll-mt-20 rounded-2xl border-t-[3px] p-5 sm:p-6" style={{ borderTopColor: AREA[m.id].color }}>
              <div className="flex flex-wrap items-center gap-2">
                <AreaIcon id={m.id} />
                <h2 id={`${m.id}-h`} className="font-display text-xl font-semibold text-foreground">{m.title}</h2>
                <StatusPill status={m.status} />
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{m.summary}</p>

              {m.working.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {m.working.map((w) => <li key={w} className="flex gap-2 text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />{w}</li>)}
                </ul>
              )}

              {m.observations.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs text-muted-foreground">What we noticed</h3>
                  <div className="mt-2"><ObservationList items={m.observations} /></div>
                </div>
              )}

              {m.id === "hair" && a.haircuts[0] && (
                <Link to="/app/barber" className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.04] p-4 hover:border-white/25">
                  <span>
                    <span className="block text-xs text-muted-foreground">Best match</span>
                    <span className="mt-0.5 block text-[15px] font-medium text-foreground">{a.haircuts[0].name}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">Plus a low-maintenance, shorter and longer option</span>
                  </span>
                  <HaircutDiagram cutId={a.haircuts[0].id} hairType={p.hairType} className="h-20 w-20 shrink-0" />
                </Link>
              )}
              {m.id === "hair" && a.hairline && (
                <div className="mt-5 rounded-xl border border-white/10 p-4">
                  <h3 className="text-xs text-muted-foreground">Your hairline approach</h3>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {a.hairline.approach.map((x) => (
                      <li key={x} title={APPROACH[x].hint} className="rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-0.5 text-xs text-foreground">{APPROACH[x].label}</li>
                    ))}
                  </ul>
                  <ul className="mt-3 space-y-1 text-sm leading-6 text-muted-foreground">{a.hairline.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
                  {a.hairline.approach.includes("track") && (
                    <Link to="/app/progress#hairline" className="btn-secondary btn-sm mt-3">Open hairline tracking</Link>
                  )}
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">This is about what to do next, not a diagnosis. Hairlines, lighting and styling all vary.</p>
                </div>
              )}
              {m.id === "beard" && a.beard && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {a.beard.options.map((o) => (
                    <div key={o.id} className="surface-inset rounded-xl p-3">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                        {o.name} <span className="text-xs font-normal text-muted-foreground">{o.length}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] ${o.fit === "best" ? "border-[hsl(42_70%_50%/0.35)] text-[hsl(42_80%_72%)]" : o.fit === "careful" ? "border-amber-400/30 text-amber-200" : "border-white/15 text-muted-foreground"}`}>
                          {o.fit === "best" ? "Best match" : o.fit === "careful" ? "Approach carefully" : "Also works"}
                        </span>
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{o.why}</p>
                    </div>
                  ))}
                </div>
              )}
              {m.id === "skin" && (
                <div className="mt-5">
                  <RoutineSteps am={a.routine.am} pm={a.routine.pm} />
                </div>
              )}
              {m.recIds.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs text-muted-foreground">What to do</h3>
                  <div className="mt-2 space-y-2">
                    <AnimatePresence initial={false}>
                      {m.recIds.map((id) => <RecCard key={id} r={recById.get(id)!} done={doneIds.has(id)} onToggle={() => toggleTask(id)} />)}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {m.notes && m.notes.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {m.notes.map((n) => <li key={n} className="flex gap-2 text-sm leading-6 text-muted-foreground"><Info className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{n}</li>)}
                </ul>
              )}
              {m.pro && (
                <div className="mt-5 rounded-xl border border-sky-400/25 bg-sky-400/[0.06] p-4 text-sm leading-6 text-foreground">
                  <p className="text-xs text-sky-200">Worth a professional opinion</p>
                  <ul className="mt-1 space-y-1">{m.pro.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              )}
            </section>
          ))}

          <Section title="When to see a professional" id="pros">
            <p className="text-sm leading-6 text-muted-foreground">This app gives cosmetic and grooming suggestions. It doesn't replace any of these people, and it can't diagnose anything from photos.</p>
            <ul className="mt-4 space-y-3">
              {pros.map(([who, notes]) => (
                <li key={who} className="surface-inset rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{PRO_LABEL[who]}</p>
                    {notes[0].mapQuery && (
                      <a href={mapsUrl(notes[0].mapQuery, p)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-foreground underline underline-offset-4">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Find near {p.area?.trim() || "you"}
                      </a>
                    )}
                  </div>
                  <ul className="mt-1.5 space-y-1">{notes.map((n) => <li key={n.when} className="text-sm leading-6 text-muted-foreground">{n.when}</li>)}</ul>
                  {notes.some((n) => n.ask?.length || n.bring?.length) && (
                    <details className="mt-2">
                      <summary className="hit cursor-pointer text-sm text-foreground hover:underline">Arrive prepared</summary>
                      <div className="mt-2 grid gap-3 text-sm leading-6 sm:grid-cols-2">
                        {notes.some((n) => n.ask?.length) && (
                          <div>
                            <p className="text-xs text-muted-foreground">Questions to ask</p>
                            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground">{[...new Set(notes.flatMap((n) => n.ask ?? []))].map((q) => <li key={q}>{q}</li>)}</ul>
                          </div>
                        )}
                        {notes.some((n) => n.bring?.length) && (
                          <div>
                            <p className="text-xs text-muted-foreground">What to bring</p>
                            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground">{[...new Set(notes.flatMap((n) => n.bring ?? []))].map((q) => <li key={q}>{q}</li>)}</ul>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">These are things you told us. GlowMax isn't diagnosing anything.</p>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          <p className="text-xs leading-5 text-muted-foreground">
            Observations marked “Your photo” depend on lighting, angle and camera distance. Nothing here is a medical, dental or psychological assessment,
            and there are no attractiveness scores. Natural features aren't flaws; the plan focuses on changes you can choose to make.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
