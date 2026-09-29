# Launch checklist

Items to finish before the site takes real customers. Everything
company-specific is in **`src/config/site.ts`**. Prices and plan limits are in
**`src/data/pricing.ts`**.

## 1. Placeholders to fill in

| Where | What |
|---|---|
| `src/config/site.ts` → `supportEmail`, `privacyEmail` | Real inboxes you monitor |
| `src/config/site.ts` → `legal.companyName`, `companyAddress`, `jurisdiction`, `lastUpdated` | Legal entity details. The yellow "Draft" banner on the legal pages disappears once `companyName` is filled in |
| `src/config/site.ts` → `name` | Final product name (currently "GlowMax", taken from the existing app). Also update `index.html` and `public/og-image.png` |
| `/privacy` | Every highlighted `[…]`: auth provider, analytics/cookies, photo storage provider + region, retention days, deletion SLA, processors list, regional rights, minimum age |
| `/terms` | Minimum age, price-change notice period, liability cap (**needs legal review**) |
| `/refunds` | Choose one refund policy (e.g. 14-day refund on first payment) and the annual-plan rule |
| `/contact` | Reply-time commitment |

Have a lawyer review Privacy + Terms. Face images and facial measurements can
count as biometric/sensitive data (PIPEDA / Quebec Law 25, GDPR, Illinois BIPA,
Texas CUBI).

## 2. Claims on the site you must keep true

- "Face scan runs on your device / scan photos aren't uploaded to our servers."
  True today (TensorFlow.js runs in the browser, no uploads anywhere in the
  code). **If you add server-side photo storage or an external AI API, update
  the landing privacy section, the FAQ and `/privacy` first.**
- "No attractiveness scores / no rankings." The public site says this, but the
  **member area (`/hub`) still has attractiveness scores, grades, a "Looksmax
  score" and a leaderboard.** Remove or rework those screens before launch.
- Plan limits (1 vs 4 analyses/month, physique on Plus only, check-in cadence)
  must be enforced by the backend once it exists.
- "Cancel anytime, access until end of period" means using Stripe's
  `cancel_at_period_end` behavior.

## 3. Lovable settings

- **Hide the "Edit with Lovable" badge.** It's added by Lovable hosting, not the
  code: Project settings → hide badge (may require a paid Lovable plan).
- Optional: connect a custom domain, then update `SITE.url` and the URLs in
  `index.html`.

## 4. Backend. Paste these into Lovable one at a time

**A. Waitlist storage (do this first — right now sign-ups fall back to opening an email)**
> Enable Lovable Cloud. Create a `waitlist` table (id, email unique, first_name, plan, billing, goal, consent boolean, created_at) with RLS that allows anonymous INSERT only (no select). Update `src/lib/waitlist.ts` so `submitWaitlist` inserts into this table instead of using the mailto fallback, and treats a duplicate email as success. Don't change any UI.

**B. Accounts**
> Add email + password and Google sign-in with Lovable Cloud auth. The sign-up / sign-in UI already exists in `src/pages/checkout/CheckoutPage.tsx` — do not redesign it; implement `createAccount`, `signIn` and `signInWithGoogle` in `src/lib/checkout.ts` (the `TODO(backend)` blocks). Protect every `/hub` route: signed-out users go to `/checkout?mode=signin`. Set `FEATURES.accounts = true` in `src/config/site.ts`.

**C. Payments**
> Connect Stripe. The checkout UI already exists (`/checkout`, `/checkout/success`, and the cancelled banner on `/pricing?checkout=cancelled`) — keep it and implement `startCheckout` in `src/lib/checkout.ts` via an edge function that creates a Stripe Checkout Session. Create products/prices that exactly match `src/data/pricing.ts` (Essentials $19/mo or $190/yr, Plus $39/mo or $390/yr) and store the price IDs in `stripePriceIds`. Use success_url `/checkout/success?session_id={CHECKOUT_SESSION_ID}` (verify the session before showing it) and cancel_url `/pricing?checkout=cancelled`. Add a webhook that stores subscription status per user, gate `/hub` on an active subscription, and add a "Manage billing" link using the Stripe customer portal with cancel at period end. Then set `FEATURES.payments = true`.

**D. Real analysis**
> The analyzer pages in `src/pages` (Jawline, Cheekbone, Eye, Nose, GoldenRatio, Attractiveness, LooksmaxScore, PhotoMax, BeardStyle) return hard-coded or random scores. Replace them with one analysis flow that produces the structure in `src/data/exampleAnalysis.ts` (strengths, focus areas with observation/recommendation/steps/priority, roadmap), and remove all attractiveness scores, grades and leaderboards.
