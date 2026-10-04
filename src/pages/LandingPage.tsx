import { Link } from "react-router-dom";
import { HeroProductCard } from "@/components/marketing/demo/HeroProductCard";
import { NewYearIntro } from "@/components/marketing/campaign/NewYearIntro";
import { CAMPAIGN } from "@/config/site";
import { ExampleAnalysis, AnalysisSteps } from "@/components/marketing/demo/ExampleAnalysis";
import { RoadmapPreview, ProgressPreview } from "@/components/marketing/demo/PlanPreview";
import { SectionHeading } from "@/components/marketing/Reveal";
import { PricingBlock } from "@/components/marketing/PricingSection";
import { Faq } from "@/components/marketing/Faq";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AREA } from "@/app/visuals/areas";
import { GlowRing } from "@/app/visuals/ring/GlowRing";
import type { ModuleId } from "@/app/types";

/*
 * Landing page. Deliberately avoids the template tells: no badge above the headline, no gradient
 * text, no icon-in-a-box feature grids, no fade-in-on-scroll, no centred-everything. Sections are
 * numbered rows with hairline rules, and every claim is shown as an actual output.
 */

const STEPS = [
  { title: "Photos and questions", body: "Front, side and full body, plus your goal, your routine and what you'll spend.", time: "5 min" },
  { title: "Analysis", body: "The face scan runs on your device. It reads face shape and a few careful cues. Your answers cover the rest.", time: "About a minute" },
  { title: "Your plan", body: "Every change ranked by how much difference it makes: the haircut to ask for, the routine to start, what to buy.", time: "Instant" },
  { title: "Daily protocol", body: "Up to three actions a day, plus a morning and evening routine that takes minutes.", time: "Minutes a day" },
  { title: "Check-ins", body: "One photo every two weeks. The plan drops what's done and moves to what's next.", time: "Every 14 days" },
];

// Example outputs for the sample member used across the site (src/data/exampleAnalysis.ts).
const AREAS: { id: ModuleId; title: string; out: string; tag?: string }[] = [
  { id: "face", title: "Face", out: "Oval, slightly square jaw. Short sides with volume on top. Rectangular or browline frames." },
  { id: "hair", title: "Hair & hairline", out: "Textured crop with a fringe, #2 to 3 taper. Rebook every 4 to 5 weeks. A card to show your barber." },
  { id: "skin", title: "Skin", out: "Morning: cleanse, moisturize, SPF 30. Evening: cleanse, moisturize. Three products, not twelve." },
  { id: "beard", title: "Facial hair", out: "Heavy stubble at 3 to 5 mm. Neckline one finger above the Adam's apple." },
  { id: "style", title: "Style", out: "Tailor one pair of trousers first. Navy, grey and white before anything else." },
  { id: "body", title: "Body & posture", out: "A 10-minute posture routine, three or four times a week. No body-fat guesses from photos.", tag: "Plus" },
];

const VERSUS = [
  ["Rate your face out of 10", "No scores or rankings. Ever."],
  ["The same tips for everyone", "Built from your photos, routine and budget"],
  ["A course to binge", "Up to three actions a day"],
  ["A one-off report", "The plan updates with every check-in"],
];

const PRIVACY = [
  ["The face scan runs on your device", "Landmarks are read in your browser. Scan photos aren't uploaded to our servers."],
  ["Your photos stay on your device", "Photos and progress are saved in your browser, not on our servers."],
  ["Delete everything in one tap", "Settings removes every photo, answer and plan."],
  ["Never sold", "We don't sell your photos or use them for advertising."],
];

const Section = ({ id, label, children, className = "" }: { id?: string; label: string; children: React.ReactNode; className?: string }) => (
  <section id={id} aria-labelledby={`${label}-title`} className={`scroll-mt-20 border-t border-white/[0.08] ${className}`}>
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">{children}</div>
  </section>
);

