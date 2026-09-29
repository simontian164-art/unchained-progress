import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowRight, Check, Loader2, Mail, Camera, ScanFace, ListChecks, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/config/site";
import { PLANS, getPlan, formatPrice, annualMonthlyEquivalent, type Billing } from "@/data/pricing";
import { submitWaitlist } from "@/lib/waitlist";
import { usePageMeta } from "@/hooks/usePageMeta";

const GOALS = [
  "Look sharper for work",
  "Dating",
  "A specific event",
  "Feel more put-together overall",
  "Something else",
];

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  firstName: z.string().trim().max(60).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please confirm so we can email you when your spot opens" }) }),
});

const NEXT_STEPS = [
  { icon: Mail, title: "We email you when your spot opens", body: "Groups are small so we can keep quality high." },
  { icon: UserPlus, title: "Create your account", body: "Takes under a minute — it's the first step of onboarding." },
  { icon: Camera, title: "Add your photos and goals", body: "Front, side and full body, plus a few quick questions." },
  { icon: ScanFace, title: "Get your analysis", body: "Focus areas, recommendations and your first week's actions." },
  { icon: ListChecks, title: "Follow your plan", body: "Check in with new photos and your plan updates." },
];

const GetStartedPage = () => {
  usePageMeta("Get started", "Join early access and choose your plan.");
  const [params] = useSearchParams();
  const initialPlan = getPlan(params.get("plan")).id;
  const initialBilling: Billing = params.get("billing") === "annual" ? "annual" : "monthly";

  const [plan, setPlan] = useState(initialPlan);
  const [billing, setBilling] = useState<Billing>(initialBilling);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [goal, setGoal] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "endpoint" | "email">(null);
  const [submitError, setSubmitError] = useState("");

  const selected = useMemo(() => getPlan(plan), [plan]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const parsed = schema.safeParse({ email, firstName: firstName || undefined, consent });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((er) => (errs[String(er.path[0])] = er.message));
      setErrors(errs);
      const first = document.getElementById(Object.keys(errs)[0] === "consent" ? "consent" : Object.keys(errs)[0]);
      first?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);
    const res = await submitWaitlist({
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      plan: selected.name,
      billing,
      goal: goal || undefined,
      consent,
    });
    setSubmitting(false);
    if ("error" in res) setSubmitError(res.error);
    else setDone(res.via);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
        <div className="surface-card rounded-[28px] p-8 text-center sm:p-12" role="status">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-success/15">
            <Check className="h-7 w-7 text-status-success" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold text-foreground">
            {done === "endpoint" ? "You're on the list" : "Almost done — send the email"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted-foreground">
            {done === "endpoint"
              ? `We'll email ${email} when your spot opens. You won't be charged anything until you choose to start.`
              : `Your email app should have opened with a pre-filled message. Send it and we'll add ${email} to the list. If nothing opened, email ${SITE.supportEmail}.`}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/example" className="btn-secondary">
              Look through the example again
            </Link>
            <Link to="/" className="btn-primary">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = (err?: string) =>
    cn(
      "w-full h-12 rounded-xl border bg-white/[0.03] px-4 text-[15px] text-foreground placeholder:text-white/35 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
      err ? "border-destructive" : "border-white/[0.12] hover:border-white/20",
    );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="eyebrow">Early access</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl">
            Build your plan
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            We're opening access in small groups. Choose your plan and join the list — it's free, and you don't need a card.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-7">
            <fieldset>
              <legend className="text-sm font-medium text-foreground">Plan</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {PLANS.map((p) => (
                  <label
                    key={p.id}
                    className={cn(
                      "surface-inset flex cursor-pointer flex-col rounded-xl p-4 transition-colors focus-within:ring-2 focus-within:ring-white/40",
                      plan === p.id ? "border-white/30 bg-white/[0.06]" : "hover:border-white/15",
                    )}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={plan === p.id}
                      onChange={() => setPlan(p.id)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border",
                          plan === p.id ? "border-foreground" : "border-white/30",
                        )}
                        aria-hidden="true"
                      >
                        {plan === p.id && <span className="h-2 w-2 rounded-full bg-foreground" />}
                      </span>
                    </span>
                    <span className="mt-1 text-sm text-muted-foreground">
                      {billing === "annual"
                        ? `${formatPrice(annualMonthlyEquivalent(p))}/mo · ${formatPrice(p.annualPrice)}/yr`
                        : `${formatPrice(p.monthlyPrice)}/mo`}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-sm" role="radiogroup" aria-label="Billing period">
                {(["monthly", "annual"] as const).map((b) => (
                  <label key={b} className="inline-flex cursor-pointer items-center gap-2 text-muted-foreground">
                    <input
                      type="radio"
                      name="billing"
                      value={b}
                      checked={billing === b}
                      onChange={() => setBilling(b)}
                      className="h-4 w-4 accent-white"
                    />
                    {b === "monthly" ? "Monthly" : "Annual (2 months free)"}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={cn("mt-2", inputCls(errors.email))}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First name <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={cn("mt-2", inputCls())}
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal" className="text-sm font-medium text-foreground">
                Main goal <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <select
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={cn("mt-2 appearance-none", inputCls())}
              >
                <option value="">Choose one</option>
                {GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  aria-invalid={!!errors.consent}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                  className="mt-1 h-4 w-4 shrink-0 accent-white"
                />
                <span>
                  Email me when my spot opens, plus occasional product updates. I can unsubscribe anytime. See the{" "}
                  <Link to="/privacy" className="text-foreground underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && (
                <p id="consent-error" className="mt-1.5 text-sm text-red-400">
                  {errors.consent}
                </p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {submitError}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving your spot…
                </>
              ) : (
                <>
                  Join early access <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
            <p className="text-sm text-muted-foreground">No card needed. Nothing is charged until you choose to start.</p>
          </form>
        </div>

        <aside aria-labelledby="next-steps-title" className="lg:pt-16">
          <div className="surface-card rounded-[22px] p-6">
            <h2 id="next-steps-title" className="font-display text-lg font-semibold text-foreground">
              What happens next
            </h2>
            <ol className="mt-5 space-y-5">
              {NEXT_STEPS.map((s, i) => (
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
          </div>
          <div className="mt-4 surface-inset rounded-2xl p-5 text-sm leading-6 text-muted-foreground">
            <p className="font-medium text-foreground">{selected.name} includes</p>
            <ul className="mt-2 space-y-1.5">
              {selected.highlights.slice(0, 4).map((h) => (
                <li key={h} className="flex gap-2">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-silver-bright" aria-hidden="true" /> {h}
                </li>
              ))}
            </ul>
            <Link to="/pricing" className="mt-3 inline-block text-foreground underline underline-offset-4">
              Compare plans
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GetStartedPage;
