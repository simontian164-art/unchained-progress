import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Crown, Shield, Zap, Star, Users, RefreshCcw } from "lucide-react";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    period: "/mo",
    tagline: "The essentials",
    features: ["Skin Max basics", "Style Max essentials", "Body Max fundamentals", "Basic progress tracking"],
    cta: "Start Here",
  },
  {
    id: "core",
    name: "Core",
    price: "$39",
    period: "/mo",
    tagline: "Most popular",
    featured: true,
    savings: "Save 40%",
    features: [
      "Everything in Starter",
      "IQ Max system",
      "Presence Max training",
      "AI Face Analysis",
      "Style Simulator",
      "Community access",
    ],
    cta: "Get Core",
  },
  {
    id: "all_access",
    name: "All Access",
    price: "$79",
    period: "/mo",
    tagline: "Full transformation",
    features: [
      "Everything in Core",
      "Money Max program",
      "Photo Max AI",
      "Glow Up Coach",
      "Priority support",
      "Lifetime updates",
    ],
    cta: "Go All In",
  },
];

const MembershipPage = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string>("core");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />

      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-20 p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 max-w-5xl w-full pt-16 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-4">
            <Users className="w-3 h-3 text-gold" />
            <span className="text-[11px] text-muted-foreground">12,400+ members transforming</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-2 tracking-tight">
            Choose your <span className="text-gold">level</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-light max-w-xs mx-auto">
            Pick a plan. Cancel anytime.
          </p>
        </motion.div>

        {/* Money-back guarantee banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto max-w-md mb-8 px-4 py-3 rounded-xl border border-gold/20 bg-gold/5 flex items-center justify-center gap-3"
        >
          <Shield className="w-5 h-5 text-gold flex-shrink-0" />
          <span className="text-sm font-display font-medium text-foreground">
            30-day money-back guarantee — <span className="text-gold">no risk</span>
          </span>
        </motion.div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {tiers.map((tier, i) => {
            const isSelected = selectedTier === tier.id;
            return (
              <motion.button
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                onClick={() => setSelectedTier(tier.id)}
                className={cn(
                  "relative p-5 md:p-6 text-left transition-all duration-300 rounded-2xl",
                  isSelected
                    ? tier.featured
                      ? "glass-card-strong ring-2 ring-gold/50 glow-gold"
                      : "glass-card-strong ring-1 ring-foreground/20"
                    : "glass-card hover:ring-1 hover:ring-foreground/10",
                  tier.featured && "md:-mt-3"
                )}
              >
                {tier.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-display font-bold flex items-center gap-1 whitespace-nowrap"
                    style={{
                      background: "linear-gradient(135deg, hsl(42 80% 55%), hsl(35 85% 45%))",
                      color: "hsl(0 0% 4%)",
                    }}
                  >
                    <Crown className="w-3 h-3" />
                    RECOMMENDED
                  </span>
                )}
                {tier.savings && (
                  <span className="absolute top-5 right-5 px-2 py-0.5 rounded-md bg-status-success/15 text-status-success text-[10px] font-display font-bold">
                    {tier.savings}
                  </span>
                )}

                <p className="text-muted-foreground text-[10px] font-display tracking-widest mb-2 uppercase">
                  {tier.tagline}
                </p>
                <h3 className="text-lg font-display font-bold text-foreground mb-0.5">{tier.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-display font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground text-xs ml-1">{tier.period}</span>
                </div>

                <ul className="space-y-2.5 mb-5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                      <div
                        className={cn(
                          "w-4 h-4 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0",
                          isSelected ? "bg-gold/20" : "bg-muted"
                        )}
                      >
                        <Check className={cn("w-2.5 h-2.5", isSelected ? "text-gold" : "text-muted-foreground")} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div
                  className={cn(
                    "w-full py-2.5 rounded-xl text-center font-display font-semibold text-sm transition-all duration-300",
                    isSelected
                      ? tier.featured
                        ? "bg-gradient-to-r from-gold to-gold-dim text-background"
                        : "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tier.cta}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => navigate(`/preview?tier=${selectedTier}`)}
            className="btn-premium group inline-flex items-center gap-3 text-base md:text-lg"
          >
            Continue with {tiers.find((t) => t.id === selectedTier)?.name}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-muted-foreground text-xs mt-3 font-light">
            Preview what's inside before you pay
          </p>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10 pt-8 border-t border-border/30"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Shield className="w-3.5 h-3.5 text-gold" />
            30-day money back
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Zap className="w-3.5 h-3.5 text-gold" />
            Instant access
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <RefreshCcw className="w-3.5 h-3.5 text-gold" />
            Cancel anytime
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Star className="w-3.5 h-3.5 text-gold" />
            4.9★ from members
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MembershipPage;
