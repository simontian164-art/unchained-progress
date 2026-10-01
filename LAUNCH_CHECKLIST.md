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
- "No attractiveness scores / no rankings." True in the member app (`/app`), enforced by tests. The old `/hub`
  pages that had scores and a leaderboard are unrouted and deleted in the code; delete them on GitHub too
  (`docs/DELETE_ON_GITHUB.txt`).
- **Plan limits are not enforced today: the app behaves the same for Essentials and Plus.**
  Either enforce them in the backend or change the offer before charging (see `docs/NEXT_PASS_AUDIT.md`, section 5).
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
> Add email + password and Google sign-in with Lovable Cloud auth. The sign-up / sign-in UI already exists in `src/pages/checkout/CheckoutPage.tsx` — do not redesign it; implement `createAccount`, `signIn` and `signInWithGoogle` in `src/lib/checkout.ts` (the `TODO(backend)` blocks). Protect every `/app` route: signed-out users go to `/checkout?mode=signin`. Set `FEATURES.accounts = true` in `src/config/site.ts`.

**C. Payments**
> Connect Stripe. The checkout UI already exists (`/checkout`, `/checkout/success`, and the cancelled banner on `/pricing?checkout=cancelled`) — keep it and implement `startCheckout` in `src/lib/checkout.ts` via an edge function that creates a Stripe Checkout Session. Create products/prices that exactly match `src/data/pricing.ts` (Essentials $19/mo or $190/yr, Plus $39/mo or $390/yr) and store the price IDs in `stripePriceIds`. Use success_url `/checkout/success?session_id={CHECKOUT_SESSION_ID}` (verify the session before showing it) and cancel_url `/pricing?checkout=cancelled`. Add a webhook that stores subscription status per user, gate `/app` on an active subscription, and add a "Manage billing" link using the Stripe customer portal with cancel at period end. Then set `FEATURES.payments = true`.

**D. Sync the member app to accounts**
> The member app in `src/app` works fully on-device and saves to localStorage via `src/app/store.tsx`. Once accounts exist, add a `user_app_state` table (user_id, state jsonb, updated_at) with RLS so users only read/write their own row, load it on sign-in, and save on change. Store photos in a private storage bucket instead of inside the JSON. Gate `/app` on an active subscription. Update the privacy page before shipping this, because photos would then leave the device.

**E. Remove the old member area** (already deleted in the code handoff; the list is in `docs/DELETE_ON_GITHUB.txt` because a ZIP upload can't delete files)
> Delete the unused files from the previous version: `src/pages/HubPage.tsx`, `src/components/HubLayout.tsx`, `HubSidebar.tsx`, `BottomNav.tsx`, `FaceCapture.tsx`, `FaceAnalysisOverlay.tsx`, the analyzer pages in `src/pages` (Attractiveness, LooksmaxScore, GoldenRatio, Jawline, Cheekbone, Eye, Nose, FaceHarmony, BeardStyle, Hairline, FaceMax, FaceAnalyzer, GlowUp, GlowUpCoach, Gamification, TransformationTimeline, Intro, OnboardingFlow), everything in `src/pages/modules`, and `src/contexts/UserProfileContext.tsx`. None of them are routed anymore.

**F. Product data (optional, later)**
> If you want real prices and stock in "Shop my plan", connect a retailer or affiliate product API and a places API (e.g. Google Places) server-side. Show "last updated" times, disclose affiliate links, and keep the current "estimate / not verified" labels wherever live data is missing. Never show distances, hours or stock without a live source.
