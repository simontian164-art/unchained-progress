/**
 * Central site configuration.
 *
 * Everything company-specific lives here so it can be changed in one place.
 * Values wrapped in [BRACKETS] are placeholders that must be replaced before
 * the site takes real customers (see LAUNCH_CHECKLIST in README / PR notes).
 */

export const SITE = {
  /** Product name shown in the nav, footer, titles and legal pages. */
  name: "GlowMax",
  /** One-line description used for meta tags. */
  tagline: "A 90-day plan for your hair, skin, grooming and style",
  description:
    "Five minutes of photos and questions. Get the haircut to ask for, a three-product skin routine and a short daily plan, built for you.",
  /** Canonical production URL (no trailing slash). Update when you add a custom domain. */
  url: "https://unchained-progress.lovable.app",

  /** Support contact shown in the footer, contact page and legal pages. */
  supportEmail: "[support@yourdomain.com]",
  privacyEmail: "[privacy@yourdomain.com]",

  /** Legal entity details — required for Terms / Privacy. */
  legal: {
    companyName: "[Legal company name]",
    companyAddress: "[Registered business address]",
    jurisdiction: "[Governing law jurisdiction, e.g. Ontario, Canada]",
    lastUpdated: "[Month DD, YYYY]",
  },
} as const;

/**
 * Feature flags that reflect what the backend can actually do today.
 *
 * The codebase currently has NO authentication, database or payment provider
 * (the old checkout was a front-end mock). Keep these false until the real
 * systems are connected, so the site never promises something it can't do.
 */
export const FEATURES = {
  /** Real user accounts exist (shows "Sign in" in the nav when true). */
  accounts: false,
  /** Real payments exist (switches Get Started from waitlist to checkout when true). */
  payments: false,
  /**
   * Let early-access sign-ups use the app for free right away. The analysis runs on the
   * visitor's device, so it costs nothing to serve. Turn off once payments are live.
   */
  freeEarlyAccess: true,
} as const;

/**
 * Waitlist delivery.
 *
 * If VITE_WAITLIST_ENDPOINT is set (e.g. a Formspree / Google Apps Script /
 * Supabase edge function URL that accepts a JSON POST), sign-ups are sent there.
 * If not set, the form falls back to opening a pre-filled email to supportEmail.
 */
export const WAITLIST_ENDPOINT: string | undefined = import.meta.env.VITE_WAITLIST_ENDPOINT || undefined;

export const isPlaceholder = (value: string) => value.startsWith("[") && value.endsWith("]");

/**
 * New Year campaign. When on, the landing page plays a ≤2s intro once per session and the hero
 * becomes "The 90-Day Protocol / Begin Day 01". The year is computed: from October on it's next year.
 * Turn `newYear` off in February.
 */
export const CAMPAIGN = { newYear: true } as const;
export const campaignYear = (d = new Date()) => (d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear());
