/**
 * Pricing — single source of truth for the pricing section, pricing page and
 * get-started page. When Stripe is connected, add the Stripe price IDs here.
 *
 * Annual pricing = 10 × monthly price ("2 months free"). The discount
 * percentage and monthly equivalent are CALCULATED below, never hand-typed,
 * so the numbers shown on the site are always consistent.
 */

export type PlanId = "essentials" | "plus";
export type Billing = "monthly" | "annual";

export interface Plan {
  id: PlanId;
  name: string;
  summary: string;
  monthlyPrice: number;
  annualPrice: number;
  highlighted?: boolean;
  /** Short bullet list for plan cards. */
  highlights: string[];
  stripePriceIds?: { monthly?: string; annual?: string };
}

export const PLANS: Plan[] = [
  {
    id: "essentials",
    name: "Essentials",
    summary: "The full analysis and plan, with a new photo analysis each month.",
    monthlyPrice: 19,
    annualPrice: 190,
    highlights: [
      "Face, hair & hairline, facial hair, skin, eyes, smile and style",
      "Haircut options + a “Show my barber” card",
      "Personalized routine and a paced action plan",
      "“Shop my plan” with local and online search",
      "New photo analysis once a month; check-ins every 2 weeks",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    summary: "Everything in Essentials, re-analysis every 2 weeks, and body & posture.",
    monthlyPrice: 39,
    annualPrice: 390,
    highlighted: true,
    highlights: [
      "Everything in Essentials",
      "New photo analysis every 2 weeks, with your plan rebuilt each time",
      "Body, posture and sleep plan",
      "Hairline and crown photo tracking",
    ],
  },
];

export const annualMonthlyEquivalent = (plan: Plan) => plan.annualPrice / 12;

/** Percentage saved on annual vs. paying monthly for 12 months, rounded down. */
export const annualSavingsPercent = (plan: Plan) =>
  Math.floor((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100);

export const annualSavingsAmount = (plan: Plan) => plan.monthlyPrice * 12 - plan.annualPrice;

export const formatPrice = (n: number) =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

export const getPlan = (id: string | null | undefined) =>
  PLANS.find((p) => p.id === id) ?? PLANS[1];

/** Row-by-row comparison table. `true` = included, `false` = not included, string = specific value. */
export const COMPARISON: { label: string; essentials: string | boolean; plus: string | boolean }[] = [
  { label: "Face, hair & hairline, facial hair, skin, eyes, smile, style", essentials: true, plus: true },
  { label: "Haircut options + “Show my barber” card", essentials: true, plus: true },
  { label: "Routine, paced plan and “Shop my plan”", essentials: true, plus: true },
  { label: "New photo analysis", essentials: "Monthly", plus: "Every 2 weeks" },
  { label: "Progress check-ins", essentials: "Every 2 weeks", plus: "Every 2 weeks" },
  { label: "Body, posture & sleep plan", essentials: false, plus: true },
  { label: "Hairline & crown photo tracking", essentials: false, plus: true },
  { label: "Email support", essentials: true, plus: true },
];
