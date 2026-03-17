import { useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Lock, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const tierNames: Record<string, string> = {
  starter: "Starter",
  core: "Core",
  all_access: "All Access",
};

const tierPrices: Record<string, string> = {
  starter: "$19/mo",
  core: "$39/mo",
  all_access: "$79/mo",
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") || "core";
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [step, setStep] = useState<"auth" | "payment" | "success">("auth");
  const [isLogin, setIsLogin] = useState(true);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    // Mock auth - just proceed
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!isLogin) {
      toast({ title: "Account created", description: "You can now proceed to payment." });
    }
    setStep("payment");
    setLoading(false);
  };

  const handlePayment = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep("success");
    toast({ title: "Payment successful", description: "Welcome to the system." });
    setTimeout(() => navigate("/onboarding"), 2000);
    setLoading(false);
  };

  const steps = ["auth", "payment", "success"];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 gradient-mesh" />

      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-20 p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-full font-display text-sm font-semibold transition-all duration-500",
                  step === s
                    ? "bg-foreground text-background"
                    : steps.indexOf(step) > i
                    ? "bg-foreground/20 text-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {steps.indexOf(step) > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && (
                <div className={cn("w-12 h-px mx-1 transition-colors", steps.indexOf(step) > i ? "bg-foreground/30" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {step === "auth" && (
          <div className="glass-card-strong rounded-2xl p-8 opacity-0 animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-foreground mb-1 text-center">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
              {isLogin ? "Sign in to continue" : "One account per membership"}
            </p>

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-sm font-display text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3.5 bg-background/50 rounded-xl border text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-silver/30",
                    errors.email ? "border-destructive" : "border-border"
                  )}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-display text-muted-foreground mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3.5 bg-background/50 rounded-xl border text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-silver/30",
                    errors.password ? "border-destructive" : "border-border"
                  )}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-destructive text-xs mt-1.5">{errors.password}</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full btn-premium justify-center disabled:opacity-50">
                {loading ? "..." : isLogin ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted-foreground text-xs font-display">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toast({ title: "Coming soon", description: "Google sign-in will be available soon." })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background/50 text-foreground hover:bg-background/80 transition-colors font-display text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button
                onClick={() => toast({ title: "Coming soon", description: "Apple sign-in will be available soon." })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background/50 text-foreground hover:bg-background/80 transition-colors font-display text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </button>
            </div>

            <p className="text-muted-foreground text-sm text-center mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-foreground hover:text-silver-bright transition-colors font-medium">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
            <button
              onClick={() => setStep("payment")}
              className="w-full mt-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors font-display text-sm"
            >
              Skip — continue as guest
            </button>
          </div>
        )}

        {step === "payment" && (
          <div className="glass-card-strong rounded-2xl p-8 opacity-0 animate-fade-in">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-silver" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-6 text-center">Complete payment</h2>
            <div className="rounded-xl bg-background/30 border border-border p-4 mb-6 flex justify-between items-center">
              <span className="font-display text-muted-foreground">{tierNames[tier]} Plan</span>
              <span className="font-display font-bold text-foreground text-lg">{tierPrices[tier]}</span>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-display text-muted-foreground mb-2">Card number</label>
                <input type="text" className="w-full px-4 py-3.5 bg-background/50 rounded-xl border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-silver/30" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-display text-muted-foreground mb-2">Expiry</label>
                  <input type="text" className="w-full px-4 py-3.5 bg-background/50 rounded-xl border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-silver/30" placeholder="12/25" defaultValue="12/25" />
                </div>
                <div>
                  <label className="block text-sm font-display text-muted-foreground mb-2">CVC</label>
                  <input type="text" className="w-full px-4 py-3.5 bg-background/50 rounded-xl border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-silver/30" placeholder="123" defaultValue="123" />
                </div>
              </div>
            </div>
            <button onClick={handlePayment} disabled={loading} className="w-full btn-premium justify-center disabled:opacity-50 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {loading ? "Processing..." : `Pay ${tierPrices[tier]}`}
            </button>
            <p className="text-muted-foreground text-xs text-center mt-5">Mock payment for demo</p>
          </div>
        )}

        {step === "success" && (
          <div className="glass-card-strong rounded-2xl p-10 text-center ring-1 ring-status-success/20 opacity-0 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-status-success" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">You're in.</h2>
            <p className="text-muted-foreground mb-6">Redirecting to your hub...</p>
            <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mx-auto" />
          </div>
        )}

        <Link to="/" className="block text-center text-muted-foreground text-sm mt-8 hover:text-foreground transition-colors font-light">
          ← Back to start
        </Link>
      </div>
    </div>
  );
};

export default CheckoutPage;