const LandingPage = () => {
  usePageMeta();
  const ny = CAMPAIGN.newYear;

  return (
    <>
      {ny && <NewYearIntro />}
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section aria-labelledby="hero-title">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:pb-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_300px]">
            <div className="max-w-3xl">
              <h1 id="hero-title" className="font-wide text-[2.7rem] font-semibold uppercase leading-[0.95] text-foreground sm:text-7xl lg:text-[5.4rem]">
                {ny ? <>The 90-Day<br />Protocol</> : <>Know what to change.<br />Then change it.</>}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Five minutes of photos and questions. You get the haircut to ask for, a skin routine with three
                products, and what to do today, this week and this month.{ny ? " Then you follow it for 90 days." : ""}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/get-started" className="btn-primary">
                  {ny ? "Begin Day 01" : "Build my plan"}
                </Link>
                <Link to="/example" className="btn-secondary">
                  See an example analysis
                </Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <li>About 5 minutes to start</li>
                <li>No attractiveness scores</li>
                <li>Face scan runs on your device</li>
              </ul>
            </div>
            <div className="hidden justify-self-end lg:block" aria-hidden="true">
              <GlowRing state="progress" progress={1 / 90} size={280}>
                <span className="text-sm text-[#ede6d6]/75">Day</span>
                <span className="font-wide text-6xl font-light tabular-nums text-[#ede6d6]">01</span>
                <span className="text-sm text-[#ede6d6]/75">of 90</span>
              </GlowRing>
            </div>
          </div>

          <div className="mt-14 sm:mt-16">
            <HeroProductCard />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <Section id="how-it-works" label="how">
        <SectionHeading id="how-title" index={1} eyebrow="How it works" title="From photos to a daily plan in five steps" />
        <ol className="mt-12 border-t border-white/[0.1] lg:ml-[248px]">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-white/[0.1] py-6 sm:grid-cols-[4rem_1fr_auto] sm:gap-x-6">
              <span className="font-wide text-2xl font-light tabular-nums text-[#ede6d6]">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 max-w-xl text-[15px] leading-7 text-muted-foreground">{s.body}</p>
              </div>
              <span className="col-start-2 mt-2 text-sm text-foreground/80 sm:col-start-3 sm:mt-1 sm:text-right">{s.time}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* ─── EXAMPLE ANALYSIS ─────────────────────────────── */}
      <Section id="example" label="example">
        <SectionHeading
          id="example-title"
          index={2}
          eyebrow="Example analysis"
          title="This is what you get back"
          body="The real layout with a sample member. Tap through the focus areas to see the detail each recommendation includes."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div>
            <AnalysisSteps />
            <p className="mt-4 px-1 text-sm leading-6 text-muted-foreground">
              Each area comes with what we noticed, what to do about it and the exact steps, ranked by how much
              difference it's likely to make.
            </p>
          </div>
          <ExampleAnalysis />
        </div>
        <div className="mt-8">
          <Link to="/example" className="btn-secondary">
            Open the full example
          </Link>
        </div>
      </Section>

      {/* ─── WHAT WE ANALYZE ──────────────────────────────── */}
      <Section id="what-we-analyze" label="analyze">
        <SectionHeading
          id="analyze-title"
          index={3}
          eyebrow="What we analyze"
          title="Six areas you can change"
          body="Things in your control. Not the features you were born with. On the right, what the sample member got."
        />
        <ul className="mt-12 border-t border-white/[0.1] lg:ml-[248px]">
          {AREAS.map((a) => (
            <li key={a.id} className="grid gap-2 border-b border-white/[0.1] py-5 sm:grid-cols-[220px_1fr] sm:gap-6">
              <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold text-foreground">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: AREA[a.id].color }} />
                {a.title}
                {a.tag && <span className="text-xs font-normal text-muted-foreground">{a.tag}</span>}
              </h3>
              <p className="text-[15px] leading-7 text-[#ede6d6]">{a.out}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ─── YOUR PLAN ────────────────────────────────────── */}
      <Section id="plan" label="plan">
        <SectionHeading
          id="plan-title"
          index={4}
          eyebrow="Your plan"
          title="A short list of actions, in the right order"
          body="Up to three actions today, then this week, this month and later. Check in with a new photo and it updates."
        />
        <div className="mt-12 space-y-4">
          <RoadmapPreview />
          <ProgressPreview />
        </div>
      </Section>

      {/* ─── WHY DIFFERENT ────────────────────────────────── */}
      <Section label="diff">
        <SectionHeading id="diff-title" index={5} eyebrow="Why it's different" title="No score out of 10. A plan instead." />
        <div className="mt-12 lg:ml-[248px]">
          <div className="hidden grid-cols-2 gap-6 border-b border-white/[0.1] pb-3 text-sm text-muted-foreground sm:grid">
            <span>Most looks apps</span>
            <span className="text-foreground">GlowMax</span>
          </div>
          <ul>
            {VERSUS.map(([them, us]) => (
              <li key={them} className="grid gap-1 border-b border-white/[0.1] py-5 sm:grid-cols-2 sm:gap-6">
                <span className="text-[15px] text-muted-foreground"><span className="sm:hidden">Most apps: </span>{them}</span>
                <span className="font-display text-lg font-semibold text-foreground">{us}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ─── PRIVACY ──────────────────────────────────────── */}
      <Section id="privacy" label="privacy">
        <SectionHeading id="privacy-title" index={6} eyebrow="Photo privacy" title="Your photos are personal. Here's exactly what happens to them." />
        <dl className="mt-12 border-t border-white/[0.1] lg:ml-[248px]">
          {PRIVACY.map(([t, b]) => (
            <div key={t} className="grid gap-1 border-b border-white/[0.1] py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] sm:gap-6">
              <dt className="font-display text-lg font-semibold text-foreground">{t}</dt>
              <dd className="text-[15px] leading-7 text-muted-foreground">{b}</dd>
            </div>
          ))}
        </dl>
        <Link to="/privacy#photos" className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4 lg:ml-[248px]">
          Read the full photo policy
        </Link>
      </Section>

      {/* ─── PRICING ──────────────────────────────────────── */}
      <Section id="pricing" label="pricing">
        <SectionHeading
          id="pricing-title"
          index={7}
          eyebrow="Pricing"
          title="Two plans. Clear limits."
          body="Both include the full analysis and a personal plan. Plus adds re-analysis every two weeks, body and posture, and hairline tracking."
        />
        <div className="mt-12">
          <PricingBlock inset />
        </div>
        <p className="mt-8 text-sm lg:ml-[248px]">
          <Link to="/pricing" className="text-foreground underline underline-offset-4">
            Compare plans in detail
          </Link>
        </p>
      </Section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <Section id="faq" label="faq">
        <SectionHeading id="faq-title" index={8} eyebrow="FAQ" title="Common questions" />
        <div className="mt-10 lg:ml-[248px]">
          <Faq />
        </div>
      </Section>

      {/* ─── FINAL CTA ────────────────────────────────────── */}
      <section aria-labelledby="cta-title" className="border-t border-white/[0.08]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 id="cta-title" className="font-wide text-4xl font-semibold uppercase leading-[0.98] text-foreground sm:text-6xl">
              Day 01 takes<br />five minutes.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Or look at a full example analysis first, before you share a single photo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/get-started" className="btn-primary">
                {ny ? "Begin Day 01" : "Build my plan"}
              </Link>
              <Link to="/example" className="btn-secondary">
                See an example analysis
              </Link>
            </div>
          </div>
          <div className="hidden lg:block" aria-hidden="true">
            <GlowRing state="complete" size={220}>
              <span className="font-wide text-4xl font-light tabular-nums text-[#ede6d6]">90</span>
            </GlowRing>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
