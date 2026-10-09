/**
 * /digital-twin-test: prototype of photo → realistic full-body 3D twin, using MetaPerson Creator in an
 * iframe driven through its JavaScript API. Temporary prototype route (see App.tsx / vite.config.ts and
 * docs/DIGITAL_TWIN.md). Proves the pipeline only: no head-turn capture, try-on, physique or body regions.
 */
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CHAMPAGNE, FlowShell, PortraitFrame, PoseGuide, ScanSweep, StageChecklist } from "@/app/digital/ui";
import { PhotoRejected, preparePhoto, type CheckStage } from "@/app/digital/photoCheck";
import { PHOTO_TIPS } from "@/app/digital/avatarClient";
import { creatorUrl, exportParameters, originOf, parseCreatorMessage, pickVariant, toImageField, uiParameters, type BodyType, type ToCreator } from "@/app/twin/metaperson";
import { initialTwin, stepIndexOf, TWIN_ERRORS, TWIN_STEPS, twinReducer } from "@/app/twin/twinMachine";
import { forgetTwin, loadTwin, saveTwin, type SavedTwin } from "@/app/twin/twinStore";
import { clearManual, CredentialsError, getCredentials, readManual, saveManual, savePasscode, type Credentials } from "@/app/twin/credentials";

// Time limits, from a live check on 5 Oct 2026: the creator took ~36 s to load from a cold cache and
// ~17 s to answer `authenticate`. Test builds (VITE_TWIN_FAST_TIMEOUTS=1) shrink them so failure paths
// can be exercised.
const FAST = import.meta.env.VITE_TWIN_FAST_TIMEOUTS === "1";
const T = {
  load: FAST ? 3000 : 90_000,
  auth: FAST ? 2000 : 45_000,
  // after authenticating, wait for "avatar_generation available" (as MetaPerson's sample does), or this long
  readyGrace: FAST ? 300 : 5000,
  ready: FAST ? 3000 : 60_000,
  generate: FAST ? 5000 : 4 * 60_000,
  confirmFailure: FAST ? 600 : 4000,
  finalize: FAST ? 500 : 1800,
  open: FAST ? 500 : 2500,
  peek: FAST ? 2500 : 40_000,
};

const STAGE_STEPS_OPENING = [{ key: "connecting", label: "Preparing" }, { key: "opening", label: "Opening your twin" }] as const;

/** Preselect the body type from the GlowMax profile, if there is one on this device. */
function profileBodyType(): BodyType | null {
  try {
    const p = JSON.parse(localStorage.getItem("glowmax_app_v1") ?? "null")?.profile?.presentation;
    return p === "masculine" ? "male" : p === "feminine" ? "female" : null;
  } catch {
    return null;
  }
}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });

type Photo = { dataUrl: string; previewUrl: string; warnings: string[] };

