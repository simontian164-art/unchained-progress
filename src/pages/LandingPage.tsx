import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  ScanFace,
  ListChecks,
  Map,
  LineChart,
  Droplets,
  Scissors,
  Sparkles,
  Shirt,
  Dumbbell,
  Target,
  Wallet,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
  EyeOff,
  Layers,
  UserRound,
} from "lucide-react";
import { HeroProductCard } from "@/components/marketing/demo/HeroProductCard";
import { ExampleAnalysis, AnalysisSteps } from "@/components/marketing/demo/ExampleAnalysis";
import { RoadmapPreview, ProgressPreview } from "@/components/marketing/demo/PlanPreview";
import { Reveal, SectionHeading } from "@/components/marketing/Reveal";
import { PricingBlock } from "@/components/marketing/PricingSection";
import { Faq } from "@/components/marketing/Faq";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AREA } from "@/app/visuals/areas";
import type { ModuleId } from "@/app/types";

const STEPS = [
  { icon: Camera, title: "Upload photos", body: "Front, side and full body, plus your goal and current routine. About five minutes." },
  { icon: ScanFace, title: "Get analyzed", body: "Your front photo gives face shape and a few careful cues; your answers cover skin, hair, grooming, style and body." },
  { icon: ListChecks, title: "Get recommendations", body: "Specific changes ranked by impact — the haircut to ask for, the routine to start, what to buy." },
  { icon: Map, title: "Follow your plan", body: "Up to three actions today, then this week, this month and later, so you always know what's next." },
  { icon: LineChart, title: "Track and update", body: "Check in with new photos. Your plan adjusts to what changed and what's left." },
];

// Same colours and icons as the member app (src/app/visuals/areas.ts).
const AREAS: { id: ModuleId; title: string; body: string; tag?: string }[] = [
  { id: "face", title: "Face", body: "Face shape and proportions, to guide your haircut, beard shape and glasses frames." },
  { id: "skin", title: "Skin", body: "A simple morning and evening routine for your skin type, sensitivities and budget, with what to buy." },
  { id: "hair", title: "Hair & hairline", body: "Cut options for your face shape, texture, density and hairline, with a card to show your barber." },
  { id: "beard", title: "Facial hair & grooming", body: "Beard or stubble options, neckline and cheek lines, brows, and lip and smile habits." },
  { id: "style", title: "Style", body: "How your clothes fit, which colors suit you, and the pieces worth buying first." },
  { id: "body", title: "Body & posture", body: "Training, posture and sleep for your goal, with a 10-minute posture routine. No body-fat estimates from photos.", tag: "Plus" },
];

const CONTEXT = [
  { icon: Camera, title: "Your photos", body: "Front, side and full body — not a generic questionnaire." },
  { icon: Target, title: "Your goal", body: "Work, dating, an event, or just feeling more put-together." },
  { icon: Wallet, title: "Your routine & budget", body: "Recommendations fit what you already do and spend." },
  { icon: RefreshCw, title: "Your progress", body: "The plan updates each time you check in." },
];

const DIFFERENT = [
  { icon: Layers, title: "Not generic advice", body: "Tips written for everyone fit no one. Every recommendation here comes from your photos and answers." },
  { icon: Map, title: "Not a static course", body: "No videos to binge. You get a short list of actions for this week, and the next." },
  { icon: RefreshCw, title: "Changes as you do", body: "Re-analyze with new photos and your plan drops what's done and focuses on what's left." },
  { icon: EyeOff, title: "No scores, no rankings", body: "We don't rate your looks or compare you to anyone. We focus on what you can change." },
];

const PRIVACY = [
  { icon: Smartphone, title: "Face scan runs on your device", body: "The landmark scan happens in your browser. Scan photos aren't uploaded to our servers." },
  { icon: ShieldCheck, title: "Stays on your device", body: "Photos and progress are saved in your browser, not on our servers." },
  { icon: Trash2, title: "Delete anytime", body: "One tap in Settings removes every photo, answer and plan." },
  { icon: EyeOff, title: "Never sold", body: "We don't sell your photos or use them for advertising." },
];

