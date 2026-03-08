import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Lock, Sparkles, Shirt, Dumbbell, Brain, Eye, DollarSign, ArrowRight, ArrowLeft, Shield, Zap, Target } from "lucide-react";

const modules = [
  { id: "skin", icon: Sparkles, label: "SKIN MAX", description: "Product lists, routines, what actually works", gradient: "from-rose-500/10 to-pink-500/5" },
  { id: "style", icon: Shirt, label: "STYLE MAX", description: "Clothing guides, budget tiers, where to buy", gradient: "from-blue-500/10 to-indigo-500/5" },
  { id: "body", icon: Dumbbell, label: "BODY MAX", description: "Training structure, posture, composition", gradient: "from-orange-500/10 to-amber-500/5" },
  { id: "iq", icon: Brain, label: "IQ MAX", description: "Focus systems, learning methods, clarity", gradient: "from-violet-500/10 to-purple-500/5" },
  { id: "presence", icon: Eye, label: "PRESENCE MAX", description: "Posture, eye contact, movement, voice", gradient: "from-emerald-500/10 to-green-500/5" },
  { id: "money", icon: DollarSign, label: "MONEY MAX", description: "Skills, habits, long-term leverage", gradient: "from-yellow-500/10 to-amber-500/5" },
];

const principles = [
  { icon: Target, text: "Focused on controllable factors only. No genetics talk." },
  { icon: Zap, text: "Structured progression. Not random tips." },
  { icon: Shield, text: "No ratings. No motivation. Just what works." },
];

const PreviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") || "core";

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <button
        onClick={() => navigate("/membership")}
        className="fixed top-6 left-6 z-20 p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 container py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 tracking-tight opacity-0 animate-fade-in">
            This is a <span className="text-silver">system</span>,
            <br />not a course.
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            {principles.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="glass-card rounded-xl p-5 flex-1 text-left opacity-0 animate-fade-in"
                  style={{ animationDelay: `${0.3 + i * 0.15}s` }}
                >
                  <Icon className="w-5 h-5 text-silver mb-3" />
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-xl font-display font-bold text-foreground text-center mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            What's inside
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((module, i) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="relative rounded-2xl overflow-hidden opacity-0 animate-fade-in"
                  style={{ animationDelay: `${0.7 + i * 0.1}s` }}
                >
                  <div className={cn("p-6 glass-card rounded-2xl h-full bg-gradient-to-br", module.gradient)}>
                    <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40 rounded-2xl flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full glass-card-strong flex items-center justify-center">
                        <Lock className="w-5 h-5 text-silver-dim" />
                      </div>
                    </div>
                    <div className="opacity-60">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-5 h-5 text-silver" />
                        <h3 className="font-display font-bold text-foreground text-sm tracking-wide">{module.label}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{module.description}</p>
                      <div className="mt-5 space-y-2">
                        <div className="h-2.5 bg-muted/30 rounded-full w-3/4" />
                        <div className="h-2.5 bg-muted/30 rounded-full w-1/2" />
                        <div className="h-2.5 bg-muted/30 rounded-full w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center opacity-0 animate-fade-in" style={{ animationDelay: "1.2s" }}>
          <button
            onClick={() => navigate(`/checkout?tier=${tier}`)}
            className="btn-premium group inline-flex items-center gap-3 text-lg"
          >
            Unlock Full System
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-muted-foreground text-sm mt-5 font-light">
            Secure checkout · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
