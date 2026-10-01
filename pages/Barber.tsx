import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Copy, MapPin, Scissors, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { mapsUrl } from "../engine/local";
import { SHAPE_LABEL } from "../engine/face";
import type { HaircutOption } from "../types";

const SLOT_LABEL: Record<HaircutOption["slot"], string> = {
  best: "Best match",
  low: "Low-maintenance",
  shorter: "Shorter option",
  longer: "Longer option",
  careful: "Approach carefully",
};

const specText = (o: HaircutOption, beard?: string) =>
  [
    `${o.name}`,
    `Sides: ${o.spec.sides}`,
    `Top: ${o.spec.top}`,
    `Fringe: ${o.spec.fringe}`,
    `Neckline: ${o.spec.neckline}`,
    `Sideburns: ${o.spec.sideburns}`,
    `Temples: ${o.spec.temples}`,
    `Texture: ${o.spec.texture}`,
    `Finish: ${o.spec.finish}`,
    ...(o.spec.avoid.length ? [`Please avoid: ${o.spec.avoid.join("; ")}`] : []),
    ...(beard ? [`Beard: ${beard}`] : []),
  ].join("\n");

const Barber = () => {
  usePageMeta("Show my barber");
  const { latest, state } = useApp();
  const a = latest!;
  const p = state.profile!;
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const o = a.haircuts[idx];
  const beardBest = a.beard?.options[0];
  const beardLine = beardBest && beardBest.id !== "clean" ? `${beardBest.name}, ${beardBest.length}. Blend sideburns into the beard.` : undefined;
  const isStylist = o && (o.spec.top.includes("overall") || p.presentation === "feminine");

  if (!o) return <p className="text-muted-foreground">No haircut options yet. <Link to="/app/start" className="underline">Update your answers</Link>.</p>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(specText(o, beardLine));
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    setTimeout(() => setCopied(null), 2500);
  };

  const rows: [string, string][] = [
    ["Sides", o.spec.sides],
    ["Top", o.spec.top],
    ["Fringe", o.spec.fringe],
    ["Neckline", o.spec.neckline],
    ["Sideburns", o.spec.sideburns],
    ["Temples", o.spec.temples],
    ["Texture", o.spec.texture],
    ["Finish", o.spec.finish],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/app/analysis#hair" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to analysis
      </Link>
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">Show my {isStylist ? "stylist" : "barber"}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Based on your {SHAPE_LABEL[a.faceShape].toLowerCase()} face shape, {p.hairDensity}-density {p.hairType} hair, hairline, and the time you want to spend.
          Show this screen at your appointment, or copy it into a booking note.
        </p>
      </header>

      <div role="tablist" aria-label="Haircut options" className="flex flex-wrap gap-1.5">
        {a.haircuts.map((h, i) => (
          <button
            key={h.slot}
            role="tab"
            aria-selected={i === idx}
            onClick={() => setIdx(i)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              i === idx ? "border-white/30 bg-white/[0.1] text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground",
              h.slot === "careful" && i !== idx && "border-amber-400/25",
            )}
          >
            {SLOT_LABEL[h.slot]}
          </button>
        ))}
      </div>

      {o.slot === "careful" && (
        <p className="flex gap-2 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-sm leading-6 text-amber-100">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {o.why[0]} {o.why[1]}
        </p>
      )}

      {/* The card itself: large type, high contrast, readable at arm's length */}
      <article role="tabpanel" aria-label={o.name} className="rounded-3xl bg-[hsl(40_20%_96%)] p-6 text-[hsl(0_0%_8%)] shadow-2xl sm:p-8">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[hsl(0_0%_35%)]">
          <Scissors className="h-3.5 w-3.5" aria-hidden="true" /> {SLOT_LABEL[o.slot]}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">{o.name}</h2>
        <dl className="mt-6 divide-y divide-black/10 border-y border-black/10">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[110px_1fr] gap-3 py-3 sm:grid-cols-[140px_1fr]">
              <dt className="text-sm font-medium uppercase tracking-wider text-[hsl(0_0%_38%)]">{k}</dt>
              <dd className="text-lg leading-7">{v}</dd>
            </div>
          ))}
          {beardLine && (
            <div className="grid grid-cols-[110px_1fr] gap-3 py-3 sm:grid-cols-[140px_1fr]">
              <dt className="text-sm font-medium uppercase tracking-wider text-[hsl(0_0%_38%)]">Beard</dt>
              <dd className="text-lg leading-7">{beardLine}</dd>
            </div>
          )}
        </dl>
        {o.spec.avoid.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-medium uppercase tracking-wider text-[hsl(0_0%_38%)]">Please avoid</p>
            <ul className="mt-2 space-y-1 text-lg leading-7">{o.spec.avoid.map((x) => <li key={x}>– {x}</li>)}</ul>
          </div>
        )}
        <p className="mt-5 text-sm text-[hsl(0_0%_35%)]">{o.spec.rebook}. Tip: bring 2–3 photos of someone with similar hair wearing this cut.</p>
      </article>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="btn-primary btn-sm">
          {copied === "ok" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied === "ok" ? "Copied" : "Copy instructions"}
        </button>
        <a href={mapsUrl(isStylist ? "hair salon" : "barber shop", p)} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Find a {isStylist ? "salon" : "barber"} near {p.area?.trim() || "you"}
        </a>
        <Link to="/app/shop#hair-product" className="btn-secondary btn-sm">Styling product</Link>
      </div>
      {copied === "fail" && <p role="alert" className="text-sm text-muted-foreground">Couldn't copy automatically. Take a screenshot of the card instead.</p>}

      {o.slot !== "careful" && (
        <section className="surface-card rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold text-foreground">Why this could work for you</h2>
          <ul className="mt-3 space-y-2">{o.why.map((w) => <li key={w} className="flex gap-2 text-sm leading-6 text-foreground"><Check className="mt-1 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />{w}</li>)}</ul>
          <h3 className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">Styling at home</h3>
          <ol className="mt-2 space-y-1.5">{o.styling.map((s, i) => <li key={s} className="text-sm text-foreground"><span className="text-muted-foreground">{i + 1}.</span> {s}</li>)}</ol>
          <p className="mt-3 text-sm text-muted-foreground">{o.maintenance}.</p>
        </section>
      )}

      {a.beard && (
        <section className="surface-card rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold text-foreground">Facial-hair lines</h2>
          <dl className="mt-3 space-y-3 text-sm leading-6">
            {([["Neckline", a.beard.neckline], ["Cheek line", a.beard.cheekLine], ["Moustache", a.beard.moustache], ["Sideburns", a.beard.sideburns]] as const).map(([k, v]) => (
              <div key={k}><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="text-foreground">{v}</dd></div>
            ))}
          </dl>
        </section>
      )}
      <p className="text-xs leading-5 text-muted-foreground">Suggestions, not rules. A good barber may adapt them to your head shape, cowlicks and growth pattern, which photos can't fully show.</p>
    </div>
  );
};

export default Barber;
