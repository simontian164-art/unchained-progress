import { Link, useSearchParams } from "react-router-dom";
import { Camera, Check, ListChecks, ScanFace, Mail } from "lucide-react";
import { getPlan, type Billing } from "@/data/pricing";
import { usePageMeta } from "@/hooks/usePageMeta";

const NEXT = [
  { icon: ScanFace, title: "Tell us your goal", body: "A few quick questions about what you want and your current routine." },
  { icon: Camera, title: "Add three photos", body: "Front, side and full body. Good light, no filters." },
  { icon: ListChecks, title: "Get your analysis and plan", body: "Your focus areas and this week's first actions." },
];

/**
 * Stripe success_url lands here: /checkout/success?session_id=...
 * TODO(backend): verify the session / subscription server-side before showing this.
 */
const CheckoutSuccessPage = () => {
  usePageMeta("You're in");
  const [params] = useSearchParams();
  const plan = getPlan(params.get("plan"));
  const billing: Billing = params.get("billing") === "annual" ? "annual" : "monthly";
  const demo = params.get("demo") === "1";
  const total = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-success/15">
          <Check className="h-7 w-7 text-status-success" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          {demo ? "Demo complete" : "You're in"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted-foreground">
          {demo
            ? "This is the screen customers see after paying. In this demo nothing was charged and no account was created."
            : `Your ${plan.name} plan is active. Next, set up your first analysis. It takes about five minutes.`}
        </p>
      </div>

      <dl className="surface-inset mt-8 grid grid-cols-2 gap-4 rounded-2xl p-5 text-sm tabular-nums sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">Plan</dt>
          <dd className="mt-0.5 text-foreground">{plan.name}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Billing</dt>
          <dd className="mt-0.5 text-foreground">{billing === "annual" ? "Yearly" : "Monthly"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Amount</dt>
          <dd className="mt-0.5 text-foreground">${total.toFixed(2)} + tax</dd>
        </div>
      </dl>
      {!demo && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" aria-hidden="true" /> A receipt is on its way to your email.
        </p>
      )}

      <section aria-labelledby="next-title" className="surface-card mt-8 rounded-[22px] p-6">
        <h2 id="next-title" className="font-display text-lg font-semibold text-foreground">What happens next</h2>
        <ol className="mt-5 space-y-5">
          {NEXT.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <s.icon className="h-4 w-4 text-silver-bright" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </p>
                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link to="/app/start" className="btn-primary mt-7 w-full">
          Start setup
        </Link>
      </section>
    </div>
  );
};

export default CheckoutSuccessPage;
