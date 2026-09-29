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
    summary: "A full analysis and a plan you update once a month.",
    monthlyPrice: 19,
    annualPrice: 190,
    highlights: [
      "1 full appearance analysis per month",
      "Face, skin, hair & grooming and style breakdown",
      "Personalized action plan, updated after each analysis",
      "Monthly progress check-ins with side-by-side photos",
      "Skin, hair & grooming and style guides",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    summary: "Weekly re-analysis, physique, and deeper style tools.",
    monthlyPrice: 39,
    annualPrice: 390,
    highlighted: true,
    highlights: [
      "Up to 4 full analyses per month (one a week)",
      "Everything in Essentials, plus physique analysis",
      "Plan updates after every re-analysis",
      "Visual style & hairstyle simulator",
      "Weekly check-ins with trend charts",
      "Full guide library, including body, photo and fragrance",
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
  { label: "Full appearance analysis", essentials: "1 per month", plus: "Up to 4 per month" },
  { label: "Face, skin, hair & grooming, style", essentials: true, plus: true },
  { label: "Physique analysis", essentials: false, plus: true },
  { label: "Personalized action plan", essentials: true, plus: true },
  { label: "Plan updates", essentials: "Monthly", plus: "After every analysis" },
  { label: "Hairstyle & style suggestions", essentials: "Written", plus: "Written + visual simulator" },
  { label: "Progress tracking", essentials: "Monthly check-ins", plus: "Weekly check-ins + trends" },
  { label: "Guide library", essentials: "Skin, hair, grooming, style", plus: "All guides" },
  { label: "Email support", essentials: true, plus: true },
];
