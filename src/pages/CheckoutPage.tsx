import { useState } from "react";
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

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [step, setStep] = useState<"auth" | "payment" | "success">("auth");

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
    setTimeout(() => navigate("/hub"), 2000);
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

            <p className="text-muted-foreground text-sm text-center mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-foreground hover:text-silver-bright transition-colors font-medium">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
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
