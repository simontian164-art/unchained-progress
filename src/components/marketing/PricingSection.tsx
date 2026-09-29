import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/config/site";
import {
  PLANS,
  COMPARISON,
  annualMonthlyEquivalent,
  annualSavingsAmount,
  annualSavingsPercent,
  formatPrice,
  type Billing,
} from "@/data/pricing";

export const BillingToggle = ({ value, onChange }: { value: Billing; onChange: (b: Billing) => void }) => (
  <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
    {(["monthly", "annual"] as const).map((b) => (
      <button
        key={b}
        type="button"
        role="radio"
        aria-checked={value === b}
        onClick={() => onChange(b)}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm transition-colors",
          value === b ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {b === "monthly" ? "Monthly" : "Annual · 2 months free"}
      </button>
    ))}
  </div>
);

export const PlanCards = ({ billing }: { billing: Billing }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {PLANS.map((plan) => {
      const annual = billing === "annual";
      const price = annual ? annualMonthlyEquivalent(plan) : plan.monthlyPrice;
      const cta = FEATURES.payments ? `Get ${plan.name}` : `Join early access — ${plan.name}`;
      return (
        <article
          key={plan.id}
          className={cn(
            "surface-card relative flex flex-col rounded-[22px] p-6 sm:p-7",
            plan.highlighted && "border-white/20",
          )}
          aria-labelledby={`plan-${plan.id}`}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 id={`plan-${plan.id}`} className="font-display text-xl font-semibold text-foreground">
              {plan.name}
            </h3>
            {plan.highlighted && (
              <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-silver-bright">
                Most complete
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{plan.summary}</p>

          <div className="mt-6">
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-semibold text-foreground">{formatPrice(price)}</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </p>
            <p className="mt-1.5 min-h-[20px] text-sm text-muted-foreground">
              {annual
                ? `Billed ${formatPrice(plan.annualPrice)} once a year · you save ${formatPrice(annualSavingsAmount(plan))} (${annualSavingsPercent(plan)}%)`
                : `Billed monthly · or ${formatPrice(plan.annualPrice)}/year`}
            </p>
          </div>

          <ul className="mt-6 flex-1 space-y-3">
            {plan.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-sm leading-6 text-foreground">
                <Check className="mt-1 h-4 w-4 shrink-0 text-silver-bright" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>

          <Link
            to={`${FEATURES.payments ? "/checkout" : "/get-started"}?plan=${plan.id}&billing=${billing}`}
            className={cn("mt-8 w-full", plan.highlighted ? "btn-primary" : "btn-secondary")}
          >
            {cta}
          </Link>
        </article>
      );
    })}
  </div>
);

const Cell = ({ v }: { v: string | boolean }) =>
  typeof v === "string" ? (
    <span className="text-sm text-foreground">{v}</span>
  ) : v ? (
    <>
      <Check className="mx-auto h-4 w-4 text-silver-bright md:mx-0" aria-hidden="true" />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <Minus className="mx-auto h-4 w-4 text-white/25 md:mx-0" aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </>
  );

export const ComparisonTable = () => (
  <div className="surface-card overflow-hidden rounded-[22px]">
    <table className="w-full table-fixed text-left">
      <caption className="sr-only">Plan comparison</caption>
      <thead>
        <tr className="border-b border-white/[0.07]">
          <th scope="col" className="w-[38%] p-3 text-sm font-medium text-muted-foreground sm:p-4 sm:px-6">
            What you get
          </th>
          {PLANS.map((p) => (
            <th key={p.id} scope="col" className="p-3 text-sm font-medium text-foreground sm:p-4 sm:px-6">
              {p.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {COMPARISON.map((row) => (
          <tr key={row.label} className="border-b border-white/[0.05] last:border-0">
            <th scope="row" className="p-3 text-sm font-normal text-muted-foreground sm:p-4 sm:px-6">
              {row.label}
            </th>
            <td className="p-3 sm:p-4 sm:px-6">
              <Cell v={row.essentials} />
            </td>
            <td className="p-3 sm:p-4 sm:px-6">
              <Cell v={row.plus} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const PricingNotes = () => (
  <ul className="mx-auto grid max-w-3xl gap-3 text-sm text-muted-foreground sm:grid-cols-3">
    <li className="surface-inset rounded-xl p-4">
      <p className="font-medium text-foreground">Free to look first</p>
      <p className="mt-1 leading-6">
        See a full <Link to="/example" className="underline underline-offset-4 hover:text-foreground">example analysis</Link> before you decide.
      </p>
    </li>
    <li className="surface-inset rounded-xl p-4">
      <p className="font-medium text-foreground">Cancel anytime</p>
      <p className="mt-1 leading-6">Cancel from your account. You keep access until the end of the period you paid for.</p>
    </li>
    <li className="surface-inset rounded-xl p-4">
      <p className="font-medium text-foreground">No hidden charges</p>
      <p className="mt-1 leading-6">
        Price shown is what you pay, before local taxes. See the{" "}
        <Link to="/refunds" className="underline underline-offset-4 hover:text-foreground">refund policy</Link>.
      </p>
    </li>
  </ul>
);

export const PricingBlock = ({ showTable = false }: { showTable?: boolean }) => {
  const [billing, setBilling] = useState<Billing>("monthly");
  return (
    <div>
      <div className="flex justify-center">
        <BillingToggle value={billing} onChange={setBilling} />
      </div>
      {!FEATURES.payments && (
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
          Launch pricing. We're opening access in small groups — joining the early-access list is free and doesn't need a
          card.
        </p>
      )}
      <div className="mx-auto mt-8 max-w-4xl">
        <PlanCards billing={billing} />
      </div>
      {showTable && (
        <div className="mx-auto mt-12 max-w-4xl">
          <h3 className="mb-4 font-display text-xl font-semibold text-foreground">Compare plans</h3>
          <ComparisonTable />
        </div>
      )}
      <div className="mt-10">
        <PricingNotes />
      </div>
    </div>
  );
};
