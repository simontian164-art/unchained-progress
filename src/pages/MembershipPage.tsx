import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Check, ArrowRight, ArrowLeft, Crown } from "lucide-react";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    period: "/month",
    features: ["Skin Max basics", "Style Max essentials", "Body Max fundamentals"],
  },
  {
    id: "core",
    name: "Core",
    price: "$39",
    period: "/month",
    featured: true,
    features: ["Everything in Starter", "IQ Max system", "Presence Max training", "Community access"],
  },
  {
    id: "all_access",
    name: "All Access",
    price: "$79",
    period: "/month",
    features: ["Everything in Core", "Money Max program", "Priority support", "Lifetime updates"],
  },
];

const MembershipPage = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string>("core");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 gradient-mesh" />

      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 max-w-4xl w-full">
        <div className="text-center mb-14 opacity-0 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
            Select your level
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            No commitments. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {tiers.map((tier, i) => {
            const isSelected = selectedTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={cn(
                  "relative p-7 text-left transition-all duration-500 rounded-2xl hover-lift opacity-0 animate-fade-in",
                  isSelected ? "glass-card-strong ring-1 ring-silver/30" : "glass-card hover:ring-1 hover:ring-silver/10",
                  tier.featured && "md:-mt-3 md:pb-10"
                )}
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-foreground text-background text-xs font-display font-semibold flex items-center gap-1.5">
                    <Crown className="w-3 h-3" />
                    Recommended
                  </span>
                )}
                <h3 className="text-xl font-display font-bold text-foreground mb-1">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{tier.period}</span>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center transition-colors", isSelected ? "bg-foreground/10" : "bg-muted")}>
                        <Check className={cn("w-3 h-3", isSelected ? "text-foreground" : "text-muted-foreground")} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className={cn(
                  "absolute top-6 right-6 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                  isSelected ? "border-foreground bg-foreground" : "border-muted-foreground/30"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-background" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center opacity-0 animate-fade-in" style={{ animationDelay: "0.7s" }}>
          <button
            onClick={() => navigate(`/preview?tier=${selectedTier}`)}
            className="btn-premium group inline-flex items-center gap-3"
          >
            Continue
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-muted-foreground text-sm mt-5 font-light">
            You'll see what's included before payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
