import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, CalendarRange, ChevronRight, Plus, ScanFace, Scissors, Settings, ShoppingBag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import type { Goal } from "../types";
import { dayNumber, levelName, levelOf, phaseOf, PROGRAM_DAYS, totalXp } from "../xp";
import { useAvatarClient, useDigitalProfile } from "../digital/useDigitalProfile";
import { AccountGate } from "../digital/AccountGate";
import { CHAMPAGNE, PortraitFrame, PoseGuide } from "../digital/ui";
import { IMAGE_KINDS, type DigitalProfileBundle, type ImageKind } from "../digital/types";
import { formatHeight, formatWeight } from "../digital/units";

type Row = { to: string; label: string; sub: string; icon: LucideIcon };
const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Your protocol",
    rows: [
      { to: "/app/analysis", label: "Your analysis", sub: "What we found and why", icon: ScanFace },
      { to: "/app/barber", label: "Show my barber", sub: "Your cut, ready to hand over", icon: Scissors },
      { to: "/app/shop", label: "Shop my plan", sub: "Only what your plan uses", icon: ShoppingBag },
      { to: "/app/guides", label: "Guides", sub: "Style, fit, posture", icon: BookOpen },
      { to: "/app/briefing", label: "Weekly briefing", sub: "This week in numbers", icon: CalendarRange },
    ],
  },
  { title: "Account", rows: [{ to: "/app/settings", label: "Settings", sub: "Reminders, sound, privacy, your data", icon: Settings }] },
];

const GOAL_LABEL: Record<Goal, string> = { overall: "Look more put-together", work: "Look sharper for work", dating: "Dating", event: "A specific event", confidence: "Feel more confident" };

/** Modules that will run on Digital You. Each links to what exists today until its preview ships. */
const MODULES: { id: string; label: string; soon: string; now: { to: string; label: string } }[] = [
  { id: "style", label: "Style", soon: "Try real clothes on your Digital You.", now: { to: "/app/you/style", label: "Open Style Lab" } },
  { id: "physique", label: "Physique", soon: "See your training goal on your body baseline.", now: { to: "/app/plan", label: "Body and posture plan" } },
  { id: "hair", label: "Hair", soon: "Preview haircuts on your face before the barber.", now: { to: "/app/barber", label: "Your haircut card" } },
  { id: "face", label: "Face", soon: "Preview facial hair and glasses frames.", now: { to: "/app/analysis", label: "Your analysis" } },
  { id: "skin", label: "Skin", soon: "Track skin changes against your baseline.", now: { to: "/app", label: "Today's routine" } },
  { id: "progress", label: "Progress", soon: "Compare each new scan with this one, side by side.", now: { to: "/app/progress", label: "Progress and check-ins" } },
];

type HeroKind = "model" | "body_front" | "head_front";
const HERO_LABEL: Record<HeroKind, string> = { model: "Model", body_front: "Body", head_front: "Face" };
const HERO_ALT: Record<HeroKind, string> = { model: "Your digital model", body_front: "Your full-body baseline photo", head_front: "Your face baseline photo" };

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");