const DigitalTwinTest = () => {
  usePageMeta("Digital twin (test)");
  // an unlinked prototype: keep it out of search results
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const [s, dispatch] = useReducer(twinReducer, initialTwin);
  const [saved, setSaved] = useState<SavedTwin | null>(() => loadTwin());
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [checking, setChecking] = useState<CheckStage | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [gender, setGender] = useState<BodyType | null>(() => profileBodyType());
  const [consent, setConsent] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [credsTry, setCredsTry] = useState(0);
  const [frameKey, setFrameKey] = useState(0);
  const [readyWaitOver, setReadyWaitOver] = useState(false);
  const [peek, setPeek] = useState(false);
  const [canPeek, setCanPeek] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const variant = useMemo(() => pickVariant(typeof window === "undefined" ? 1024 : window.innerWidth), []);
  const url = creatorUrl(variant);
  const origin = originOf(url);

  const post = (msg: ToCreator) => frameRef.current?.contentWindow?.postMessage(msg, origin);

  // Reopen the saved twin instead of generating a new one.
  useEffect(() => {
    if (saved) dispatch({ type: "SHOW", code: saved.avatarCode, state: saved.avatarState });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Messages from the creator: exact origin and our frame's window only.
  useEffect(() => {
    const onMessage = (evt: MessageEvent) => {
      const m = parseCreatorMessage(evt, origin, frameRef.current?.contentWindow);
      if (!m) return;
      switch (m.eventName) {
        case "metaperson_creator_loaded":
          return dispatch({ type: "LOADED" });
        case "authentication_status":
          return dispatch({ type: "AUTH_RESULT", ok: m.isAuthenticated, detail: m.errorMessage });
        case "action_availability_changed":
          return dispatch({ type: "AVAILABILITY", action: m.actionName, available: m.isAvailable });
        case "model_generated":
          return dispatch({ type: "MODEL_GENERATED", code: m.avatarCode, gender: m.gender });
        case "model_exported": {
          setExporting(false);
          setExportUrl(m.url);
          const cur = loadTwin();
          if (cur && m.avatarState) saveTwin({ ...cur, avatarState: m.avatarState });
          return;
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin]);

  // Credentials: fetched once the frame is needed.
  useEffect(() => {
    if (creds) return;
    let alive = true;
    // credsTry: "Try again" asks again even if the previous attempt already failed
    getCredentials()
      .then((c) => alive && setCreds(c))
      .catch((e) => alive && dispatch({ type: "CREDENTIALS_ERROR", code: e instanceof CredentialsError ? e.code : "credentials_failed", detail: e instanceof Error ? e.message : undefined }));
    return () => {
      alive = false;
    };
  }, [creds, credsTry]);

  // Authenticate as soon as the creator says it's ready (and again if it ever reloads).
  useEffect(() => {
    if (!s.loaded || !creds || s.auth !== "none" || s.phase === "error") return;
    post({ eventName: "authenticate", clientId: creds.clientId, accessToken: creds.accessToken });
    post(uiParameters(variant));
    dispatch({ type: "AUTH_SENT" });
  }, [s.loaded, s.auth, s.phase, creds]); // eslint-disable-line react-hooks/exhaustive-deps

  // After authenticating, give the creator a moment to report that generation is available.
  useEffect(() => {
    setReadyWaitOver(false);
    if (s.auth !== "ok") return;
    const t = setTimeout(() => setReadyWaitOver(true), T.readyGrace);
    return () => clearTimeout(t);
  }, [s.auth]);

  // Send the pending request once authenticated (and, for generation, once the creator is ready).
  useEffect(() => {
    if (s.auth !== "ok" || !s.intent || s.sent) return;
    if (s.intent.kind === "generate" && !(s.genReady === true || (s.genReady === null && readyWaitOver))) return;
    if (s.intent.kind === "generate") post({ eventName: "generate_avatar", gender: s.intent.gender, age: "adult", image: toImageField(s.intent.image) });
    else post({ eventName: "show_avatar", avatarCode: s.intent.code, ...(s.intent.state ? { avatarState: s.intent.state } : {}) });
    dispatch({ type: "SENT" });
  }, [s.auth, s.intent, s.sent, s.genReady, readyWaitOver]); // eslint-disable-line react-hooks/exhaustive-deps

  // Time limits and settle moments. MetaPerson has no failure or "avatar shown" events.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (s.phase === "connecting" && !s.loaded) timers.push(setTimeout(() => dispatch({ type: "TIMEOUT", what: "load" }), T.load));
    if (s.auth === "pending") timers.push(setTimeout(() => dispatch({ type: "TIMEOUT", what: "auth" }), T.auth));
    if (s.phase === "connecting" && s.auth === "ok" && !s.sent) timers.push(setTimeout(() => dispatch({ type: "TIMEOUT", what: "ready" }), T.ready));
    if (s.phase === "building") {
      timers.push(setTimeout(() => dispatch({ type: "TIMEOUT", what: "generate" }), T.generate));
      timers.push(setTimeout(() => setCanPeek(true), T.peek));
    }
    if (s.suspectFailure) timers.push(setTimeout(() => dispatch({ type: "CONFIRM_FAILURE" }), T.confirmFailure));
    if (s.phase === "finalizing") timers.push(setTimeout(() => dispatch({ type: "REVEAL" }), T.finalize));
    if (s.phase === "opening") timers.push(setTimeout(() => dispatch({ type: "REVEAL" }), T.open));
    return () => timers.forEach(clearTimeout);
  }, [s.phase, s.loaded, s.auth, s.sent, s.suspectFailure]);

  // Keep the generated twin.
  useEffect(() => {
    if (s.phase === "finalizing" && s.avatarCode) {
      const t: SavedTwin = { avatarCode: s.avatarCode, gender: s.gender ?? gender ?? "male", createdAt: new Date().toISOString() };
      saveTwin(t);
      setSaved(t);
    }
    if (s.phase !== "building") {
      setPeek(false);
      setCanPeek(false);
    }
  }, [s.phase, s.avatarCode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (s.phase === "connecting" || s.phase === "error") window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [s.phase, reduce]);

  // ── actions ──
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    setProblem(null);
    try {
      const p = await preparePhoto("head_front", file, setChecking);
      const dataUrl = await toDataUrl(p.blob);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      setPhoto({ dataUrl, previewUrl: URL.createObjectURL(p.blob), warnings: p.checks.warnings });
    } catch (e) {
      setPhotoError(e instanceof PhotoRejected ? e.message : "Couldn't read that photo. Try another one.");
    } finally {
      setChecking(null);
    }
  };

  const create = () => {
    if (!photo) return setProblem("Add a clear, front-facing photo first.");
    if (!gender) return setProblem("Choose a body type.");
    if (!consent) return setProblem("Tick the box to continue.");
    setProblem(null);
    setExportUrl(null);
    if (!creds) setCredsTry((n) => n + 1); // e.g. secrets were added since the page opened
    dispatch({ type: "GENERATE", image: photo.dataUrl, gender });
  };

  const retry = () => {
    const code = s.error?.code;
    if (code === "creator_unavailable" || code === "auth_rejected" || code === "credentials_failed") {
      // fresh frame and fresh token
      setCreds(null);
      setFrameKey((k) => k + 1);
      dispatch({ type: "FRAME_RESET" });
    }
    if (code?.startsWith("credentials") || code?.startsWith("passcode")) setCredsTry((n) => n + 1);
    if (saved && !photo) dispatch({ type: "SHOW", code: saved.avatarCode, state: saved.avatarState });
    else if (photo && gender) dispatch({ type: "GENERATE", image: photo.dataUrl, gender });
    else dispatch({ type: "RESET" });
  };

  const startOver = () => {
    forgetTwin();
    setSaved(null);
    setExportUrl(null);
    dispatch({ type: "RESET" });
  };

  const exportGlb = () => {
    setExporting(true);
    setExportUrl(null);
    post(exportParameters);
    post({ eventName: "export_avatar" });
  };

  // ── view ──
  const busy = s.phase === "connecting" || s.phase === "building" || s.phase === "finalizing" || s.phase === "opening";
  const opening = s.intent?.kind === "show" || s.phase === "opening" || (s.phase === "connecting" && !photo && !!saved);
  const viewing = s.phase === "viewing";
  // The creator is a large WebGL app (tens of seconds on a cold load), so it loads as soon as the page
  // opens, while the user picks a photo. Nothing personal is sent until they ask for a twin.
  const showFrame = true;
  const steps = opening ? STAGE_STEPS_OPENING : TWIN_STEPS;
  const stepIdx = opening ? (s.phase === "opening" ? 1 : 0) : stepIndexOf(s.phase);
  const err = s.phase === "error" && s.error ? TWIN_ERRORS[s.error.code] : null;
  // On phones the stage leads whenever it has something to show (progress, an error, the twin).
  const stageFirst = viewing || busy || !!err;

  return (
    <FlowShell title="Digital twin · test" onClose={() => nav("/app/you")} wide progress={viewing ? 1 : busy ? (Math.max(stepIdx, 0) + 1) / (steps.length + 1) : 0}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        {/* ── controls ── */}
        <section aria-labelledby="twin-h" className={cn("lg:sticky lg:top-24", stageFirst && "order-2 lg:order-none")}>
          <p className="font-wide text-[12px] uppercase tracking-[0.14em]" style={{ color: CHAMPAGNE }}>Prototype</p>
          {__TWIN_SIMULATOR__ && (
            <p role="note" className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-sm leading-6 text-amber-100">
              Preview simulator. MetaPerson isn't connected here, so the twin is a placeholder figure, not built from your photo. Nothing leaves this browser.
            </p>
          )}
          <h1 id="twin-h" className="mt-2 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{viewing || (saved && !busy) || opening ? "Your digital twin" : "Create your digital twin"}</h1>

          {busy && !opening ? (
            <div className="mt-4 flex items-center gap-4">
              {photo && <img src={photo.previewUrl} alt="Your photo" className="h-24 w-[72px] shrink-0 rounded-xl border border-white/10 object-cover" />}
              <p className="text-[17px] leading-7 text-muted-foreground">Building a full-body twin from this photo. You can keep this tab open while it works.</p>
            </div>
          ) : viewing || (saved && s.phase !== "setup" && s.phase !== "error") ? (
            <div className="mt-4 space-y-5">
              <p className="text-[17px] leading-7 text-muted-foreground">Drag to turn it around. Pinch or scroll to zoom.</p>
              {saved && <p className="text-sm text-muted-foreground">Made {new Date(saved.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}. Reopens from its saved ID, without generating again.</p>}
              {viewing && (
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button type="button" onClick={startOver} className="btn-secondary">Create a new twin</button>
                  <button type="button" onClick={exportGlb} disabled={exporting} className="btn-secondary disabled:opacity-60">{exporting ? "Exporting…" : "Export 3D file (GLB)"}</button>
                </div>
              )}
              {exportUrl && (
                <p className="text-sm text-foreground">
                  Exported. <a href={exportUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Download GLB</a>
                  <span className="text-muted-foreground"> (link from MetaPerson; it may expire)</span>
                </p>
              )}
              {saved && (
                <details className="text-sm text-muted-foreground">
                  <summary className="hit cursor-pointer">Developer details</summary>
                  <dl className="mt-2 space-y-1">
                    <div><dt className="inline">Avatar code: </dt><dd className="inline break-all font-mono text-xs text-foreground" data-testid="twin-code">{saved.avatarCode}</dd></div>
                    <div><dt className="inline">Creator: </dt><dd className="inline">{variant}</dd></div>
                    <div><dt className="inline">Token from: </dt><dd className="inline">{creds?.source ?? "…"}</dd></div>
                  </dl>
                </details>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-[17px] leading-7 text-muted-foreground">One clear, front-facing photo builds a realistic full-body 3D avatar that looks like you.</p>

              {/* photo */}
              <div className="mt-6 flex items-center gap-4">
                <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]">
                  {photo ? <img src={photo.previewUrl} alt="Your photo" className="absolute inset-0 h-full w-full object-cover" /> : <PoseGuide area="head" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <label className="btn-primary btn-sm relative cursor-pointer justify-center focus-within:ring-2 focus-within:ring-white/50">
                    <Camera className="h-4 w-4" aria-hidden="true" /> Take photo
                    <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                  <label className="btn-secondary btn-sm relative cursor-pointer justify-center focus-within:ring-2 focus-within:ring-white/50">
                    <ImagePlus className="h-4 w-4" aria-hidden="true" /> Upload photo
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="sr-only" data-testid="twin-upload" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                </div>
              </div>
              <div aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm">
                {checking ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />{checking === "person" ? "Checking for one clear face…" : "Checking photo…"}</span>
                ) : photoError ? (
                  <span role="alert" className="text-amber-100">{photoError}</span>
                ) : photo ? (
                  <span className="text-foreground">Photo ready.{photo.warnings.length ? <span className="block text-muted-foreground">{photo.warnings[0]}</span> : null}</span>
                ) : (
                  <span className="text-muted-foreground">Face the camera in even light, no sunglasses, nothing covering your face.</span>
                )}
              </div>

              {/* body type: MetaPerson builds on a male or female body template */}
              <fieldset className="mt-6">
                <legend className="text-[15px] text-foreground">Body type for the model</legend>
                <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2">
                  {(["male", "female"] as const).map((g) => (
                    <button key={g} type="button" role="radio" aria-checked={gender === g} onClick={() => { setGender(g); setProblem(null); }} className={cn("hit min-h-[44px] rounded-xl border px-4 text-[15px]", gender === g ? "border-[#cdbb93]/70 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground")}>
                      {g === "male" ? "Masculine" : "Feminine"}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label htmlFor="twin-consent" className="mt-6 flex cursor-pointer gap-3 rounded-2xl border border-white/10 p-4 text-[15px] leading-6 text-foreground focus-within:ring-2 focus-within:ring-white/40">
                <input id="twin-consent" type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setProblem(null); }} className="mt-1 h-5 w-5 shrink-0 accent-[#cdbb93]" />
                <span>
                  {__TWIN_SIMULATOR__
                    ? "I understand this preview simulates the flow: no photo is sent and the figure isn't my likeness."
                    : "I agree to send this photo to MetaPerson by Avatar SDK to build my 3D twin. They keep the avatar in their cloud; GlowMax keeps only its ID on this device."}
                </span>
              </label>

              <button type="button" onClick={create} disabled={!!checking || busy} className="btn-primary mt-6 w-full disabled:opacity-60">Create digital twin</button>
              {problem && <p role="alert" className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-sm text-amber-100">{problem}</p>}
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Usually about a minute. The photo is checked on your device first and its location data is removed.</p>
            </div>
          )}
        </section>

        {/* ── the stage: MetaPerson's 3D viewer, covered by GlowMax's own states until the twin is ready ── */}
        <section aria-label="Digital twin viewer" className={cn(stageFirst && "order-1 lg:order-none")}>
          <div className={cn("relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#0b0b0b]", stageFirst ? "h-[72svh] min-h-[480px] lg:h-[min(82svh,880px)]" : "h-[320px] lg:h-[min(82svh,880px)]")}>
            {showFrame && (
              <iframe
                key={frameKey}
                ref={frameRef}
                src={url}
                title="MetaPerson 3D avatar viewer"
                allow="fullscreen"
                data-testid="twin-frame"
                className={cn("absolute inset-0 h-full w-full border-0 transition-opacity duration-500", viewing || peek ? "opacity-100" : "opacity-0")}
                // hidden behind our overlay, but never display:none, so the creator keeps running
                aria-hidden={!(viewing || peek)}
                tabIndex={viewing || peek ? 0 : -1}
              />
            )}

            <AnimatePresence>
              {!viewing && !peek && (
                <motion.div key="overlay" className="absolute inset-0 flex flex-col items-center overflow-y-auto bg-[#0b0b0b] p-6" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduce ? 0.1 : 0.5 } }}>
                  {err ? (
                    <div className="my-auto max-w-md text-center" data-testid="twin-error">
                      <h2 className="font-display text-2xl font-semibold text-foreground">{err.title}</h2>
                      <p className="mt-3 text-[17px] leading-7 text-muted-foreground">{err.body}</p>
                      {err.tips && (
                        <ul className="mx-auto mt-4 inline-block space-y-2 text-left text-[15px] text-foreground">
                          {PHOTO_TIPS.map((t) => (<li key={t} className="flex gap-3"><span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full" style={{ background: CHAMPAGNE }} />{t}</li>))}
                        </ul>
                      )}
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {err.retry && <button type="button" onClick={retry} className="btn-primary">Try again</button>}
                        {(s.error?.code === "generation_failed" || s.error?.code === "generation_timeout") && <button type="button" onClick={() => { setPhoto(null); dispatch({ type: "RESET" }); }} className="btn-secondary">Use another photo</button>}
                      </div>
                      {s.error?.detail && s.error.code !== "passcode_required" && s.error.code !== "passcode_wrong" && <p className="mt-4 text-xs text-muted-foreground">Developer detail: {s.error.detail}</p>}
                      {(s.error?.code === "passcode_required" || s.error?.code === "passcode_wrong") && <PasscodeForm onSaved={() => { setCreds(null); retry(); }} />}
                      {(s.error?.code === "credentials_missing" || s.error?.code === "passcode_not_set") && <CredentialsSetup onSaved={() => { setCreds(null); retry(); }} />}
                    </div>
                  ) : busy ? (
                    <div className="my-auto flex w-full max-w-sm flex-col items-center">
                      <PortraitFrame className="w-full" style={{ maxWidth: "min(260px, calc(38svh * 0.75))" }}>
                        {photo ? <img src={photo.previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale-[35%]" /> : <PoseGuide area="body" />}
                        <ScanSweep />
                      </PortraitFrame>
                      <h2 className="mt-6 text-center font-wide text-sm uppercase tracking-[0.16em] text-foreground">{opening ? "Opening your digital twin" : "Creating your digital twin"}</h2>
                      <div className="mt-4 self-stretch">
                        <StageChecklist steps={steps} active={stepIdx} note={!s.loaded ? "Loading the 3D creator. The first time can take up to a minute." : !opening && s.phase === "building" ? "Reading your facial structure and building a full body. Usually about a minute." : undefined} />
                      </div>
                      {canPeek && (
                        <button type="button" onClick={() => setPeek(true)} className="hit mt-4 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Taking a while? See MetaPerson's screen</button>
                      )}
                    </div>
                  ) : (
                    <div className="my-auto flex flex-col items-center text-center">
                      <div className="relative h-56 w-40 opacity-70"><PoseGuide area="body" /></div>
                      <p className="mt-4 max-w-xs text-[15px] leading-6 text-muted-foreground">Your digital twin will appear here, full body, ready to turn around.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {peek && !viewing && (
              <button type="button" onClick={() => setPeek(false)} className="absolute right-3 top-3 z-10 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm text-foreground backdrop-blur">Back to progress</button>
            )}
          </div>
          {viewing && <p className="mt-3 text-center text-sm text-muted-foreground lg:hidden">Drag to turn. Pinch to zoom.</p>}
        </section>
      </div>
    </FlowShell>
  );
};

/** The test page is locked with a passcode (TWIN_TEST_PASSCODE) until GlowMax has sign-in. */
const PasscodeForm = ({ onSaved }: { onSaved: () => void }) => {
  const [value, setValue] = useState("");
  return (
    <form
      className="mx-auto mt-6 max-w-sm space-y-3 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        savePasscode(value);
        setValue("");
        onSaved();
      }}
    >
      <label htmlFor="twin-passcode" className="block text-sm text-muted-foreground">Test passcode</label>
      <input id="twin-passcode" type="password" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-[16px] text-foreground" />
      <button type="submit" className="btn-primary w-full">Unlock</button>
      <p className="text-xs text-muted-foreground">Kept in this browser tab only.</p>
    </form>
  );
};

/** Shown only when no token source is set up. Developer-facing: this is a test route. */
const CredentialsSetup = ({ onSaved }: { onSaved: () => void }) => {
  const [clientId, setClientId] = useState(() => readManual()?.clientId ?? "");
  const [token, setToken] = useState("");
  return (
    <div className="mt-8 rounded-2xl border border-white/10 p-5 text-left text-sm leading-6 text-muted-foreground">
      <p className="text-[15px] font-medium text-foreground">Set up for developers</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>Create MetaPerson developer credentials at accounts.avatarsdk.com (Developer, Web API). Embedding the creator needs their Pro plan.</li>
        <li>In Lovable, open Cloud, then Secrets, and add <code className="text-foreground">METAPERSON_CLIENT_ID</code>, <code className="text-foreground">METAPERSON_CLIENT_SECRET</code> and <code className="text-foreground">TWIN_TEST_PASSCODE</code> (at least 12 characters, your choice).</li>
        <li>Press Try again and enter the passcode.</li>
      </ol>
      <p className="mt-3">Quick test without a backend: paste your client ID and an access token. Never paste the client secret.</p>
      <form
        className="mt-3 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!clientId.trim() || !token.trim()) return;
          saveManual(clientId, token);
          onSaved();
        }}
      >
        <input aria-label="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Client ID" className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-foreground" />
        <input aria-label="Access token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Access token" className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-foreground" />
        <div className="flex gap-3">
          <button type="submit" className="btn-secondary btn-sm">Use for this tab</button>
          <button type="button" onClick={() => { clearManual(); setToken(""); }} className="btn-sm text-muted-foreground underline underline-offset-4">Clear</button>
        </div>
      </form>
    </div>
  );
};

export default DigitalTwinTest;
