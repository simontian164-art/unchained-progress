import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { ExampleAnalysis, AnalysisSteps } from "@/components/marketing/demo/ExampleAnalysis";
import { RoadmapPreview, ProgressPreview } from "@/components/marketing/demo/PlanPreview";
import { Reveal } from "@/components/marketing/Reveal";
import { EXAMPLE_PROFILE } from "@/data/exampleAnalysis";
import { usePageMeta } from "@/hooks/usePageMeta";

const ExampleAnalysisPage = () => {
  usePageMeta(
    "Example analysis",
    "See a complete example of a personalized appearance analysis: focus areas, recommendations, a 90-day roadmap and progress tracking.",
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <header className="max-w-3xl">
        <p className="eyebrow">Example analysis</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl">
          What you get after you upload your photos
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          This is the same layout members see, filled in for a sample profile. Every section below is built from the
          photos and answers you provide.
        </p>
      </header>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[hsl(42_70%_50%/0.25)] bg-[hsl(42_70%_50%/0.06)] p-4 text-sm leading-6 text-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(42_75%_70%)]" aria-hidden="true" />
        <p>
          <strong className="font-medium">Sample content.</strong> This example uses an illustrated profile, not a real
          person or a real user's results. Your analysis will be different.
        </p>
      </div>

      <section aria-labelledby="inputs-title" className="mt-12">
        <h2 id="inputs-title" className="font-display text-xl font-semibold text-foreground">
          1. What went in
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
          <dl className="surface-card grid gap-4 rounded-2xl p-5 sm:grid-cols-3 sm:p-6">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Photos</dt>
              <dd className="mt-1 text-sm text-foreground">{EXAMPLE_PROFILE.photos.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Goal</dt>
              <dd className="mt-1 text-sm text-foreground">{EXAMPLE_PROFILE.goal}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Current routine</dt>
              <dd className="mt-1 text-sm text-foreground">{EXAMPLE_PROFILE.routine}</dd>
            </div>
          </dl>
          <AnalysisSteps />
        </div>
      </section>

      <section aria-labelledby="results-title" className="mt-14">
        <h2 id="results-title" className="font-display text-xl font-semibold text-foreground">
          2. Your analysis
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          What's working in your favor, then focus areas ranked by impact. Select an area to see the recommendation and
          steps.
        </p>
        <Reveal className="mt-5">
          <ExampleAnalysis />
        </Reveal>
      </section>

      <section aria-labelledby="roadmap-title" className="mt-14">
        <h2 id="roadmap-title" className="font-display text-xl font-semibold text-foreground">
          3. Your roadmap
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Recommendations become weekly actions, ordered so the quickest, highest-impact changes come first.
        </p>
        <Reveal className="mt-5">
          <RoadmapPreview />
        </Reveal>
      </section>

      <section aria-labelledby="progress-title" className="mt-14">
        <h2 id="progress-title" className="font-display text-xl font-semibold text-foreground">
          4. Progress & re-analysis
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Check in with new photos. You see your own before-and-after, and the plan updates to what's left to do.
        </p>
        <Reveal className="mt-5">
          <ProgressPreview />
        </Reveal>
      </section>

      <section aria-labelledby="next-title" className="surface-card mt-16 rounded-[28px] px-6 py-12 text-center sm:px-12">
        <h2 id="next-title" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Want this for your own photos?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-muted-foreground">
          Pick a plan to see exactly what's included and how often you can re-analyze.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/pricing" className="btn-primary">
            See plans <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/#faq" className="btn-secondary">
            Read the FAQ
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ExampleAnalysisPage;