const LandingPage = () => {
  usePageMeta();
  const reduce = useReducedMotion();

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 100% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:pb-24">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="eyebrow">AI appearance analysis + personalized plan</p>
            <h1
              id="hero-title"
              className="mt-4 font-display text-[2.35rem] font-semibold leading-[1.05] text-foreground sm:text-6xl"
            >
              See what you can improve — and get a plan built around you.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Upload your photos and get a personalized breakdown of your face, skin, hair, grooming and style — with
              step-by-step recommendations you can actually follow.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link to="/example" className="btn-primary">
                See an example analysis <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/get-started" className="btn-secondary">
                Build my plan
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li>About 5 minutes to start</li>
              <li aria-hidden="true" className="hidden sm:block">·</li>
              <li>No attractiveness scores</li>
              <li aria-hidden="true" className="hidden sm:block">·</li>
              <li>Face scan runs on your device</li>
            </ul>
          </motion.div>

          <div className="mt-14 sm:mt-16">
            <HeroProductCard />
          </div>
        </div>
      </section>

      {/* ─── PRODUCT PROOF / CONTEXT ──────────────────────── */}
      <section aria-labelledby="context-title" className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="context-title" className="text-center font-display text-xl font-semibold text-foreground sm:text-2xl">
            Built around your photos, goals and current routine.
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTEXT.map((c, i) => (
              <Reveal as="li" key={c.title} delay={i * 0.06} className="flex gap-3">
                <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-silver-bright" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading
            id="how-title"
            eyebrow="How it works"
            title="From photos to a plan in five steps"
            body="What happens after you upload, and what you get back."
          />
          <ol className="mt-14 grid gap-4 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.07} className="surface-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-silver-bright" aria-hidden="true" />
                  <span className="text-xs text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── EXAMPLE ANALYSIS ─────────────────────────────── */}
      <section id="example" aria-labelledby="example-title" className="scroll-mt-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading
            id="example-title"
            eyebrow="Example analysis"
            title="This is what you get back"
            body="A real layout with sample content. Tap through the focus areas to see the kind of detail each recommendation includes."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-[280px_1fr]">
            <Reveal>
              <AnalysisSteps />
              <p className="mt-4 px-1 text-sm leading-6 text-muted-foreground">
                Each focus area comes with what we noticed, what to do about it, and the exact steps — ranked by how much
                difference it's likely to make.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <ExampleAnalysis />
            </Reveal>
          </div>
          <div className="mt-8 flex justify-center">
            <Link to="/example" className="btn-secondary">
              Open the full example <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE ANALYZE ──────────────────────────────── */}
      <section id="what-we-analyze" aria-labelledby="analyze-title" className="scroll-mt-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading
            id="analyze-title"
            eyebrow="What we analyze"
            title="Six areas you can actually change"
            body="We focus on things within your control — not features you were born with."
          />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((a, i) => (
              <Reveal
                as="li"
                key={a.title}
                delay={(i % 3) * 0.06}
                className="surface-card group rounded-2xl p-6 transition-colors hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${AREA[a.id].color}1f`, color: AREA[a.id].color }}>
                    {(() => { const I = AREA[a.id].icon; return <I className="h-5 w-5" aria-hidden="true" />; })()}
                  </span>
                  {a.tag && (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {a.tag}
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{a.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── YOUR PLAN ────────────────────────────────────── */}
      <section id="plan" aria-labelledby="plan-title" className="scroll-mt-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading
            id="plan-title"
            eyebrow="Your personalized plan"
            title="A short list of actions, in the right order"
            body="Up to three actions today, then this week, this month and later. Check in with new photos and it updates."
          />
          <div className="mt-12 space-y-4">
            <Reveal>
              <RoadmapPreview />
            </Reveal>
            <Reveal delay={0.08}>
              <ProgressPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── WHY DIFFERENT ────────────────────────────────── */}
      <section aria-labelledby="diff-title" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading id="diff-title" eyebrow="Why it's different" title="Built around one person: you" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {DIFFERENT.map((d, i) => (
              <Reveal as="li" key={d.title} delay={(i % 2) * 0.06} className="surface-card flex gap-4 rounded-2xl p-6">
                <d.icon className="mt-0.5 h-5 w-5 shrink-0 text-silver-bright" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">{d.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{d.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── PRIVACY ──────────────────────────────────────── */}
      <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div>
              <SectionHeading
                align="left"
                id="privacy-title"
                eyebrow="Photo privacy"
                title="Your photos are personal. We treat them that way."
                body="Here's exactly how your photos are handled — no vague promises."
              />
              <Link to="/privacy#photos" className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4">
                Read how photos are handled <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {PRIVACY.map((p) => (
                <li key={p.title} className="surface-inset rounded-2xl p-5">
                  <p.icon className="h-5 w-5 text-silver-bright" aria-hidden="true" />
                  <h3 className="mt-4 text-sm font-medium text-foreground">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────── */}
      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading
            id="pricing-title"
            eyebrow="Pricing"
            title="Two plans. Clear limits."
            body="Both include a full analysis and a personalized plan. Plus adds weekly re-analysis, physique and visual style tools."
          />
          <div className="mt-10">
            <PricingBlock />
          </div>
          <p className="mt-8 text-center text-sm">
            <Link to="/pricing" className="text-foreground underline underline-offset-4">
              Compare plans in detail
            </Link>
          </p>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-10">
            <Faq />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────── */}
      <section aria-labelledby="cta-title" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="surface-card rounded-[28px] px-6 py-14 text-center sm:px-12">
            <h2 id="cta-title" className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Look at the example first. Decide after.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              See exactly what an analysis and plan look like before you share a single photo.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/example" className="btn-primary">
                See an example analysis <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/get-started" className="btn-secondary">
                Build my plan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
