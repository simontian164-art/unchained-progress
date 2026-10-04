import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tip = { area: string; observation: string; action: string; priority: "high" | "medium" | "low" };
type Result = { summary: string; tips: Tip[] };

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/face-tips`;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function shrink(src: string): Promise<string> {
  const img = new Image(); img.src = src; await img.decode();
  const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = img.width * scale; c.height = img.height * scale;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.88);
}

export default function FaceScan() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const [camState, setCamState] = useState<"starting" | "live" | "denied" | "unavailable">("starting");
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<string>();

  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; };
  const start = useCallback(async () => {
    setCamState("starting");
    if (!navigator.mediaDevices?.getUserMedia) return setCamState("unavailable");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } } });
      stream.current = s;
      if (video.current) { video.current.srcObject = s; await video.current.play().catch(() => {}); }
      setCamState("live");
    } catch (e) {
      setCamState(e instanceof DOMException && e.name === "NotAllowedError" ? "denied" : "unavailable");
    }
  }, []);
  useEffect(() => { void start(); return stop; }, [start]);

  async function analyse(dataUrl: string) {
    setPhoto(dataUrl); setBusy(true); setError(undefined); setResult(undefined); stop();
    try {
      const image = await shrink(dataUrl);
      const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", apikey: KEY }, body: JSON.stringify({ image }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "The scan failed. Try again.");
      setResult(body);
    } catch (e) { setError(e instanceof Error ? e.message : "The scan failed."); }
    finally { setBusy(false); }
  }
  function capture() {
    const v = video.current; if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!; ctx.translate(c.width, 0); ctx.scale(-1, 1); ctx.drawImage(v, 0, 0);
    void analyse(c.toDataURL("image/jpeg", 0.92));
  }
  function upload(f?: File) {
    if (!f) return; const r = new FileReader(); r.onload = () => void analyse(String(r.result)); r.readAsDataURL(f);
  }
  function reset() { setPhoto(undefined); setResult(undefined); setError(undefined); void start(); }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      <header>
        <p className="text-xs font-semibold uppercase text-gold">AI face scan</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Grooming tips for your face</h1>
        <p className="mt-2 text-sm text-muted-foreground">We look only at grooming — hair, brows, facial hair, skincare. Photos aren't saved.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted">
          {photo ? <img src={photo} alt="Your scan photo" className="h-full w-full object-cover" /> : <video ref={video} playsInline muted className={cn("h-full w-full -scale-x-100 object-cover", camState !== "live" && "hidden")} />}
          {!photo && camState !== "live" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              {camState === "starting" ? <><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><p className="text-sm text-muted-foreground">Starting camera…</p></> : <>
                <Camera className="h-7 w-7 text-muted-foreground" />
                <p className="text-sm text-foreground">{camState === "denied" ? "Camera access was blocked." : "No camera available."}</p>
                <p className="text-xs text-muted-foreground">{camState === "denied" ? "Allow camera in your browser's site settings, or upload a photo instead." : "Upload a clear, front-facing photo instead."}</p>
              </>}
            </div>
          )}
          {!photo && camState === "live" && <div aria-hidden className="pointer-events-none absolute left-1/2 top-[12%] h-[62%] w-[58%] -translate-x-1/2 rounded-[50%] border-2 border-dashed border-gold/70" />}
          {busy && <div className="absolute inset-0 flex items-center justify-center bg-background/60"><Loader2 className="h-7 w-7 animate-spin text-gold" /></div>}
        </div>
        <div className="space-y-4">
          <input ref={file} type="file" accept="image/*" className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
          <div className="flex flex-wrap gap-3">
            {!photo && <Button disabled={camState !== "live" || busy} onClick={capture}><Camera />Take photo</Button>}
            <Button variant="outline" disabled={busy} onClick={() => file.current?.click()}><ImagePlus />Upload photo</Button>
            {photo && !busy && <Button variant="ghost" onClick={reset}><RotateCcw />New scan</Button>}
            {camState === "denied" && !photo && <Button variant="ghost" onClick={() => void start()}>Try camera again</Button>}
          </div>
          {busy && <p className="text-sm text-muted-foreground">Reading your grooming details…</p>}
          {error && <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">{error}{photo && <Button size="sm" variant="outline" className="ml-3" onClick={() => void analyse(photo)}>Retry</Button>}</div>}
          {result && <div className="space-y-3">
            <p className="flex gap-2 text-sm text-foreground"><Sparkles className="h-4 w-4 shrink-0 text-gold" />{result.summary}</p>
            {result.tips?.map((t, i) => <div key={i} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between"><p className="font-semibold text-foreground">{t.area}</p><span className={cn("rounded px-2 py-0.5 text-[11px] uppercase", t.priority === "high" ? "bg-gold-muted text-gold" : "bg-muted text-muted-foreground")}>{t.priority}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{t.observation}</p>
              <p className="mt-2 text-sm text-foreground">→ {t.action}</p>
            </div>)}
          </div>}
        </div>
      </div>
    </div>
  );
}
