import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Crown, Shield, Zap, Star, Users } from "lucide-react";

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
    savings: "Best value",
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

const guarantees = [
  { icon: Shield, text: "Cancel anytime, no questions" },
  { icon: Zap, text: "Instant access to all modules" },
  { icon: Star, text: "30-day money back guarantee" },
];

const MembershipPage = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string>("core");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />

      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-20 p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 max-w-5xl w-full py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Join 12,400+ members already transforming</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
            Choose your <span className="text-gold">level</span>
          </h1>
          <p className="text-muted-foreground text-lg font-light max-w-md mx-auto">
            Start today. See results in 30 days. Or get your money back.
          </p>
        </motion.div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {tiers.map((tier, i) => {
            const isSelected = selectedTier === tier.id;
            return (
              <motion.button
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                onClick={() => setSelectedTier(tier.id)}
                className={cn(
                  "relative p-7 text-left transition-all duration-500 rounded-2xl hover-lift",
                  isSelected
                    ? tier.featured 
                      ? "glass-card-strong ring-1 ring-gold/40 glow-gold" 
                      : "glass-card-strong ring-1 ring-silver/30"
                    : "glass-card hover:ring-1 hover:ring-silver/10",
                  tier.featured && "md:-mt-4 md:mb-0"
                )}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-display font-semibold flex items-center gap-1.5 whitespace-nowrap" style={{ background: "linear-gradient(135deg, hsl(42 80% 55%), hsl(35 85% 45%))", color: "hsl(0 0% 4%)" }}>
                    <Crown className="w-3 h-3" />
                    Recommended
                  </span>
                )}
                {tier.savings && (
                  <span className="absolute top-6 right-6 px-2.5 py-1 rounded-md bg-status-success/10 text-status-success text-[10px] font-display font-semibold tracking-wide">
                    {tier.savings}
                  </span>
                )}

                <p className="text-muted-foreground text-xs font-display tracking-wide mb-3 uppercase">{tier.tagline}</p>
                <h3 className="text-xl font-display font-bold text-foreground mb-1">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{tier.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected ? "bg-foreground/10" : "bg-muted"
                      )}>
                        <Check className={cn("w-3 h-3", isSelected ? "text-foreground" : "text-muted-foreground")} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className={cn(
                  "w-full py-3 rounded-xl text-center font-display font-semibold text-sm transition-all duration-300",
                  isSelected
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}>
                  {tier.cta}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <button
            onClick={() => navigate(`/preview?tier=${selectedTier}`)}
            className="btn-premium group inline-flex items-center gap-3 text-lg"
          >
            Continue with {tiers.find(t => t.id === selectedTier)?.name}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-muted-foreground text-sm mt-4 font-light">
            Preview what's inside before you pay
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {guarantees.map((g) => (
            <div key={g.text} className="flex items-center gap-2 text-muted-foreground text-sm">
              <g.icon className="w-4 h-4 text-gold-dim" />
              {g.text}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MembershipPage;
