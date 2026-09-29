import { SITE, WAITLIST_ENDPOINT } from "@/config/site";

export interface WaitlistEntry {
  email: string;
  firstName?: string;
  plan: string;
  billing: string;
  goal?: string;
  consent: boolean;
}

export type WaitlistResult = { ok: true; via: "endpoint" | "email" } | { ok: false; error: string };

/**
 * Sends a waitlist sign-up.
 * - With VITE_WAITLIST_ENDPOINT set: POSTs JSON to it.
 * - Without it: opens the user's email app with a pre-filled message to the support address,
 *   so no sign-up is silently lost while the backend is being set up.
 */
export async function submitWaitlist(entry: WaitlistEntry): Promise<WaitlistResult> {
  const payload = { ...entry, source: "website", submittedAt: new Date().toISOString() };

  if (WAITLIST_ENDPOINT) {
    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return { ok: false, error: "We couldn't save your spot. Please try again in a moment." };
      return { ok: true, via: "endpoint" };
    } catch {
      return { ok: false, error: "Network error — check your connection and try again." };
    }
  }

  const subject = encodeURIComponent(`Early access: ${entry.plan} (${entry.billing})`);
  const body = encodeURIComponent(
    [
      "Please add me to the early-access list.",
      "",
      `Email: ${entry.email}`,
      entry.firstName ? `Name: ${entry.firstName}` : "",
      `Plan: ${entry.plan} (${entry.billing})`,
      entry.goal ? `Goal: ${entry.goal}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  window.location.href = `mailto:${SITE.supportEmail}?subject=${subject}&body=${body}`;
  return { ok: true, via: "email" };
}
