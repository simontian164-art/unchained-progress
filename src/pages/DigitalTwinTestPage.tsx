import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanSweep } from "@/app/digital/ui";
import { usePageMeta } from "@/hooks/usePageMeta";

/**
 * Dev prototype: real selfie → MetaPerson full-body avatar, shown inside GlowMax.
 * Credentials stay server-side; the iframe only receives a short-lived access token.
 */
const ORIGIN = "https://metaperson.avatarsdk.com";
const IFRAME_URL = `${ORIGIN}/iframe.html`;
const TOKEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/metaperson-token`;
const STORE = "glowmax_metaperson_v1";
const STAGES = ["CREATING YOUR DIGITAL TWIN", "FACIAL STRUCTURE", "BUILDING MODEL", "FINALIZING"];

type Phase = "booting" | "ready" | "generating" | "avatar" | "error";
type Saved = { avatarCode: string; url?: string; savedAt: string };

const loadSaved = (): Saved | null => { try { return JSON.parse(localStorage.getItem(STORE) || "null"); } catch { return null; } };

async function toBase64(src: Blob): Promise<string> {
  const url = URL.createObjectURL(src);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.92).split(",")[1];
  } finally { URL.revokeObjectURL(url); }
}

export default function DigitalTwinTestPage() {
  usePageMeta("Digital Twin test");
  const frame = useRef<HTMLIFrameElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const pending = useRef<string | null>(null);
  const canGenerate = useRef(false);
  const [phase, setPhase] = useState<Phase>("booting");
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState<Saved | null>(loadSaved);
  const [camera, setCamera] = useState<MediaStream | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");

  const post = (msg: Record<string, unknown>) => frame.current?.contentWindow?.postMessage(msg, ORIGIN);
  const fail = (msg: string) => { setError(msg); setPhase("error"); };

  const sendGenerate = useCallback((b64: string) => {
    post({ eventName: "generate_avatar", gender, age: "adult", image: b64 });
    pending.current = null;
  }, [gender]);

  useEffect(() => {
    const onMessage = async (evt: MessageEvent) => {
      if (evt.origin !== ORIGIN || evt.data?.source !== "metaperson_creator") return;
      const d = evt.data;
      switch (d.eventName) {
        case "metaperson_creator_loaded": {
          try {
            const res = await fetch(TOKEN_URL, { method: "POST", headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) return fail(body.error === "not_configured" ? "MetaPerson credentials aren't set up yet." : body.message ?? "Couldn't sign in to MetaPerson.");
            post({ eventName: "authenticate", accessToken: body.accessToken });
            post({ eventName: "set_export_parameters", format: "glb", lod: 1, textureProfile: "1K.jpg", useZip: false });
            post({ eventName: "set_ui_parameters", isExportButtonVisible: false, isTakeSelfieButtonVisible: false, isBrowsePhotoButtonVisible: false, showSampleAvatars: false, showLatestCreatedAvatar: false, isLanguageSelectionVisible: false, metaPersonLabelText: "GlowMax Digital Twin" });
            const s = loadSaved();
            if (s) { post({ eventName: "show_avatar", avatarCode: s.avatarCode }); setPhase("avatar"); } else setPhase("ready");
          } catch { fail("Couldn't reach the avatar service. Check your connection."); }
          break;
        }
        case "authentication_status":
          if (d.isAuthorized === false) fail(d.errorMessage ?? "MetaPerson rejected the credentials.");
          break;
        case "action_availability_changed":
          if (d.actionName === "generate_avatar") {
            canGenerate.current = !!d.isAvailable;
            if (d.isAvailable && pending.current) sendGenerate(pending.current);
          }
          break;
        case "model_generated":
          setStage(3);
          // Export so we get a stable avatar code to reopen later.
          setTimeout(() => post({ eventName: "export_avatar" }), 1500);
          break;
        case "model_exported": {
          const next: Saved = { avatarCode: d.avatarCode, url: d.url, savedAt: new Date().toISOString() };
          if (d.avatarCode) { localStorage.setItem(STORE, JSON.stringify(next)); setSaved(next); }
          setPhase("avatar");
          break;
        }
        case "avatar_generation_failed":
        case "generation_failed":
        case "error":
          fail(d.message ?? d.errorMessage ?? "We couldn't build an avatar from that photo. Use a clear, front-facing selfie in good light.");
          break;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendGenerate]);

  // Advance loading copy while the creator works.
  useEffect(() => {
    if (phase !== "generating") return;
    setStage(0);
    const t = [setTimeout(() => setStage(1), 4000), setTimeout(() => setStage(2), 12000)];
    return () => t.forEach(clearTimeout);
  }, [phase]);

  const start = async (blob: Blob) => {
    stopCamera();
    setError(undefined);
    if (blob.size > 15_000_000) return fail("That photo is too large. Use one under 15 MB.");
    let b64: string;
    try { b64 = await toBase64(blob); } catch { return fail("We couldn't read that file. Use a JPG or PNG selfie."); }
    setPhase("generating");
    if (canGenerate.current) sendGenerate(b64); else pending.current = b64;
  };

  const openCamera = async () => {
    try { const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }); setCamera(s); setTimeout(() => { if (video.current) { video.current.srcObject = s; void video.current.play(); } }); }
    catch { setError("Camera unavailable or blocked — upload a selfie instead."); }
  };
  const stopCamera = () => { camera?.getTracks().forEach((t) => t.stop()); setCamera(null); };
  const snap = () => {
    const v = video.current; if (!v?.videoWidth) return;
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!; ctx.translate(c.width, 0); ctx.scale(-1, 1); ctx.drawImage(v, 0, 0);
    c.toBlob((b) => b && void start(b), "image/jpeg", 0.92);
  };
  const reset = () => { localStorage.removeItem(STORE); setSaved(null); setError(undefined); setPhase("ready"); frame.current?.contentWindow?.location.replace?.(IFRAME_URL); };

  const busy = phase === "generating" || phase === "booting";

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase text-gold">Prototype</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-5xl">CREATE YOUR DIGITAL TWIN</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">One clear, front-facing selfie. Drag the avatar to rotate it.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void start(f); }} />
          <div role="radiogroup" aria-label="Body type" className="flex rounded-md border border-border">
            {(["male", "female"] as const).map((g) => <button key={g} type="button" role="radio" aria-checked={gender === g} onClick={() => setGender(g)} className={`min-h-10 px-3 text-sm capitalize ${gender === g ? "bg-gold-muted text-foreground" : "text-muted-foreground"}`}>{g}</button>)}
          </div>
          <Button disabled={busy} onClick={() => fileInput.current?.click()}><ImagePlus />Upload photo</Button>
          <Button variant="outline" disabled={busy} onClick={() => (camera ? snap() : void openCamera())}><Camera />{camera ? "Capture" : "Take photo"}</Button>
          {saved && !busy && <Button variant="ghost" onClick={reset}><RotateCcw />Start over</Button>}
        </div>
        {error && <p role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>}

        <div className="relative mt-6 h-[72svh] min-h-[520px] overflow-hidden rounded-md border border-border bg-card">
          <iframe ref={frame} src={IFRAME_URL} title="Digital twin viewer" allow="fullscreen" className="h-full w-full border-0" />
          {camera && <video ref={video} playsInline muted className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />}
          {(phase === "booting" || phase === "generating") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90">
              <div className="relative h-64 w-44 overflow-hidden rounded-md border border-border"><ScanSweep /></div>
              <p className="mt-6 font-wide text-sm uppercase tracking-[0.14em] text-gold" role="status" aria-live="polite">{phase === "booting" ? "LOADING" : STAGES[stage]}</p>
            </div>
          )}
          {phase === "ready" && !camera && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80"><p className="text-sm text-muted-foreground">Upload or take a selfie to begin.</p></div>}
        </div>
        {saved && <p className="mt-3 text-xs text-muted-foreground">Saved avatar {saved.avatarCode.slice(0, 8)}… — reopens automatically on reload.</p>}
      </div>
    </main>
  );
}
