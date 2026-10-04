import { useState } from "react";
import { getSupabase } from "./supabaseShim";

/**
 * Passwordless sign-in (email one-time code), shown only when Supabase is configured.
 * Docs: https://supabase.com/docs/guides/auth/auth-email-passwordless
 * The Supabase email template must include {{ .Token }} for the 6-digit code.
 */
export const AccountGate = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    setBusy(true);
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return setError(error.message.includes("rate") ? "Wait a minute before asking for another code." : "Couldn't send the code. Check the address and try again.");
    setStep("code");
    setNotice(`We sent a 6-digit code to ${email}.`);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) return setError("Enter the 6-digit code from the email.");
    setBusy(true);
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) setError("That code didn't work. Check it, or send a new one.");
  };

  return (
    <section aria-labelledby="acct-h" className="mx-auto max-w-md py-6">
      <h1 id="acct-h" className="font-display text-3xl font-semibold text-foreground">Sign in to save your Digital You</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">Your photos are stored privately in your account, so they're there on any device. Only you can see them.</p>
      {step === "email" ? (
        <form onSubmit={send} className="mt-6 space-y-3" noValidate>
          <label htmlFor="acct-email" className="text-sm font-medium text-foreground">Email</label>
          <input id="acct-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-xl border border-white/[0.14] bg-white/[0.03] px-4 text-[17px] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40" />
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? "Sending…" : "Send code"}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-3" noValidate>
          {notice && <p className="text-sm text-muted-foreground" role="status">{notice}</p>}
          <label htmlFor="acct-code" className="text-sm font-medium text-foreground">6-digit code</label>
          <input id="acct-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="h-12 w-full rounded-xl border border-white/[0.14] bg-white/[0.03] px-4 text-center text-[22px] tracking-[0.4em] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40" />
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? "Checking…" : "Sign in"}</button>
          <button type="button" onClick={() => { setStep("email"); setCode(""); setError(null); }} className="hit w-full text-sm text-muted-foreground underline underline-offset-4">Use a different email</button>
        </form>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/[0.06] p-3 text-sm text-red-100">{error}</p>}
    </section>
  );
};
