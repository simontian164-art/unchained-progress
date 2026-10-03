import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowLeftRight, ArrowUp, Ban, Brush, Check, ChevronDown, Copy, CornerUpLeft, Droplet, GripVertical, MapPin, Maximize2, Minus, Scissors, TriangleAlert, Waves, X } from "lucide-react";
import { HaircutDiagram } from "../visuals/diagrams/HaircutDiagram";
import { ReferenceImage } from "../visuals/ReferenceImage";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { mapsUrl } from "../engine/local";
import { SHAPE_LABEL } from "../engine/face";
import type { HairType, HaircutOption } from "../types";

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

const ROW_ICON: Record<string, typeof Scissors> = {
  Sides: ArrowLeftRight, Top: ArrowUp, Fringe: Minus, Neckline: ChevronDown, Sideburns: GripVertical, Temples: CornerUpLeft, Texture: Waves, Finish: Droplet, Beard: Brush,
};

/** The card a barber reads. Same layout inline and full screen. */
const BarberCard = ({ o, beardLine, hairType, flat }: { o: HaircutOption; beardLine?: string; hairType: HairType; flat?: boolean }) => {
  const rows: [string, string][] = [
    ["Sides", o.spec.sides],
    ["Top", o.spec.top],
    ["Fringe", o.spec.fringe],
    ["Temples", o.spec.temples],
    ["Neckline", o.spec.neckline],
    ["Sideburns", o.spec.sideburns],
    ["Texture", o.spec.texture],
    ["Finish", o.spec.finish],
    ...(beardLine ? ([["Beard", beardLine]] as [string, string][]) : []),
  ];
  return (
    <article role="tabpanel" aria-label={o.name} className={cn("rounded-3xl bg-[hsl(40_20%_96%)] p-6 text-[hsl(0_0%_8%)] sm:p-8", !flat && "shadow-2xl")} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[hsl(0_0%_35%)]">
            <Scissors className="h-3.5 w-3.5" aria-hidden="true" /> {SLOT_LABEL[o.slot]}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">{o.name}</h2>
          <p className="mt-2 text-base text-[hsl(0_0%_30%)]">Rebook {o.spec.rebook.toLowerCase()}</p>
        </div>
        <ReferenceImage
          refKey={`haircut:${o.id}:${hairType}`}
          fallbackKey={`haircut:${o.id}`}
          className="w-24 shrink-0 text-black/45 sm:w-32"
          fallback={<HaircutDiagram cutId={o.id} hairType={hairType} faceFill="hsl(40 20% 96%)" accent="#a16207" className="w-full text-black/45" />}
        />
      </div>
      <dl className="mt-6 divide-y divide-black/10 border-y border-black/10">
        {rows.map(([k, v]) => {
          const Icon = ROW_ICON[k] ?? Scissors;
          return (
            <div key={k} className="grid grid-cols-[112px_1fr] gap-3 py-3 sm:grid-cols-[150px_1fr]">
              <dt className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[hsl(0_0%_38%)]">
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {k}
              </dt>
              <dd className="text-lg leading-7">{v}</dd>
            </div>
          );
        })}
      </dl>
      {o.spec.avoid.length > 0 && (
        <div className="mt-5 rounded-2xl bg-black/[0.04] p-4">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[hsl(0_60%_35%)]"><Ban className="h-3.5 w-3.5" aria-hidden="true" /> Please avoid</p>
          <ul className="mt-2 space-y-1 text-lg leading-7">{o.spec.avoid.map((x) => <li key={x}>– {x}</li>)}</ul>
        </div>
      )}
    </article>
  );
};

const Barber = () => {
  usePageMeta("Show my barber");
  const { latest, state } = useApp();
  const a = latest!;
  const p = state.profile!;
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);
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

      <div role="tablist" aria-label="Haircut options" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {a.haircuts.map((h, i) => (
          <button
            key={h.slot}
            role="tab"
            aria-selected={i === idx}
            onClick={() => setIdx(i)}
            className={cn(
              "flex w-28 shrink-0 flex-col items-center rounded-2xl border p-2 text-center transition-colors duration-200",
              i === idx ? "border-[#facc15]/60 bg-white/[0.06]" : "border-white/10 hover:border-white/20",
              h.slot === "careful" && i !== idx && "border-amber-400/25",
            )}
          >
            <HaircutDiagram cutId={h.id} hairType={p.hairType} className="h-20 w-20" accent={h.slot === "careful" ? "#fbbf24" : "#facc15"} />
            <span className={cn("mt-1 text-[11px] font-medium uppercase tracking-wider", i === idx ? "text-foreground" : "text-muted-foreground")}>{SLOT_LABEL[h.slot]}</span>
            <span className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground">{h.name}</span>
          </button>
        ))}
      </div>

      {o.slot === "careful" && (
        <p className="flex gap-2 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-sm leading-6 text-amber-100">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {o.why[0]} {o.why[1]}
        </p>
      )}

      {/* The card itself: designed to turn the phone around. Large type, high contrast, no motion. */}
      <BarberCard o={o} beardLine={beardLine} hairType={p.hairType} />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="btn-primary btn-sm">
          {copied === "ok" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied === "ok" ? "Copied" : "Copy instructions"}
        </button>
        <a href={mapsUrl(isStylist ? "hair salon" : "barber shop", p)} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Find a {isStylist ? "salon" : "barber"} near {p.area?.trim() || "you"}
        </a>
        <button type="button" onClick={() => setFull(true)} className="btn-secondary btn-sm">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> Show full screen
        </button>
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
      {full && createPortal(
        <div role="dialog" aria-modal="true" aria-label={`${o.name}, barber card`} className="fixed inset-0 z-[80] overflow-y-auto bg-[hsl(40_20%_96%)] p-4 sm:p-8" onClick={() => setFull(false)}>
          <div className="mx-auto max-w-2xl">
            <button type="button" onClick={() => setFull(false)} className="mb-3 ml-auto flex items-center gap-1 rounded-full border border-black/15 px-3 py-1.5 text-sm text-black" autoFocus>
              <X className="h-4 w-4" aria-hidden="true" /> Close
            </button>
            <BarberCard o={o} beardLine={beardLine} hairType={p.hairType} flat />
          </div>
        </div>,
        document.body,
      )}
      <p className="text-xs leading-5 text-muted-foreground">Suggestions, not rules. A good barber may adapt them to your head shape, cowlicks and growth pattern, which photos can't fully show.</p>
    </div>
  );
};

export default Barber;
