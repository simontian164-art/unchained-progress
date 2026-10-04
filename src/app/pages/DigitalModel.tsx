import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAvatarClient, useDigitalProfile } from "../digital/useDigitalProfile";
import { AccountGate } from "../digital/AccountGate";
import { CHAMPAGNE, FlowShell, PortraitFrame, PoseGuide, ScanSweep } from "../digital/ui";
import { ACTIVE_STAGES, AvatarRequestError, FAILURE_COPY, isWorking, PHOTO_TIPS, STAGE_STEPS, type AvatarGeneration, type AvatarInfo } from "../digital/avatarClient";

const CHANGE_PHOTO = "/app/you/scan?retake=head_front&return=model";
const POLL_MS = 2000;

type View = "loading" | "signed-out" | "unavailable" | "no-photo" | "intro" | "working" | "result" | "failed";

/**
 * Face → digital model. Shows the user's face photo, asks for consent to send it to the image
 * service, follows the real job stages, then lets them approve, regenerate or change the photo.
 */
const DigitalModel = () => {
  usePageMeta("Create Digital You");
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const { bundle, urls, state: load } = useDigitalProfile();
  const { client, checking } = useAvatarClient();
  const [gen, setGen] = useState<AvatarGeneration | null>(null);
  const [info, setInfo] = useState<AvatarInfo | null>(null);
  const [resolved, setResolved] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [connection, setConnection] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);

  const facePhoto = bundle?.images.head_front;
  const faceUrl = urls.head_front;

  const handle = useCallback((e: unknown) => {
    if (e instanceof AvatarRequestError) {
      if (e.code === "signed_out") return setSignedOut(true);
      if (e.code === "no_face_photo") return setProblem("Add a front face photo first.");
      return setProblem(e.message);
    }
    setProblem("Something went wrong. Try again.");
  }, []);

  // Resume whatever is in progress (or waiting for review) when the screen opens, and ask the server
  // who would process the photo (shown in the consent line).
  useEffect(() => {
    if (!client || load !== "ready") return;
    let alive = true;
    Promise.all([client.status(), client.info().catch(() => null)])
      .then(([g, i]) => {
        if (!alive) return;
        // only resume something that still needs the user; old failures start fresh
        if (g && (isWorking(g) || (g.stage === "ready" && !g.approved))) setGen(g);
        setInfo(i);
        setResolved(true);
      })
      .catch((e) => {
        if (!alive) return;
        setResolved(true);
        if (!(e instanceof AvatarRequestError && e.code === "offline")) handle(e);
      });
    return () => {
      alive = false;
    };
  }, [client, load, handle]);

  // Follow a running generation. Pauses while the tab is hidden; the server keeps working regardless.
  const working = isWorking(gen);
  const genId = gen?.id;
  useEffect(() => {
    if (!client || !genId || genId === "pending" || !working) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (!alive) return;
      if (document.hidden) {
        t = setTimeout(tick, 1000);
        return;
      }
      try {
        const g = await client.status(genId);
        if (!alive) return;
        setConnection(true);
        if (g) setGen(g);
      } catch (e) {
        if (!alive) return;
        if (e instanceof AvatarRequestError && e.code === "signed_out") return setSignedOut(true);
        setConnection(false);
      }
      t = setTimeout(tick, POLL_MS);
    };
    t = setTimeout(tick, POLL_MS);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [client, genId, working]);

  // When a job we were watching finishes, hold the completed checklist for a moment (the steps did
  // all happen; polling just may not have caught the short last one) while the result image loads.
  const [settling, setSettling] = useState(false);
  const prevStage = useRef<string | undefined>();
  useEffect(() => {
    const prev = prevStage.current;
    prevStage.current = gen?.stage;
    if (gen?.stage === "ready" && prev && ACTIVE_STAGES.includes(prev as AvatarGeneration["stage"])) {
      if (gen.resultUrl) new Image().src = gen.resultUrl;
      setSettling(true);
      const t = setTimeout(() => setSettling(false), 900);
      return () => clearTimeout(t);
    }
  }, [gen?.stage, gen?.resultUrl]);

  const view: View =
    load === "signed-out" || signedOut
      ? "signed-out"
      : load === "loading" || checking || (client && !resolved)
        ? "loading"
        : !client || info?.available === false
          ? "unavailable"
          : !facePhoto
            ? "no-photo"
            : gen && (isWorking(gen) || settling)
              ? "working"
              : gen?.stage === "ready" && !gen.approved
                ? "result"
                : gen?.stage === "failed"
                  ? "failed"
                  : "intro";

  useEffect(() => {
    window.scrollTo({ top: 0 });
    headRef.current?.focus({ preventScroll: true });
  }, [view]);

  const generate = async () => {
    if (!client) return;
    if (!consent) return setProblem("Tick the box to continue.");
    setProblem(null);
    setBusy(true);
    // "Preparing profile" is shown while our server checks the profile and sends the photo
    setGen({ id: "pending", stage: "preparing", approved: false, createdAt: new Date().toISOString() });
    try {
      setGen(await client.start({ consent: true }));
    } catch (e) {
      setGen(null);
      handle(e);
    } finally {
      setBusy(false);
    }
  };

  const approveModel = async () => {
    if (!client || !gen) return;
    setBusy(true);
    setProblem(null);
    try {
      await client.approve(gen.id);
      nav("/app/you", { replace: true, state: { modelSaved: true } });
    } catch (e) {
      handle(e);
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (client && gen && gen.id !== "pending") await client.discard(gen.id).catch(() => undefined);
    setGen(null);
  };

  const close = () => nav("/app/you");
  const demo = client?.kind === "demo";

  // ── the frame: source photo while preparing/working, the result when ready ──
  const frame = (
    <PortraitFrame
      className="mx-auto w-full md:mx-0"
      style={{ maxWidth: view === "result" ? "min(460px, calc(62svh * 0.75))" : "min(340px, calc(46svh * 0.75))" }}
      footer={view === "result" && gen?.generatedAt ? <p className="flex items-center gap-2 text-sm text-[#ede6d6]"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: CHAMPAGNE }} />{demo ? "Demo result" : "Digital model"}</p> : undefined}
    >
      {view === "result" && gen?.resultUrl ? (
        <motion.img key={gen.id} src={gen.resultUrl} alt="Your generated digital model" className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0, scale: reduce ? 1 : 1.015 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
      ) : faceUrl ? (
        <img src={faceUrl} alt="Your face photo, used to build the model" className={cn("absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-500", view === "working" ? "opacity-60 grayscale-[35%]" : view === "failed" ? "opacity-40" : "")} />
      ) : (
        <PoseGuide area="head" />
      )}
      {view === "working" && <ScanSweep />}
    </PortraitFrame>
  );

  if (view === "signed-out") return <FlowShell onClose={close}><AccountGate /></FlowShell>;
  if (view === "loading") return <FlowShell onClose={close}><p className="py-20 text-center text-muted-foreground" role="status">Loading…</p></FlowShell>;

  const stepIndex = settling ? STAGE_STEPS.length : gen ? STAGE_STEPS.findIndex((s) => s.stage === gen.stage) : -1;

  return (
    <FlowShell onClose={close} progress={view === "working" ? (stepIndex + 1) / (STAGE_STEPS.length + 1) : view === "result" ? 1 : 0}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,400px)_minmax(0,1fr)] md:items-start md:gap-12">
        {view !== "unavailable" && view !== "no-photo" && <div className="md:sticky md:top-24">{frame}</div>}

        <AnimatePresence mode="wait" initial={false}>
          <motion.section key={view} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="max-w-xl">
            {view === "unavailable" && (
              <>
                <h1 ref={headRef} tabIndex={-1} className="font-display text-3xl font-semibold text-foreground outline-none sm:text-4xl">{client ? "Model generation isn't available yet" : "Digital models need a GlowMax account"}</h1>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">{client ? "It hasn't been switched on for your account yet. Your photos and profile are unaffected." : "Your model is generated on GlowMax's server, so it needs an account. Your scans stay on this device for now. Accounts are coming soon."}</p>
                <button type="button" onClick={close} className="btn-secondary mt-8">Back to You</button>
              </>
            )}

            {view === "no-photo" && (
              <>
                <h1 ref={headRef} tabIndex={-1} className="font-display text-3xl font-semibold text-foreground outline-none sm:text-4xl">Add a face photo first</h1>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Your digital model is built from a clear, front-facing photo of your face and shoulders.</p>
                <Link to={CHANGE_PHOTO} className="btn-primary mt-8 inline-flex">Take face photo</Link>
              </>
            )}

            {view === "intro" && (
              <>
                <h1 ref={headRef} tabIndex={-1} className="font-display text-3xl font-semibold text-foreground outline-none sm:text-4xl">Create Digital You</h1>
                <p className="mt-3 text-lg leading-8 text-muted-foreground">Generate a visual model for style previews and future looks.</p>
                <ul className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08] text-[15px] leading-6">
                  <li className="py-3 text-foreground">Built from the face photo shown. That photo isn't changed.</li>
                  <li className="py-3 text-foreground">An upper-body model that keeps your face recognisable. Body shape is estimated, not measured.</li>
                  <li className="py-3 text-foreground">Usually ready in under a minute.</li>
                </ul>
                <label htmlFor="dm-consent" className="mt-6 flex cursor-pointer gap-3 rounded-2xl border border-white/10 p-4 text-[15px] leading-6 text-foreground focus-within:ring-2 focus-within:ring-white/40">
                  <input id="dm-consent" type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setProblem(null); }} className="mt-1 h-5 w-5 shrink-0 accent-[#cdbb93]" />
                  {demo ? (
                    <span>I understand this preview is a demo: no AI is used and nothing leaves this device.</span>
                  ) : (
                    <span>
                      I agree to send this photo to {info?.processor ? `${info.processor.name}, GlowMax's image partner,` : "GlowMax's image partner"} to create my model. {info?.processor?.summary ?? ""}
                    </span>
                  )}
                </label>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {demo ? "In the full app, only this photo is sent: not your name, email or measurements." : "Only this photo is sent. Not your name, email or measurements."} <a href="/privacy#digital-model" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">How it's handled<span className="sr-only"> (opens in a new tab)</span></a>
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => void generate()} disabled={busy} className="btn-primary disabled:opacity-60">Generate model</button>
                  <Link to={CHANGE_PHOTO} className="hit inline-flex min-h-[44px] items-center px-2 text-[15px] text-muted-foreground underline underline-offset-4 hover:text-foreground">Change source photo</Link>
                </div>
              </>
            )}

            {view === "working" && gen && (
              <>
                <h1 ref={headRef} tabIndex={-1} className="font-display text-3xl font-semibold text-foreground outline-none sm:text-4xl">{settling ? "Model ready" : "Building your digital model"}</h1>
                <p className="mt-3 text-[17px] leading-7 text-muted-foreground">Usually under a minute. You can leave this screen; it keeps going.</p>
                <ol className="mt-8 space-y-1" aria-label="Progress">
                  {STAGE_STEPS.map((s, idx) => {
                    const state = idx < stepIndex ? "done" : idx === stepIndex ? "active" : "todo";
                    return (
                      <li key={s.stage} className="flex min-h-[44px] items-center gap-4" aria-current={state === "active" ? "step" : undefined}>
                        <span aria-hidden="true" className="relative flex h-5 w-5 items-center justify-center">
                          {state === "done" ? (
                            <Check className="h-4 w-4" style={{ color: CHAMPAGNE }} />
                          ) : state === "active" ? (
                            <>
                              {!reduce && <motion.span className="absolute h-5 w-5 rounded-full" style={{ background: `${CHAMPAGNE}33` }} animate={{ scale: [0.6, 1.25, 0.6], opacity: [0.8, 0, 0.8] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />}
                              <span className="h-2 w-2 rounded-full" style={{ background: CHAMPAGNE }} />
                            </>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                          )}
                        </span>
                        <span className={cn("font-wide text-[13px] uppercase tracking-[0.12em]", state === "todo" ? "text-white/35" : "text-foreground")}>{s.label}</span>
                        {state === "done" && <span className="sr-only">, done</span>}
                      </li>
                    );
                  })}
                </ol>
                <p className="sr-only" role="status" aria-live="polite">{settling ? "Model ready" : STAGE_STEPS[stepIndex]?.label}</p>
                {!connection && <p className="mt-4 text-sm text-amber-100" role="status">Connection lost. Reconnecting…</p>}
                {gen.id !== "pending" && !settling && <button type="button" onClick={() => void cancel()} className="hit mt-8 min-h-[44px] text-[15px] text-muted-foreground underline underline-offset-4 hover:text-foreground">Cancel</button>}
              </>
            )}

            {view === "result" && gen && (
              <>
                <h1 ref={headRef} tabIndex={-1} className="font-display text-3xl font-semibold text-foreground outline-none sm:text-4xl">Your digital model</h1>
                <p className="mt-3 text-[17px] leading-7 text-muted-foreground">
                  {demo ? "Demo result: this preview shows your own photo. Real models are generated on GlowMax's server." : "Made from your face photo. Body shape is estimated from your face, not measured."}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button type="button" onClick={() => void approveModel()} disabled={busy} className="btn-primary disabled:opacity-60">{busy ? "Saving…" : "Use this model"}</button>
                  <button type="button" onClick={() => { setConsent(true); void generate(); }} disabled={busy} className="btn-secondary disabled:opacity-60">Regenerate</button>
                  <Link to={CHANGE_PHOTO} className="hit inline-flex min-h-[44px] items-center justify-center px-2 text-[15px] text-muted-foreground underline underline-offset-4 hover:text-foreground">Change source photo</Link>
                </div>
                <p className="mt-6 text-sm leading-6 text-muted-foreground">Your original photo is kept as it was. The model is stored separately and you can delete it at any time.</p>
              </>
            )}

            {view === "failed" && gen && (
              <FailureView gen={gen} headRef={headRef} onRetry={() => { setConsent(true); void generate(); }} busy={busy} />
            )}

            {problem && <p role="alert" className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-sm text-amber-100">{problem}</p>}
          </motion.section>
        </AnimatePresence>
      </div>
    </FlowShell>
  );
};

const FailureView = ({ gen, headRef, onRetry, busy }: { gen: AvatarGeneration; headRef: React.RefObject<HTMLHeadingElement>; onRetry: () => void; busy: boolean }) => {
  const copy = FAILURE_COPY[gen.failure ?? "unknown"];
  return (
    <>
      <h1 ref={headRef} tabIndex={-1} className="font-display text-2xl font-semibold leading-tight text-foreground outline-none sm:text-3xl">{copy.title}</h1>
      <p className="mt-3 text-[17px] leading-7 text-muted-foreground">{copy.body}</p>
      {copy.tips && (
        <ul className="mt-4 space-y-2 text-[15px] text-foreground">
          {PHOTO_TIPS.map((t) => (
            <li key={t} className="flex gap-3"><span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full" style={{ background: CHAMPAGNE }} />{t}</li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {copy.changePhoto && <Link to={CHANGE_PHOTO} className="btn-primary inline-flex">Change source photo</Link>}
        {copy.retry && <button type="button" onClick={onRetry} disabled={busy} className={cn(copy.changePhoto ? "btn-secondary" : "btn-primary", "disabled:opacity-60")}>Try again</button>}
        {!copy.retry && !copy.changePhoto && <Link to="/app/you" className="btn-secondary inline-flex">Back to You</Link>}
      </div>
    </>
  );
};

export default DigitalModel;
