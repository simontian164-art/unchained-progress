import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Link2, Plus, Share2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useDigitalProfile } from "@/app/digital/useDigitalProfile";
import { CompareSlider } from "@/app/visuals/CompareSlider";
import { cn } from "@/lib/utils";
import {
  CATEGORIES, STAGES, addGarment, deleteLook, fileToDataUri, getJobs, getLooks, getWardrobe, markSeen, pollAll,
  removeGarment, saveLook, startTryOn, subscribe, TryOnUnavailable,
  type Garment, type GarmentCategory, type SavedLook, type TryOnJob,
} from "@/app/style/tryOn";
import tee from "@/assets/style/tee.jpg";
import oxford from "@/assets/style/oxford.jpg";
import jeans from "@/assets/style/jeans.jpg";
import chinos from "@/assets/style/chinos.jpg";
import overshirt from "@/assets/style/overshirt.jpg";

const CURATED: Garment[] = [
  { id: "c-tee", category: "tops", image: tee, title: "Grey crew tee", source: "curated", createdAt: "" },
  { id: "c-oxford", category: "tops", image: oxford, title: "White oxford shirt", source: "curated", createdAt: "" },
  { id: "c-jeans", category: "bottoms", image: jeans, title: "Indigo straight jeans", source: "curated", createdAt: "" },
  { id: "c-chinos", category: "bottoms", image: chinos, title: "Stone chinos", source: "curated", createdAt: "" },
  { id: "c-overshirt", category: "outerwear", image: overshirt, title: "Navy wool overshirt", source: "curated", createdAt: "" },
];
const DISCLAIMER = "AI visualization. Fit and appearance may vary in real life.";
type Tab = "wardrobe" | "discover" | "saved";

function useStyleData() {
  const [wardrobe, setW] = useState<Garment[]>([]);
  const [looks, setL] = useState<SavedLook[]>([]);
  const [jobs, setJ] = useState<TryOnJob[]>([]);
  const load = useCallback(async () => {
    const [w, l, j] = await Promise.all([getWardrobe(), getLooks(), getJobs()]);
    setW(w); setL(l); setJ(j);
  }, []);
  useEffect(() => { void load(); void pollAll(); return subscribe(() => void load()); }, [load]);
  return { wardrobe, looks, jobs };
}

