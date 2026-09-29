/**
 * Checkout + account service layer.
 *
 * The UI in src/pages/checkout calls ONLY these functions. Today there is no
 * auth provider or Stripe connected, so when FEATURES.accounts / FEATURES.payments
 * are false these run in DEMO mode: nothing is created and nothing is charged,
 * and the UI shows a clear "demo" banner.
 *
 * To go live, replace the bodies marked `TODO(backend)` (see docs/LAUNCH_CHECKLIST.md,
 * prompts B and C) and flip the flags in src/config/site.ts.
 */
import { FEATURES } from "@/config/site";
import type { Billing, PlanId } from "@/data/pricing";

export const isDemoCheckout = !FEATURES.accounts || !FEATURES.payments;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type AuthResult = { ok: true; email: string } | { ok: false; error: string };

export async function createAccount(email: string, _password: string): Promise<AuthResult> {
  if (isDemoCheckout) {
    await wait(600);
    return { ok: true, email };
  }
  // TODO(backend): supabase.auth.signUp({ email, password }) — map errors to friendly messages,
  // e.g. "An account with this email already exists. Sign in instead."
  throw new Error("createAccount is not connected");
}

export async function signIn(email: string, _password: string): Promise<AuthResult> {
  if (isDemoCheckout) {
    await wait(600);
    return { ok: true, email };
  }
  // TODO(backend): supabase.auth.signInWithPassword({ email, password })
  throw new Error("signIn is not connected");
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (isDemoCheckout) return { ok: false, error: "Google sign-in isn't connected in this demo. Use email instead." };
  // TODO(backend): supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/checkout` } })
  throw new Error("signInWithGoogle is not connected");
}

export type CheckoutResult = { ok: true; redirectUrl: string } | { ok: false; error: string };

/**
 * Starts payment. In production this should create a Stripe Checkout Session
 * (server-side, e.g. a Supabase edge function) and return its URL:
 *   success_url = <site>/checkout/success?session_id={CHECKOUT_SESSION_ID}
 *   cancel_url  = <site>/pricing?checkout=cancelled
 */
export async function startCheckout(plan: PlanId, billing: Billing): Promise<CheckoutResult> {
  if (isDemoCheckout) {
    await wait(900);
    return { ok: true, redirectUrl: `/checkout/success?plan=${plan}&billing=${billing}&demo=1` };
  }
  // TODO(backend): call edge function "create-checkout-session" with { plan, billing } and return { url }.
  throw new Error("startCheckout is not connected");
}
