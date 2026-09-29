import { Link, useSearchParams } from "react-router-dom";
import { PricingBlock } from "@/components/marketing/PricingSection";
import { Faq } from "@/components/marketing/Faq";
import { usePageMeta } from "@/hooks/usePageMeta";

const PricingPage = () => {
  usePageMeta(
    "Pricing",
    "Two plans with clear limits: Essentials ($19/month) and Plus ($39/month). Annual billing gets two months free.",
  );
  const [params] = useSearchParams();
  const cancelled = params.get("checkout") === "cancelled";
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      {cancelled && (
        <p role="status" className="mx-auto mb-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center text-sm text-foreground">
          Checkout was cancelled and you weren't charged. Your account is saved — pick a plan whenever you're ready.
        </p>
      )}
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl">
          Pick how often you want to re-analyze
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Both plans include a full analysis of your face, skin, hair, grooming and style, and a personalized plan. Not sure
          yet? <Link to="/example" className="text-foreground underline underline-offset-4">See the example first</Link>.
        </p>
      </header>

      <div className="mt-10">
        <PricingBlock showTable />
      </div>

      <section aria-labelledby="pricing-faq" className="mt-24">
        <h2 id="pricing-faq" className="text-center font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Common questions
        </h2>
        <div className="mt-8">
          <Faq />
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
