import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ExternalLink, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { Section } from "../components/Bits";
import { BUILD, HEIGHT, PALETTE, UNDERTONE } from "../engine/kb/style";
import {
  BALANCE, FIT, NICHES, POSTURE, SEEN_ON, formulasFor, inspoQuery, instagramTagUrl, piecesFor, pinterestUrl, tiktokUrl, type Niche,
} from "../engine/kb/guides";
import type { Profile } from "../types";
import { OutfitFigure } from "../visuals/diagrams/OutfitFigure";
import { FitDiagram, type FitPart } from "../visuals/diagrams/FitDiagrams";
import { PostureDiagram as ExerciseDiagram, type Exercise } from "../visuals/diagrams/PostureDiagrams";

const TOPICS = [
  { id: "style", label: "Style inspiration" },
  { id: "fit", label: "Fit" },
  { id: "posture", label: "Posture" },
  { id: "balance", label: "Facial balance" },
] as const;
type Topic = (typeof TOPICS)[number]["id"];

const chip = (on: boolean) =>
  cn("rounded-full border px-3 py-1.5 text-sm transition-colors", on ? "border-white/30 bg-white/[0.1] text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground");

const ExtLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
    {children} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    <span className="sr-only">(opens in a new tab)</span>
  </a>
);

// ─── Style ────────────────────────────────────────────────────────
const NicheCard = ({ n, p, seenOn, recommended }: { n: Niche; p: Profile; seenOn: string; recommended: boolean }) => {
  const q = inspoQuery(n, p.presentation, seenOn);
  return (
    <article id={`niche-${n.id}`} className="scroll-mt-24 rounded-2xl border border-white/10 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg font-semibold text-foreground">{n.title}</h3>
        {recommended && (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-2 py-0.5 text-[11px] text-silver-bright">
            <Sparkles className="h-3 w-3" aria-hidden="true" /> Matches your answers
          </span>
        )}
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{n.summary}</p>

      <h4 className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Outfit formulas</h4>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {formulasFor(n, p.presentation).map((f, i) => (
          <li key={i} className="surface-inset overflow-hidden rounded-xl">
            <div className="flex items-center justify-center bg-white/[0.025] px-3 pt-3">
              <OutfitFigure formula={f} className="h-28 w-full max-w-[180px]" />
            </div>
            <div className="flex h-1.5" aria-hidden="true">
              {f.colors.map((c, j) => <span key={j} className="flex-1" style={{ background: c.hex }} />)}
            </div>
            <div className="p-3">
            <p className="text-sm leading-6 text-foreground">{f.pieces.join(" + ")}</p>
            <p className="text-xs text-muted-foreground">{f.colors.map((c) => c.name).join(" · ")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{f.when}</p>
            </div>
          </li>
        ))}
      </ul>

      <details className="group mt-3">
        <summary className="cursor-pointer text-sm text-foreground hover:underline">Key pieces, budget and what to avoid</summary>
        <div className="mt-3 grid gap-4 text-sm leading-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Key pieces</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground">{piecesFor(n, p.presentation).map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">On a budget</p>
              <p className="mt-1 text-foreground">{n.budget}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avoid</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground">{n.avoid.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
        </div>
      </details>

      <div className="mt-4 flex flex-wrap gap-2">
        <ExtLink href={pinterestUrl(q)}>Pinterest</ExtLink>
        <ExtLink href={tiktokUrl(q)}>TikTok</ExtLink>
        <ExtLink href={instagramTagUrl(n.hashtags[0])}>Instagram #{n.hashtags[0]}</ExtLink>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Searches “{q}”.</p>
    </article>
  );
};

const StyleTopic = ({ p }: { p: Profile }) => {
  const [seenOn, setSeenOn] = useState("any");
  const recommended = new Set(NICHES.filter((n) => n.matches.includes(p.vibe)).map((n) => n.id));
  const ordered = [...NICHES].sort((a, b) => Number(recommended.has(b.id)) - Number(recommended.has(a.id)));
  return (
    <div className="space-y-6">
      <Section title="What works on you" id="style-you">
        <ul className="space-y-2 text-sm leading-6 text-foreground">
          <li><span className="text-muted-foreground">Colors: </span>{PALETTE[p.contrast].colors}. {PALETTE[p.contrast].tip}</li>
          <li><span className="text-muted-foreground">Metals & tones: </span>{UNDERTONE[p.undertone]}</li>
          {p.build !== "skip" && <li><span className="text-muted-foreground">Build: </span>{BUILD[p.build][0]}</li>}
          {p.height !== "skip" && <li><span className="text-muted-foreground">Height: </span>{HEIGHT[p.height]}</li>}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Based on your contrast, undertone, build and height answers. Change them in Settings.</p>
      </Section>

      <Section title="Inspiration by style" id="niches">
        <fieldset>
          <legend className="text-sm text-foreground">Show inspiration featuring</legend>
          <p className="mt-0.5 text-xs text-muted-foreground">Optional. It only changes the search, so you see the styles on people who look like you. Every style works for everyone.</p>
          <div role="radiogroup" aria-label="Show inspiration featuring" className="mt-2 flex flex-wrap gap-1.5">
            {SEEN_ON.map((s) => (
              <button key={s.id} type="button" role="radio" aria-checked={seenOn === s.id} onClick={() => setSeenOn(s.id)} className={chip(seenOn === s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 space-y-4">
          {ordered.map((n) => <NicheCard key={n.id} n={n} p={p} seenOn={seenOn} recommended={recommended.has(n.id)} />)}
        </div>
        <p className="mt-4 flex gap-2 text-xs leading-5 text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Links open searches on other sites. We don't choose or check the results, and the photos belong to their creators.
        </p>
      </Section>
    </div>
  );
};

// ─── Fit ──────────────────────────────────────────────────────────
const FitTopic = ({ p }: { p: Profile }) => (
  <Section title="How clothes should fit" id="fit">
    <p className="text-sm leading-6 text-muted-foreground">Fit matters more than brand or price. Check these in the fitting room.</p>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
      {FIT.filter((f) => f.part !== "Fabric").map((f) => (
        <div key={f.part} className="surface-inset flex gap-3 rounded-xl p-3">
          <FitDiagram part={f.part as FitPart} className="h-20 w-24 shrink-0 [&_text]:hidden sm:[&_text]:inline" />
          <div className="min-w-0">
            <dt className="text-sm font-medium text-foreground">{f.part}</dt>
            <dd className="mt-0.5 text-sm leading-6 text-muted-foreground">{f.rule}</dd>
          </div>
        </div>
      ))}
    </dl>
    <p className="mt-3 text-sm leading-6 text-muted-foreground"><span className="text-foreground">Fabric: </span>{FIT.find((f) => f.part === "Fabric")?.rule}</p>
    {p.build !== "skip" && (
      <>
        <h3 className="mt-5 text-sm font-medium text-foreground">For your build</h3>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm leading-6 text-muted-foreground">{BUILD[p.build].map((x) => <li key={x}>{x}</li>)}</ul>
      </>
    )}
  </Section>
);

// ─── Posture ──────────────────────────────────────────────────────
const PostureDiagram = () => (
  <figure className="surface-inset rounded-xl p-4">
    <svg viewBox="0 0 320 200" className="mx-auto h-44 w-full max-w-sm" role="img" aria-labelledby="posture-t">
      <title id="posture-t">Side view: on the left the head sits forward of the shoulders; on the right ear, shoulder and hip stack in a line.</title>
      {[{ x: 80, fwd: 22, label: "Head forward" }, { x: 240, fwd: 0, label: "Stacked" }].map(({ x, fwd, label }) => (
        <g key={label} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" className="text-foreground">
          <line x1={x} y1="20" x2={x} y2="175" strokeDasharray="4 5" strokeWidth="1.5" className="text-muted-foreground" />
          <circle cx={x + fwd} cy="42" r="14" />
          <path d={`M${x + fwd * 0.6} 58 Q ${x + (fwd ? 8 : 0)} 72 ${x} 78`} />
          <path d={`M${x} 78 Q ${x - (fwd ? 10 : 3)} 104 ${x} 125`} />
          <path d={`M${x} 125 L ${x - 2} 175`} />
          <circle cx={x} cy="78" r="3.5" fill="currentColor" />
          <circle cx={x} cy="125" r="3.5" fill="currentColor" />
          <text x={x} y="195" textAnchor="middle" fontSize="12" stroke="none" fill="currentColor" className="text-muted-foreground">{label}</text>
        </g>
      ))}
    </svg>
    <figcaption className="mt-1 text-center text-xs text-muted-foreground">Ear, shoulder and hip roughly in one line, without forcing it.</figcaption>
  </figure>
);

const PostureTopic = () => (
  <div className="space-y-6">
    <Section title="Posture" id="posture">
      <p className="text-sm leading-6 text-muted-foreground">{POSTURE.intro}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <PostureDiagram />
        <div>
          <h3 className="text-sm font-medium text-foreground">Quick wall check</h3>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">{POSTURE.check.map((x) => <li key={x}>{x}</li>)}</ol>
        </div>
      </div>
    </Section>
    <Section title="10-minute routine" id="posture-routine">
      <ul className="space-y-2">
        {POSTURE.routine.map((r) => (
          <li key={r.name} className="surface-inset flex gap-3 rounded-xl p-3">
            <ExerciseDiagram exercise={r.name as Exercise} className="h-16 w-24 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[15px] font-medium text-foreground">{r.name}</p>
                <p className="text-xs tabular-nums text-muted-foreground">{r.dose}</p>
              </div>
              <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{r.how}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm leading-6 text-foreground">{POSTURE.frequency}</p>
    </Section>
    <Section title="Day to day" id="posture-daily">
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">{POSTURE.setup.map((x) => <li key={x}>{x}</li>)}</ul>
      <p className="mt-3 text-sm leading-6 text-foreground">{POSTURE.photos}</p>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{POSTURE.pro}</p>
    </Section>
  </div>
);

// ─── Facial balance ───────────────────────────────────────────────
const MirrorView = () => {
  const { state } = useApp();
  const front = state.photos.find((x) => x.slot === "front");
  if (!front) return null;
  return (
    <figure>
      <div className="grid max-w-md grid-cols-2 gap-3">
        {[false, true].map((flip) => (
          <div key={String(flip)}>
            <img src={front.dataUrl} alt={flip ? "Your front photo, flipped" : "Your front photo as taken"} className="aspect-[3/4] w-full rounded-xl object-cover" style={flip ? { transform: "scaleX(-1)" } : undefined} />
            <p className="mt-1.5 text-center text-xs text-muted-foreground">{flip ? "Flipped" : "As taken"}</p>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-sm leading-6 text-muted-foreground">
        {BALANCE.mirrorNote} Phones differ in whether they flip selfies, so either one could be your mirror view.
      </figcaption>
    </figure>
  );
};

const BalanceTopic = () => (
  <div className="space-y-6">
    <Section title="Facial balance" id="balance">
      <p className="text-sm leading-6 text-muted-foreground">{BALANCE.intro}</p>
      <div className="mt-4"><MirrorView /></div>
    </Section>
    <Section title="What you can even out" id="balance-how">
      <div className="space-y-4">
        {BALANCE.steps.map((s) => (
          <div key={s.title}>
            <h3 className="text-[15px] font-medium text-foreground">{s.title}</h3>
            <ol className="mt-1.5 space-y-1.5">
              {s.how.map((h, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-6 text-muted-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-[11px]">{i + 1}</span>
                  {h}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Section>
    <Section title="What won't help" id="balance-no">
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">{BALANCE.wontHelp.map((x) => <li key={x}>{x}</li>)}</ul>
      <p role="note" className="mt-4 flex gap-2 rounded-xl border border-[hsl(42_70%_50%/0.35)] bg-[hsl(42_70%_50%/0.08)] p-3 text-sm leading-6 text-foreground">
        <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-[hsl(42_80%_72%)]" aria-hidden="true" />
        {BALANCE.urgent}
      </p>
    </Section>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────
const Guides = () => {
  usePageMeta("Guides");
  const { state } = useApp();
  const p = state.profile!;
  const loc = useLocation();
  const nav = useNavigate();
  const fromHash = loc.hash.slice(1) as Topic;
  const [topic, setTopic] = useState<Topic>(TOPICS.some((t) => t.id === fromHash) ? fromHash : "style");
  useEffect(() => {
    if (TOPICS.some((t) => t.id === fromHash)) setTopic(fromHash);
  }, [fromHash]);
  const pick = (t: Topic) => {
    setTopic(t);
    nav({ hash: t }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">Guides</h1>
        <p className="mt-2 text-sm text-muted-foreground">How to do the things in your plan, plus style inspiration to borrow from.</p>
      </header>
      <div role="tablist" aria-label="Guide topics" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TOPICS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={topic === t.id} aria-controls="guide-panel" onClick={() => pick(t.id)} className={cn(chip(topic === t.id), "shrink-0")}>
            {t.label}
          </button>
        ))}
      </div>
      <div id="guide-panel" role="tabpanel" aria-labelledby={`tab-${topic}`}>
        {topic === "style" && <StyleTopic p={p} />}
        {topic === "fit" && <FitTopic p={p} />}
        {topic === "posture" && <PostureTopic />}
        {topic === "balance" && <BalanceTopic />}
      </div>
    </div>
  );
};

export default Guides;