export default function StyleLab() {
  const { modelUrl, urls, state } = useDigitalProfile();
  const [selfPhoto, setSelfPhoto] = useState<string | null>(() => localStorage.getItem("glowmax_style_self"));
  const base = modelUrl ?? urls.body_front ?? urls.head_front ?? selfPhoto ?? undefined;
  const avatarId = modelUrl ? "digital-model" : urls.body_front ? "body_front" : urls.head_front ? "head_front" : "self-photo";

  const { wardrobe, looks, jobs } = useStyleData();
  const [tab, setTab] = useState<Tab>("wardrobe");
  const [cat, setCat] = useState<GarmentCategory | "all">("all");
  const [selected, setSelected] = useState<Garment | null>(null);
  const [stack, setStack] = useState<Garment[]>([]); // garments already on the current look
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [adding, setAdding] = useState(false);

  const job = jobs.find((j) => j.id === activeJobId) ?? null;
  const busy = starting || job?.status === "queued" || job?.status === "processing";
  const afterImage = job?.status === "complete" ? job.resultImage : undefined;
  // When stacking, the next item goes onto the last result.
  const currentBase = stack.length && afterImage ? afterImage : base;

  useEffect(() => { if (job?.status === "complete" && !job.seen) void markSeen(job.id); }, [job]);

  const items = useMemo(() => {
    const src = tab === "discover" ? CURATED : wardrobe;
    return cat === "all" ? src : src.filter((g) => g.category === cat);
  }, [tab, wardrobe, cat]);

  async function tryOn(g: Garment, onTopOf = false) {
    if (!base) return;
    setStarting(true);
    const garments = onTopOf ? [...stack, g] : [g];
    try {
      const id = await startTryOn({ avatarId, beforeImage: onTopOf && afterImage ? afterImage : base, garments });
      setActiveJobId(id);
      setStack(garments);
      setSelected(null);
    } catch (e) {
      if (e instanceof TryOnUnavailable) setUnavailable(true);
      else toast.error(e instanceof Error ? e.message : "Couldn't start the try-on.");
    } finally {
      setStarting(false);
    }
  }

  async function share() {
    if (!afterImage) return;
    try {
      const blob = await (await fetch(afterImage)).blob();
      const file = new File([blob], "glowmax-look.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "My GlowMax look" });
      else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "glowmax-look.jpg"; a.click(); }
    } catch { /* user cancelled */ }
  }

  const reset = () => { setActiveJobId(null); setStack([]); };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <header className="space-y-2">
        <Link to="/app/you" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> You</Link>
        <h1 className="text-3xl font-semibold uppercase tracking-[0.08em] md:text-4xl">Style Lab</h1>
        <p className="text-muted-foreground">See what actually works on you.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-[minmax(0,440px)_minmax(0,1fr)] md:items-start">
        {/* Digital You stays dominant */}
        <section className="space-y-3 md:sticky md:top-20" aria-label="Your Digital You">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card">
            {!base ? (
              <SelfPhotoPrompt loading={state === "loading"} onPick={(d) => { localStorage.setItem("glowmax_style_self", d); setSelfPhoto(d); }} />
            ) : afterImage && currentBase ? (
              <CompareSlider before={job!.beforeImage} after={afterImage} beforeLabel="Before" afterLabel="After" alt="Your look before and after the try-on" className="h-full w-full [&>div]:h-full" />
            ) : (
              <img src={currentBase} alt="Your Digital You" className={cn("absolute inset-0 h-full w-full object-cover transition-opacity", busy && "opacity-80")} />
            )}
            {busy && <StageOverlay stage={job?.stage ?? 0} />}
          </div>

          {job?.status === "failed" && !busy && (
            <div role="alert" className="rounded-xl border border-border bg-card p-3 text-sm">
              <p className="font-medium">That try-on didn't work.</p>
              <p className="text-muted-foreground">{job.error}</p>
              <button onClick={reset} className="mt-2 text-xs uppercase tracking-[0.16em] underline">Try another</button>
            </div>
          )}

          {afterImage && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Action onClick={async () => { await saveLook(job!); toast.success("Look saved"); }}>Save look</Action>
                <Action onClick={reset}>Try another</Action>
                <Action onClick={() => { setTab("wardrobe"); setAdding(true); toast("Pick another item to layer on top."); }}><Plus className="h-3.5 w-3.5" />Add item</Action>
                <Action onClick={share}><Share2 className="h-3.5 w-3.5" />Share</Action>
              </div>
              <p className="text-[11px] text-muted-foreground/70">{DISCLAIMER}</p>
            </>
          )}
          {base && selfPhoto && base === selfPhoto && (
            <button onClick={() => { localStorage.removeItem("glowmax_style_self"); setSelfPhoto(null); reset(); }} className="text-xs text-muted-foreground underline">Use a different photo</button>
          )}
        </section>

        <section className="space-y-5">
          {unavailable && (
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <p className="font-medium">Try-on isn't switched on yet.</p>
              <p className="text-muted-foreground">The clothing service needs to be connected before looks can be made. Your wardrobe and photo are kept.</p>
            </div>
          )}

          <div role="tablist" className="flex gap-6 border-b border-border">
            {([["wardrobe", "Wardrobe"], ["discover", "Discover"], ["saved", "Saved looks"]] as const).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("-mb-px border-b-2 pb-3 text-xs font-medium uppercase tracking-[0.18em]", tab === id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{label}{id === "saved" && looks.length ? ` (${looks.length})` : ""}</button>
            ))}
          </div>

          {tab !== "saved" && (
            <>
              <div className="flex flex-wrap gap-2">
                {(["all", ...CATEGORIES] as const).map((c) => (
                  <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em]", cat === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground")}>{c}</button>
                ))}
              </div>
              {tab === "wardrobe" && <AddGarment defaultCategory={cat === "all" ? "tops" : cat} />}
              {adding && afterImage && <p className="text-xs text-muted-foreground">Layering on your current look ({stack.length} item{stack.length > 1 ? "s" : ""}). <button className="underline" onClick={() => setAdding(false)}>Cancel</button></p>}
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{tab === "wardrobe" ? "Your wardrobe is empty. Upload a photo or paste a product link, or browse Discover." : "Nothing here in this category yet."}</p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {items.map((g) => (
                    <li key={g.id}>
                      <button onClick={() => setSelected(g)} className={cn("group relative block w-full overflow-hidden rounded-xl border bg-card text-left", selected?.id === g.id ? "border-foreground" : "border-border")}>
                        <img src={g.image} alt={g.title} loading="lazy" className="aspect-square w-full object-cover" />
                        <span className="block truncate px-2 py-1.5 text-xs">{g.title}</span>
                        {g.source !== "curated" && (
                          <span role="button" aria-label={`Remove ${g.title}`} onClick={(e) => { e.stopPropagation(); void removeGarment(g.id); }} className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "saved" && (looks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No saved looks yet. Try something on and press Save look.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {looks.map((l) => (
                <li key={l.id} className="space-y-1">
                  <CompareSlider before={l.before_image} after={l.result_image} beforeLabel="Before" afterLabel="After" alt="Saved look" className="aspect-[3/4] overflow-hidden rounded-xl [&>div]:h-full" />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{new Date(l.generated_at).toLocaleDateString()}</span>
                    <button aria-label="Delete look" onClick={() => void deleteLook(l.id)}><Trash2 className="h-3 w-3" /></button>
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </section>
      </div>

      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-4">
            <img src={selected.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selected.title}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{selected.category}</p>
            </div>
            <button onClick={() => setSelected(null)} aria-label="Close" className="p-2 text-muted-foreground"><X className="h-4 w-4" /></button>
            <button disabled={!base || busy} onClick={() => tryOn(selected, adding && !!afterImage)} className="rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-background disabled:opacity-50">
              {!base ? "Add your photo first" : busy ? "Working…" : "Try it on"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StageOverlay({ stage }: { stage: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5" role="status" aria-live="polite">
      <p className="animate-pulse text-xs font-medium uppercase tracking-[0.24em]">{STAGES[stage] ?? STAGES[0]}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">You can leave this page. We'll let you know when it's ready.</p>
    </div>
  );
}

const Action = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] hover:bg-card">{children}</button>
);

function SelfPhotoPrompt({ loading, onPick }: { loading: boolean; onPick: (dataUri: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  if (loading) return <div className="absolute inset-0 animate-pulse bg-muted" />;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm font-medium">No Digital You yet</p>
      <p className="text-xs text-muted-foreground">Create your Digital You, or use a clear full-body photo of yourself standing straight.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/app/you/scan" className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-background">Create Digital You</Link>
        <button onClick={() => ref.current?.click()} className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.16em]">Use a photo</button>
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) onPick(await fileToDataUri(f)); }} />
    </div>
  );
}

function AddGarment({ defaultCategory }: { defaultCategory: GarmentCategory }) {
  const [mode, setMode] = useState<null | "url">(null);
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<GarmentCategory>(defaultCategory);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => setCategory(defaultCategory), [defaultCategory]);

  async function onFile(f: File) {
    try {
      await addGarment({ category, image: await fileToDataUri(f), title: f.name.replace(/\.[^.]+$/, "").slice(0, 40) || "My item", source: "upload" });
      toast.success("Added to wardrobe");
    } catch { toast.error("Couldn't read that image."); }
  }
  async function onUrl() {
    const u = url.trim();
    if (!/^https:\/\/\S+$/i.test(u)) return toast.error("Paste a full image link starting with https://");
    const ok = await new Promise<boolean>((r) => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u; });
    if (!ok) return toast.error("That link didn't open as an image. Right-click the product photo and copy the image address.");
    await addGarment({ category, image: u, title: new URL(u).hostname.replace(/^www\./, ""), source: "url" });
    setUrl(""); setMode(null); toast.success("Added to wardrobe");
  }

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value as GarmentCategory)} aria-label="Category" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-[0.12em]">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs"><Upload className="h-3.5 w-3.5" />Upload photo</button>
        <button onClick={() => setMode(mode === "url" ? null : "url")} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs"><Link2 className="h-3.5 w-3.5" />Paste image link</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ""; }} />
      </div>
      {mode === "url" && (
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://shop.com/product-image.jpg" className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm" />
          <button onClick={onUrl} className="rounded-full bg-foreground px-4 text-xs font-semibold uppercase tracking-[0.14em] text-background">Add</button>
        </div>
      )}
    </div>
  );
}
