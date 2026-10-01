import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ExternalLink, Info, LocateFixed, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { amazonUrl, fmtRange, localCfg, mapsUrl, naturalQuery, shoppingUrl, type Coords } from "../engine/local";
import type { ShopItem } from "../types";

const GROUPS: { id: ShopItem["group"]; title: string; hint: string }[] = [
  { id: "essentials", title: "Essentials", hint: "Directly support your routine" },
  { id: "grooming", title: "Grooming", hint: "Hair, beard and brows" },
  { id: "optional", title: "Optional", hint: "Can help, not required" },
  { id: "style", title: "Style", hint: "Only if you're replacing things anyway" },
];
const CAPS = [
  { id: "all", label: "Everything" },
  { id: "50", label: "Under 50" },
  { id: "100", label: "Under 100" },
  { id: "200", label: "Under 200" },
] as const;

const Item = ({ it, included, coords }: { it: ShopItem; included: boolean; coords: Coords | null }) => {
  const { state } = useApp();
  const p = state.profile!;
  const [open, setOpen] = useState(false);
  const amz = it.onlineQuery ? amazonUrl(it.onlineQuery, p.country) : null;
  const wantLocal = p.shopping !== "online" && it.localQuery;
  const wantOnline = p.shopping !== "local" && it.onlineQuery;
  return (
    <li id={it.id} className={cn("scroll-mt-24 rounded-2xl border p-4 sm:p-5", included || it.owned ? "border-white/10" : "border-dashed border-white/10 opacity-70", it.owned && "opacity-80")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium text-foreground">{it.name}</h3>
          <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{it.purpose}</p>
        </div>
        <p className="shrink-0 text-right text-sm tabular-nums text-foreground">
          {fmtRange(it.price, p.country)}
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">estimate</span>
        </p>
      </div>
      {it.owned ? (
        <p className="mt-1 inline-flex rounded-full border border-status-success/35 bg-status-success/10 px-2 py-0.5 text-xs text-foreground">You already have this. Keep using it; not counted in your total.</p>
      ) : (
        !included && <p className="mt-1 text-xs text-muted-foreground">Outside this budget. Add it later if you still want it.</p>
      )}
      {it.flags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">{it.flags.map((f) => <li key={f} className="rounded-full border border-amber-400/25 bg-amber-400/[0.06] px-2 py-0.5 text-[11px] text-amber-100">{f}</li>)}</ul>
      )}
      {it.freeFirst && <p className="mt-2 text-sm text-foreground"><span className="text-muted-foreground">Free first:</span> {it.freeFirst}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {wantLocal && (
          <a href={mapsUrl(it.localQuery!, p, coords)} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Nearby {it.localQuery}
          </a>
        )}
        {wantOnline && (
          <a href={shoppingUrl(it.onlineQuery, p.country)} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Compare online
          </a>
        )}
        {wantOnline && amz && (
          <a href={amz} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">Amazon</a>
        )}
        {p.natural === "prefer" && it.preferenceNote && it.onlineQuery && (
          <a href={shoppingUrl(naturalQuery(it.onlineQuery), p.country)} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">Certified-organic options</a>
        )}
      </div>

      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mt-3 inline-flex items-center gap-1 text-sm text-foreground hover:underline">
        {open ? "Less" : "How to use, what to avoid"} <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <dl className="mt-3 grid gap-3 text-sm leading-6 sm:grid-cols-2">
          {it.replaces && <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Replaces</dt><dd className="text-foreground">{it.replaces}</dd></div>}
          <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">How</dt><dd className="text-foreground">{it.how}</dd></div>
          <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">When · how often</dt><dd className="text-foreground">{it.when} · {it.frequency}</dd></div>
          {it.avoidWith && <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Don't combine with</dt><dd className="text-foreground">{it.avoidWith.join("; ")}</dd></div>}
          {it.ingredients && (
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Ingredients to look for</dt>
              <dd><ul className="mt-1 space-y-1">{it.ingredients.map((g) => <li key={g.name} className="text-foreground"><span className="font-medium">{g.name}:</span> <span className="text-muted-foreground">{g.role}</span></li>)}</ul></dd>
            </div>
          )}
          {it.cheaper && <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Cheaper route</dt><dd className="text-foreground">{it.cheaper}</dd></div>}
          {it.preferenceNote && <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Natural / organic</dt><dd className="text-foreground">{it.preferenceNote}</dd></div>}
          {it.examples && (
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Examples to compare</dt>
              <dd className="text-foreground">{it.examples.join(" · ")}</dd>
              <dd className="mt-1 text-xs text-muted-foreground">Widely sold examples, not endorsements. Formula, price and availability not verified for your country; check the label.</dd>
            </div>
          )}
        </dl>
      )}
    </li>
  );
};