const You = () => {
  usePageMeta("You");
  const nav = useNavigate();
  const { state: routeState } = useLocation() as { state?: { saved?: boolean; modelSaved?: boolean } };
  const { state, latest } = useApp();
  const { service, bundle, urls, modelUrl, state: load, error, reload } = useDigitalProfile();
  const { client: avatar } = useAvatarClient();
  const [hero, setHero] = useState<HeroKind>("model");
  const [mod, setMod] = useState(MODULES[0].id);
  const [confirm, setConfirm] = useState<ImageKind | "all" | "model" | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const day = Math.min(dayNumber(state.planStartedAt), PROGRAM_DAYS);
  const phase = phaseOf(day);
  const light = !!latest?.light;
  const lvl = levelOf(latest ? totalXp(state, latest) : 0);
  const name = state.profile?.name?.trim();
  const p = bundle?.profile;
  const active = p?.status === "active";
  const units = p?.unitSystem ?? "metric";
  // The approved digital model leads when there is one; the user's own photos are a tap away.
  const heroUrls: Partial<Record<HeroKind, string>> = { model: modelUrl, body_front: urls.body_front, head_front: urls.head_front };
  const heroOptions = (["model", "body_front", "head_front"] as const).filter((k) => heroUrls[k]);
  const heroKind = heroUrls[hero] ? hero : heroOptions[0];
  const where = service?.mode === "account" ? "Stored privately in your account." : "Stored on this device only.";

  const remove = async (what: ImageKind | "all" | "model") => {
    if (!service) return;
    setBusy(true);
    setActionError(null);
    try {
      if (what === "all") await service.deleteProfile();
      else if (what === "model") {
        if (avatar && bundle?.model) await avatar.discard(bundle.model.id);
      } else await service.deleteProfileImage(what);
      setConfirm(null);
      await reload();
    } catch {
      setActionError(what === "all" ? "Couldn't delete everything. Check your connection and try again; anything not yet deleted is still listed here." : what === "model" ? "Couldn't delete your model. Try again." : "Couldn't delete that photo. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const head = (
    <header className="flex items-baseline justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate font-display text-3xl font-semibold text-foreground">{name || "You"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Day {day} of {PROGRAM_DAYS}, {phase.name.toLowerCase()} phase{!light ? `. Level ${lvl.level}, ${levelName(lvl.level)}` : ""}</p>
      </div>
    </header>
  );

  const protocol = GROUPS.map((g) => (
    <section key={g.title} aria-label={g.title}>
      <h2 className="mb-2 px-1 text-sm text-muted-foreground">{g.title}</h2>
      <ul className="surface-card divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
        {g.rows.map((r) => (
          <li key={r.to}>
            <Link to={r.to} className="flex min-h-[52px] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] active:bg-white/[0.05]">
              <r.icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-foreground">{r.label}</span>
                <span className="block truncate text-sm text-muted-foreground">{r.sub}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  ));

  // ── signed out (account mode only) ──
  if (load === "signed-out") return <div className="mx-auto max-w-2xl space-y-8">{head}<AccountGate />{protocol}</div>;

  // ── loading ──
  if (load === "loading" && !bundle) {
    return (
      <div className="mx-auto max-w-5xl space-y-8" aria-busy="true">
        {head}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="aspect-[3/4] w-full animate-pulse rounded-[22px] bg-white/[0.04] motion-reduce:animate-none" />
          <div className="space-y-3"><div className="h-6 w-1/2 animate-pulse rounded bg-white/[0.05]" /><div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" /></div>
        </div>
        <p className="sr-only" role="status">Loading your profile</p>
      </div>
    );
  }

  // ── error ──
  if (load === "error") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        {head}
        <section role="alert" className="rounded-2xl border border-white/10 p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Couldn't load Digital You</h2>
          <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{error ?? "Something went wrong."} Your photos haven't been changed.</p>
          <button type="button" onClick={() => void reload()} className="btn-primary mt-5">Try again</button>
        </section>
        {protocol}
      </div>
    );
  }

  // ── first visit / not finished ──
  if (!p || !active) {
    return (
      <div className="mx-auto max-w-5xl space-y-10">
        {head}
        <section aria-labelledby="dy-h" className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <PortraitFrame className="order-2 mx-auto w-full max-w-[260px] md:order-1 md:mx-0 md:max-w-[380px]">
            {urls.body_front || urls.head_front ? <img src={urls.body_front ?? urls.head_front} alt="Your photo so far" className="absolute inset-0 h-full w-full object-cover opacity-70" /> : <PoseGuide area="body" />}
          </PortraitFrame>
          <div className="order-1 md:order-2">
            <h2 id="dy-h" className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">{p ? "Finish your digital profile" : "Build your digital profile"}</h2>
            <p className="mt-4 max-w-md text-lg leading-8 text-muted-foreground">Create a visual baseline so GlowMax can personalise your style, physique and appearance recommendations.</p>
            <button type="button" onClick={() => nav("/app/you/scan")} className="btn-primary mt-8 w-full sm:w-auto">{p ? "Continue scan" : "Start scan"}</button>
            <p className="mt-4 text-sm text-muted-foreground">About 3 minutes. {where}</p>
          </div>
        </section>
        {protocol}
      </div>
    );
  }

  // ── the profile ──
  const m = MODULES.find((x) => x.id === mod)!;
  const taken = IMAGE_KINDS.filter((k) => bundle?.images[k.kind]);
  const missing = IMAGE_KINDS.filter((k) => !bundle?.images[k.kind]);
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {head}
      {(routeState?.saved || routeState?.modelSaved) && <p role="status" className="text-sm text-foreground">{routeState.modelSaved ? "Digital model saved." : "Digital You saved."}</p>}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:items-start">
        {/* The hero: the user's own photo (or their approved digital model) */}
        <div className="md:sticky md:top-20 md:row-span-2">
          <PortraitFrame
            className="w-full"
            footer={<p className="flex items-center gap-2 text-sm text-[#ede6d6]"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: CHAMPAGNE }} />{heroKind === "model" && bundle?.model ? `Digital model, ${fmtDate(bundle.model.generatedAt)}` : `Last scan ${fmtDate(p.lastScanAt)}`}</p>}
          >
            {heroKind ? (
              <motion.img key={heroKind} src={heroUrls[heroKind]} alt={HERO_ALT[heroKind]} className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} />
            ) : (
              <PoseGuide area="body" />
            )}
          </PortraitFrame>
          {heroOptions.length > 1 && (
            <div role="radiogroup" aria-label="Image shown" className="mt-3 flex gap-2">
              {heroOptions.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={heroKind === k} onClick={() => setHero(k)} className={cn("hit rounded-full border px-4 py-2 text-sm", heroKind === k ? "border-[#cdbb93]/60 text-foreground" : "border-white/10 text-muted-foreground")}>
                  {HERO_LABEL[k]}
                </button>
              ))}
            </div>
          )}
        </div>

        {(bundle?.model || urls.head_front) && (
          // Until there's a model, "Create Digital You" is the next step, so on phones it sits above the
          // photo instead of below the fold. Beside the photo on larger screens.
          <div className={cn("md:col-start-2", !bundle?.model && "order-first md:order-none")}>
            <ModelCard
              bundle={bundle!}
              hasFace={!!urls.head_front}
              canGenerate={!!avatar}
              confirming={confirm === "model"}
              busy={busy}
              onDelete={() => setConfirm("model")}
              onConfirmDelete={() => void remove("model")}
              onCancel={() => setConfirm(null)}
            />
          </div>
        )}

        <div className="space-y-10 md:col-start-2">
          {/* Current profile */}
          <section aria-labelledby="cp-h">
            <div className="flex items-baseline justify-between">
              <h2 id="cp-h" className="font-display text-xl font-semibold text-foreground">Current profile</h2>
              <Link to="/app/you/scan?step=details" className="hit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Edit</Link>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-4 border-y border-white/[0.08] py-5">
              <div><dt className="text-sm text-muted-foreground">Height</dt><dd className="mt-1 font-display text-2xl font-light tabular-nums text-foreground">{formatHeight(bundle?.latest?.heightCm, units)}</dd></div>
              <div><dt className="text-sm text-muted-foreground">Weight</dt><dd className="mt-1 font-display text-2xl font-light tabular-nums text-foreground">{formatWeight(bundle?.latest?.weightKg, units)}</dd></div>
              <div className="min-w-0"><dt className="text-sm text-muted-foreground">Current goal</dt><dd className="mt-1 text-[17px] leading-6 text-foreground">{p.goal ? GOAL_LABEL[p.goal] : "Not set"}</dd></div>
            </dl>
          </section>

          {/* Modules */}
          <section aria-label="Digital You modules">
            <div role="tablist" aria-label="Modules" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
              {MODULES.map((x) => (
                <button key={x.id} id={`tab-${x.id}`} role="tab" aria-selected={mod === x.id} aria-controls="mod-panel" type="button" onClick={() => setMod(x.id)} className={cn("relative min-h-[44px] shrink-0 px-3 text-[15px] transition-colors", mod === x.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {x.label}
                  {mod === x.id && <motion.span layoutId="dy-tab" className="absolute inset-x-3 bottom-1 h-px" style={{ background: CHAMPAGNE }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                </button>
              ))}
            </div>
            <div id="mod-panel" role="tabpanel" aria-labelledby={`tab-${m.id}`} className="mt-4 rounded-2xl border border-white/10 p-5">
              <p className="text-sm text-[#cdbb93]">Coming soon</p>
              <p className="mt-1 text-[17px] leading-7 text-foreground">{m.soon}</p>
              <Link to={m.now.to} className="mt-4 inline-flex min-h-[44px] items-center gap-1 text-[15px] text-foreground underline underline-offset-4">
                For now: {m.now.label}
              </Link>
            </div>
          </section>

          {/* Scans: replace / delete each */}
          <section aria-labelledby="scans-h">
            <h2 id="scans-h" className="font-display text-xl font-semibold text-foreground">Your scans</h2>
            <p className="mt-1 text-sm text-muted-foreground">{where} Replace or delete any photo.</p>
            {taken.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {taken.map((k) => (
                  <li key={k.kind} className="rounded-2xl border border-white/10 p-2">
                    <div className="relative overflow-hidden rounded-xl bg-[#0b0b0b]" style={{ aspectRatio: "3/4" }}>
                      {urls[k.kind] && <img src={urls[k.kind]} alt={k.label} className="absolute inset-0 h-full w-full object-cover" />}
                    </div>
                    <p className="mt-2 px-1 text-sm text-foreground">{k.label}</p>
                    {confirm === k.kind ? (
                      <div className="mt-1 flex gap-1 px-1">
                        <button type="button" disabled={busy} onClick={() => void remove(k.kind)} className="hit min-h-[36px] text-sm text-red-300">Delete</button>
                        <button type="button" onClick={() => setConfirm(null)} className="hit ml-3 min-h-[36px] text-sm text-muted-foreground">Keep</button>
                      </div>
                    ) : (
                      <div className="mt-1 flex gap-1 px-1">
                        <Link to={`/app/you/scan?retake=${k.kind}`} aria-label={`Replace ${k.label.toLowerCase()} photo`} className="hit inline-flex min-h-[36px] items-center text-sm text-muted-foreground hover:text-foreground">Replace</Link>
                        <button type="button" aria-label={`Delete ${k.label.toLowerCase()} photo`} onClick={() => setConfirm(k.kind)} className="hit ml-3 min-h-[36px] text-sm text-muted-foreground hover:text-foreground">Delete</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {missing.length > 0 && (
              <ul aria-label="Photos not added yet" className="mt-3 divide-y divide-white/[0.06] rounded-2xl border border-dashed border-white/10">
                {missing.map((k) => (
                  <li key={k.kind}>
                    <Link to={`/app/you/scan?retake=${k.kind}`} className="flex min-h-[52px] items-center gap-3 px-4 text-[15px] text-foreground hover:bg-white/[0.03]">
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="flex-1">Add {k.label.toLowerCase()}</span>
                      <span className={cn("text-sm", k.required ? "text-[#cdbb93]" : "text-muted-foreground")}>{k.required ? "Needed" : "Optional"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {protocol}

      <section aria-labelledby="del-h" className="border-t border-white/[0.08] pt-8">
        <h2 id="del-h" className="text-[15px] font-medium text-foreground">Delete Digital You</h2>
        <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">Removes every scan photo, your digital model, your measurements and preferences, and any looks generated from them. Your plan and progress stay.</p>
        {confirm === "all" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy} onClick={() => void remove("all")} className="btn-secondary border-red-400/40 text-red-200 disabled:opacity-60">{busy ? "Deleting…" : "Delete everything"}</button>
            <button type="button" onClick={() => setConfirm(null)} className="btn-secondary">Cancel</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm("all")} className="btn-secondary mt-4">Delete Digital You</button>
        )}
        {actionError && <p role="alert" className="mt-3 text-sm text-red-200">{actionError}</p>}
      </section>
    </div>
  );
};

/** Digital model ("primary avatar") status and actions, beside the hero. */
const ModelCard = ({ bundle, hasFace, canGenerate, confirming, busy, onDelete, onConfirmDelete, onCancel }: { bundle: DigitalProfileBundle; hasFace: boolean; canGenerate: boolean; confirming: boolean; busy: boolean; onDelete: () => void; onConfirmDelete: () => void; onCancel: () => void }) => {
  const model = bundle.model;
  const pending = bundle.pendingModel;
  if (!model && !hasFace) return null;
  const shell = "rounded-2xl border border-white/10 p-5";
  if (model) {
    return (
      <section aria-labelledby="dm-h" className={shell}>
        <h2 id="dm-h" className="font-display text-xl font-semibold text-foreground">Your digital model</h2>
        <p className="mt-1 text-[15px] leading-6 text-muted-foreground">Made {fmtDate(model.generatedAt)}. Used for style previews and future looks.</p>
        {confirming ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-foreground">Delete your model?</span>
            <button type="button" disabled={busy} onClick={onConfirmDelete} className="hit min-h-[44px] text-[15px] text-red-300">Delete</button>
            <button type="button" onClick={onCancel} className="hit min-h-[44px] text-[15px] text-muted-foreground">Keep</button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-x-5">
            {canGenerate && <Link to="/app/you/model" className="hit inline-flex min-h-[44px] items-center text-[15px] text-foreground underline underline-offset-4">Regenerate</Link>}
            {canGenerate && <button type="button" onClick={onDelete} className="hit min-h-[44px] text-[15px] text-muted-foreground hover:text-foreground">Delete model</button>}
          </div>
        )}
      </section>
    );
  }
  const title = pending?.status === "working" ? "Building your digital model" : pending?.status === "review" ? "Your model is ready to review" : "Create Digital You";
  const body = pending?.status === "working" ? "It keeps going if you leave this screen." : pending?.status === "review" ? "Take a look, then keep it or try again." : "Generate a visual model for style previews and future looks.";
  const cta = pending?.status === "working" ? "View progress" : pending?.status === "review" ? "Review model" : "Generate model";
  return (
    <section aria-labelledby="dm-h" className={cn(shell, "relative overflow-hidden")}>
      <span aria-hidden="true" className="absolute inset-x-5 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${CHAMPAGNE}99, transparent)` }} />
      <h2 id="dm-h" className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-[15px] leading-6 text-muted-foreground">{body}</p>
      {canGenerate ? (
        <Link to="/app/you/model" className="btn-primary mt-4 inline-flex">{cta}</Link>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Needs a GlowMax account, because models are generated on our server. Coming soon.</p>
      )}
    </section>
  );
};

export default You;
