import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Lock, ShieldCheck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, getPlan, formatPrice, annualSavingsAmount, type Billing, type PlanId } from "@/data/pricing";
import { createAccount, signIn, signInWithGoogle, startCheckout } from "@/lib/checkout";
import { usePageMeta } from "@/hooks/usePageMeta";

const money = (n: number) => `$${n.toFixed(2)}`;

const addPeriod = (billing: Billing) => {
  const d = new Date();
  if (billing === "annual") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

/** Old links used ?tier=starter|core|all_access. */
const planFromParams = (params: URLSearchParams): PlanId => {
  const tier = params.get("tier");
  if (tier) return tier === "starter" ? "essentials" : "plus";
  return getPlan(params.get("plan")).id;
};

const emailSchema = z.string().trim().email("Enter a valid email address");
const passwordSchema = z.string().min(8, "Use at least 8 characters");

type Step = "account" | "payment";
type Mode = "signup" | "signin";

const STEPS: { id: Step | "done"; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "payment", label: "Payment" },
  { id: "done", label: "Start your plan" },
];

// ─── Order summary ─────────────────────────────────────────────
const OrderSummary = ({
  plan,
  billing,
  onPlan,
  onBilling,
  locked,
}: {
  plan: PlanId;
  billing: Billing;
  onPlan: (p: PlanId) => void;
  onBilling: (b: Billing) => void;
  locked: boolean;
}) => {
  const p = getPlan(plan);
  const total = billing === "annual" ? p.annualPrice : p.monthlyPrice;
  return (
    <section aria-labelledby="summary-title" className="surface-card rounded-[22px] p-5 sm:p-6">
      <h2 id="summary-title" className="font-display text-lg font-semibold text-foreground">
        Order summary
      </h2>

      <fieldset className="mt-4" disabled={locked}>
        <legend className="sr-only">Plan</legend>
        <div className="grid grid-cols-2 gap-2">
          {PLANS.map((opt) => (
            <label
              key={opt.id}
              className={cn(
                "cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-white/40",
                plan === opt.id ? "border-white/30 bg-white/[0.07] text-foreground" : "border-white/10 text-muted-foreground hover:border-white/20",
                locked && "cursor-not-allowed opacity-70",
              )}
            >
              <input type="radio" name="summary-plan" value={opt.id} checked={plan === opt.id} onChange={() => onPlan(opt.id)} className="sr-only" />
              <span className="block font-medium">{opt.name}</span>
              <span className="block text-xs text-muted-foreground">{formatPrice(opt.monthlyPrice)}/mo</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-3" disabled={locked}>
        <legend className="sr-only">Billing period</legend>
        <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {(["monthly", "annual"] as const).map((b) => (
            <label
              key={b}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 text-center text-sm transition-colors focus-within:ring-2 focus-within:ring-white/40",
                billing === b ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:text-foreground",
                locked && "cursor-not-allowed",
              )}
            >
              <input type="radio" name="summary-billing" value={b} checked={billing === b} onChange={() => onBilling(b)} className="sr-only" />
              {b === "monthly" ? "Monthly" : "Annual"}
            </label>
          ))}
        </div>
      </fieldset>

      <dl className="mt-5 space-y-2.5 text-sm tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">
            {p.name} · {billing === "annual" ? "billed yearly" : "billed monthly"}
          </dt>
          <dd className="text-foreground">{money(total)}</dd>
        </div>
        {billing === "annual" && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Annual saving vs. monthly</dt>
            <dd className="text-status-success">−{money(annualSavingsAmount(p))}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="text-muted-foreground">Calculated at payment</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/[0.08] pt-3 text-base">
          <dt className="font-medium text-foreground">Due today</dt>
          <dd className="font-display font-semibold text-foreground">{money(total)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Renews on {addPeriod(billing)} at {money(total)}. Cancel anytime; you keep access until the end of the paid period.
      </p>

      <div className="mt-5 hidden border-t border-white/[0.08] pt-4 lg:block">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Included</p>
        <ul className="mt-2.5 space-y-2">
          {p.highlights.slice(0, 4).map((h) => (
            <li key={h} className="flex gap-2 text-sm leading-5 text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-silver-bright" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// ─── Page ──────────────────────────────────────────────────────
const CheckoutPage = () => {
  usePageMeta("Checkout", "Create your account and start your plan.");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<PlanId>(planFromParams(params));
  const [billing, setBilling] = useState<Billing>(params.get("billing") === "annual" ? "annual" : "monthly");
  const [step, setStep] = useState<Step>("account");
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signin" ? "signin" : "signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState<null | "auth" | "google" | "pay">(null);
  const [account, setAccount] = useState<string | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, mode]);

  const p = useMemo(() => getPlan(plan), [plan]);
  const total = billing === "annual" ? p.annualPrice : p.monthlyPrice;

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    const em = emailSchema.safeParse(email);
    if (!em.success) errs.email = em.error.errors[0].message;
    const pw = mode === "signup" ? passwordSchema.safeParse(password) : z.string().min(1, "Enter your password").safeParse(password);
    if (!pw.success) errs.password = pw.error.errors[0].message;
    setErrors(errs);
    if (errs.email || errs.password) {
      document.getElementById(errs.email ? "email" : "password")?.focus();
      return;
    }
    setBusy("auth");
    const res = mode === "signup" ? await createAccount(email.trim(), password) : await signIn(email.trim(), password);
    setBusy(null);
    if ("error" in res) return setErrors({ form: res.error });
    setAccount(res.email);
    setStep("payment");
  };

  const google = async () => {
    setBusy("google");
    const res = await signInWithGoogle();
    setBusy(null);
    if ("error" in res) setErrors({ form: res.error });
    else {
      setAccount(res.email);
      setStep("payment");
    }
  };

  const pay = async () => {
    setErrors({});
    setBusy("pay");
    const res = await startCheckout(plan, billing);
    if ("error" in res) {
      setBusy(null);
      return setErrors({ form: res.error });
    }
    if (res.redirectUrl.startsWith("/")) navigate(res.redirectUrl);
    else window.location.href = res.redirectUrl;
  };

  const currentIndex = step === "account" ? 0 : 1;
  const inputCls = (err?: string) =>
    cn(
      "mt-2 h-12 w-full rounded-xl border bg-white/[0.03] px-4 text-[15px] text-foreground placeholder:text-white/35 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
      err ? "border-red-400/70" : "border-white/[0.12] hover:border-white/20",
    );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to plans
      </Link>

      {/* stepper */}
      <ol className="mt-6 flex items-center gap-2 text-sm" aria-label="Checkout progress">
        {STEPS.map((s, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;
          return (
            <li key={s.id} className="flex items-center gap-2" aria-current={current ? "step" : undefined}>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-xs tabular-nums",
                  done && "border-status-success/50 bg-status-success/15 text-status-success",
                  current && "border-foreground bg-foreground text-background",
                  !done && !current && "border-white/15 text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn(current ? "text-foreground" : "text-muted-foreground", "hidden sm:inline")}>{s.label}</span>
              {done && <span className="sr-only">(completed)</span>}
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-white/15 sm:w-10" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* ── main column ── */}
        <div className="order-2 min-w-0 lg:order-1">
          {step === "account" ? (
            <section aria-labelledby="account-title">
              <h1 id="account-title" ref={headingRef} tabIndex={-1} className="font-display text-3xl font-semibold text-foreground outline-none sm:text-4xl">
                {mode === "signup" ? "Create your account" : "Sign in to continue"}
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                {mode === "signup"
                  ? "Your account holds your photos, analysis and plan. Takes under a minute."
                  : `Sign in, then finish checkout for ${p.name}.`}
              </p>

              <button
                type="button"
                onClick={google}
                disabled={!!busy}
                className="btn-secondary mt-7 w-full disabled:opacity-60"
              >
                {busy === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
                <span className="h-px flex-1 bg-white/10" /> or with email <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={submitAccount} noValidate className="space-y-5">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={inputCls(errors.email)}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p id="email-error" className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                    {mode === "signin" && (
                      <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" onClick={() => setErrors({ form: "Password reset will be available once accounts are connected." })}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : mode === "signup" ? "password-hint" : undefined}
                      className={cn(inputCls(errors.password), "pr-12")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      title={showPw ? "Hide password" : "Show password"}
                      className="absolute right-2 top-[calc(50%+4px)] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p id="password-error" className="mt-1.5 text-sm text-red-400">{errors.password}</p>
                  ) : (
                    mode === "signup" && <p id="password-hint" className="mt-1.5 text-sm text-muted-foreground">At least 8 characters.</p>
                  )}
                </div>

                {errors.form && (
                  <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{errors.form}</p>
                )}

                <button type="submit" disabled={!!busy} className="btn-primary w-full disabled:opacity-60">
                  {busy === "auth" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {mode === "signup" ? "Creating account…" : "Signing in…"}</>
                  ) : (
                    <>{mode === "signup" ? "Create account and continue" : "Sign in and continue"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></>
                  )}
                </button>

                {mode === "signup" && (
                  <p className="text-xs leading-5 text-muted-foreground">
                    By creating an account you agree to the{" "}
                    <Link to="/terms" className="text-foreground underline underline-offset-4">Terms</Link> and{" "}
                    <Link to="/privacy" className="text-foreground underline underline-offset-4">Privacy Policy</Link>.
                  </p>
                )}
              </form>

              <p className="mt-6 text-sm text-muted-foreground">
                {mode === "signup" ? "Already have an account? " : "New here? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signup" ? "signin" : "signup");
                    setErrors({});
                  }}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {mode === "signup" ? "Sign in" : "Create an account"}
                </button>
              </p>
            </section>
          ) : (
            <section aria-labelledby="payment-title">
              <h1 id="payment-title" ref={headingRef} tabIndex={-1} className="font-display text-3xl font-semibold text-foreground outline-none sm:text-4xl">
                Review and pay
              </h1>
              <p className="mt-2 text-base text-muted-foreground">Check your plan, then continue to our payment provider to enter your card.</p>

              <div className="surface-inset mt-7 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm">
                <p className="min-w-0 truncate text-muted-foreground">
                  Account: <span className="text-foreground">{account}</span>
                </p>
                <button type="button" onClick={() => setStep("account")} className="shrink-0 text-foreground underline-offset-4 hover:underline">
                  Change
                </button>
              </div>

              <div className="surface-card mt-4 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{billing === "annual" ? "Billed once a year" : "Billed every month"}</p>
                  </div>
                  <p className="font-display text-2xl font-semibold tabular-nums text-foreground">{money(total)}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{p.summary} Change plan or billing in the summary.</p>
              </div>

              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3"><CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-silver-bright" aria-hidden="true" /><span>You'll enter your card on a secure page from our payment provider. We never see or store your full card number.</span></li>
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-silver-bright" aria-hidden="true" /><span>Cancel anytime from your account. See the <Link to="/refunds" className="text-foreground underline underline-offset-4">refund policy</Link>.</span></li>
              </ul>

              {errors.form && (
                <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{errors.form}</p>
              )}

              <button type="button" onClick={pay} disabled={!!busy} className="btn-primary mt-7 w-full disabled:opacity-60">
                {busy === "pay" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Opening secure payment…</>
                ) : (
                  <><Lock className="h-4 w-4" aria-hidden="true" /> Continue to payment · {money(total)}</>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Plus applicable tax. Renews {billing === "annual" ? "yearly" : "monthly"} until cancelled.
              </p>
            </section>
          )}
        </div>

        {/* ── summary column ── */}
        <div className="order-1 lg:sticky lg:top-8 lg:order-2">
          <OrderSummary plan={plan} billing={billing} onPlan={setPlan} onBilling={setBilling} locked={busy === "pay"} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