const Shop = () => {
  usePageMeta("Shop my plan");
  const { latest, state, saveProfile } = useApp();
  const a = latest!;
  const p = state.profile!;
  const { hash } = useLocation();
  const [cap, setCap] = useState<(typeof CAPS)[number]["id"]>("all");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locMsg, setLocMsg] = useState<string | null>(null);
  const [area, setArea] = useState(p.area ?? "");

  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [hash]);

  // Essentials first, then grooming, optional, style; include items until the budget cap is reached.
  const { included, total } = useMemo(() => {
    const limit = cap === "all" ? Infinity : Number(cap);
    let lo = 0;
    let hi = 0;
    const inc = new Set<string>();
    for (const g of GROUPS) {
      for (const it of a.shop.filter((x) => x.group === g.id)) {
        if (it.owned) continue;
        if (hi + it.price[1] <= limit || (cap === "all")) {
          inc.add(it.id);
          lo += it.price[0];
          hi += it.price[1];
        }
      }
    }
    return { included: inc, total: [lo, hi] as [number, number] };
  }, [a.shop, cap]);

  const freeActions = a.recs.filter((r) => r.cost === "free").slice(0, 5);
  const OWNED_LABEL: Record<string, string> = { cleanser: "cleanser", moisturizer: "moisturizer", sunscreen: "sunscreen", retinoid: "retinoid", "exfoliating-acid": "exfoliating acid", "benzoyl-peroxide": "benzoyl peroxide", azelaic: "azelaic acid", "vitamin-c": "vitamin C", niacinamide: "niacinamide", "anti-dandruff": "anti-dandruff shampoo", "hair-product": "styling product", trimmer: "trimmer" };
  const ownedList = [...new Set([...(p.owned ?? []), ...(p.usesSpf ? ["sunscreen"] : [])])].map((o) => OWNED_LABEL[o] ?? o);

  const useLocationNow = () => {
    if (!navigator.geolocation) return setLocMsg("Location isn't available in this browser. Enter a postcode or city instead.");
    setLocMsg("Asking for your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocMsg("Using your location for map searches this session. It isn't saved.");
      },
      () => setLocMsg("Location wasn't shared. Enter a postcode or city instead."),
      { maximumAge: 600000, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">Shop my plan</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Only what your plan uses, starting with the free steps. Prices are rough estimates in {localCfg(p.country).currency}. We don't sell anything or earn
          commission, and we don't show stock, distances or ratings we can't verify: the links open live map and shopping results.
        </p>
        {ownedList.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Not listed because you already have {ownedList.length === 1 ? "it" : "them"}: <span className="text-foreground">{ownedList.join(", ")}</span>.{" "}
            <Link to="/app/start" className="underline underline-offset-4">Edit</Link>
          </p>
        )}
      </header>

      <section aria-labelledby="free" className="rounded-2xl border border-status-success/25 bg-status-success/[0.05] p-5">
        <h2 id="free" className="flex items-center gap-2 font-display text-base font-semibold text-foreground"><Sparkles className="h-4 w-4 text-status-success" aria-hidden="true" /> Before you buy anything</h2>
        <ul className="mt-3 space-y-1.5">{freeActions.map((r) => <li key={r.id} className="text-sm text-foreground">• {r.title}</li>)}</ul>
      </section>

      <section aria-labelledby="where" className="surface-card rounded-2xl p-5">
        <h2 id="where" className="font-display text-base font-semibold text-foreground">Where you shop</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="shop-area" className="text-sm text-muted-foreground">Postcode or city</label>
            <input id="shop-area" value={area} onChange={(e) => setArea(e.target.value)} onBlur={() => saveProfile({ ...p, area })} placeholder="e.g. M5V or Toronto" className="mt-1 h-11 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 text-[15px] text-foreground placeholder:text-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40" />
          </div>
          <button type="button" onClick={useLocationNow} className="btn-secondary h-11"><LocateFixed className="h-4 w-4" aria-hidden="true" /> Use my location</button>
        </div>
        {locMsg && <p role="status" className="mt-2 text-xs text-muted-foreground">{locMsg}</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {["pharmacy", "natural beauty store", "health food store", "barber shop"].map((q) => (
            <a key={q} href={mapsUrl(q, { area }, coords)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-muted-foreground hover:text-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {q}
            </a>
          ))}
        </div>
        <p className="mt-3 flex gap-2 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />Availability not verified. Call ahead or check the store's site for stock and opening hours. Can't find it nearby? Use “Compare online”.</p>
      </section>

      <section aria-labelledby="budget" className="surface-card rounded-2xl p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="budget" className="font-display text-base font-semibold text-foreground">Estimated total</h2>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">{fmtRange(total, p.country)}</p>
            <p className="text-xs text-muted-foreground">Most items last 2–3 months. The haircut repeats every few weeks.</p>
          </div>
          <div role="radiogroup" aria-label="Budget" className="flex flex-wrap gap-1.5">
            {CAPS.map((c) => (
              <button key={c.id} type="button" role="radio" aria-checked={cap === c.id} onClick={() => setCap(c.id)} className={cn("rounded-full border px-3 py-1.5 text-sm", cap === c.id ? "border-white/30 bg-white/[0.1] text-foreground" : "border-white/10 text-muted-foreground")}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {GROUPS.map((g) => {
        const items = a.shop.filter((x) => x.group === g.id);
        if (!items.length) return null;
        return (
          <section key={g.id} aria-labelledby={`g-${g.id}`}>
            <div className="flex items-baseline justify-between gap-2">
              <h2 id={`g-${g.id}`} className="font-display text-lg font-semibold text-foreground">{g.title}</h2>
              <p className="text-xs text-muted-foreground">{g.hint}</p>
            </div>
            <ul className="mt-3 space-y-3">{items.map((it) => <Item key={it.id} it={it} included={included.has(it.id)} coords={coords} />)}</ul>
          </section>
        );
      })}
    </div>
  );
};

export default Shop;
