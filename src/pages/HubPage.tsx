import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sparkles, Shirt, Dumbbell, Brain, Eye, DollarSign, LogOut, TrendingUp, Target, Trophy, ArrowRight, ScanFace, Star, Ruler, Shield } from "lucide-react";

const modules = [
  { id: "face", icon: ScanFace, label: "FACE ANALYZER", path: "/hub/face-analyzer", description: "AI symmetry & ratio analysis", gradient: "from-cyan-500/15 to-sky-500/5", progress: 0 },
  { id: "attract", icon: Star, label: "ATTRACTIVENESS", path: "/hub/attractiveness", description: "Feature scoring dashboard", gradient: "from-amber-500/15 to-yellow-500/5", progress: 0 },
  { id: "golden", icon: Ruler, label: "GOLDEN RATIO", path: "/hub/golden-ratio", description: "φ overlay & measurements", gradient: "from-yellow-600/15 to-amber-600/5", progress: 0 },
  { id: "jawline", icon: Shield, label: "JAWLINE ANALYZER", path: "/hub/jawline", description: "Jaw definition & exercises", gradient: "from-slate-500/15 to-zinc-500/5", progress: 0 },
  { id: "skin", icon: Sparkles, label: "SKIN MAX", path: "/hub/skin", description: "Skincare system & products", gradient: "from-rose-500/15 to-pink-500/5", progress: 0 },
  { id: "style", icon: Shirt, label: "STYLE MAX", path: "/hub/style", description: "Wardrobe & fit mastery", gradient: "from-blue-500/15 to-indigo-500/5", progress: 0 },
  { id: "body", icon: Dumbbell, label: "BODY MAX", path: "/hub/body", description: "Training & composition", gradient: "from-orange-500/15 to-amber-500/5", progress: 0 },
  { id: "iq", icon: Brain, label: "IQ MAX", path: "/hub/iq", description: "Focus & mental clarity", gradient: "from-violet-500/15 to-purple-500/5", progress: 0 },
  { id: "presence", icon: Eye, label: "PRESENCE MAX", path: "/hub/presence", description: "Social presence & voice", gradient: "from-emerald-500/15 to-green-500/5", progress: 0 },
  { id: "money", icon: DollarSign, label: "MONEY MAX", path: "/hub/money", description: "Income & skill leverage", gradient: "from-yellow-500/15 to-amber-500/5", progress: 0 },
];

const stats = [
  { label: "Modules", value: "10", icon: Target },
  { label: "Active Streak", value: "—", icon: TrendingUp },
  { label: "Level", value: "1", icon: Trophy },
];

const HubPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Looksmaxer</h1>
            <p className="text-muted-foreground text-xs font-display">ALL ACCESS MEMBER</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-2 glass-card"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-display hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 container py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-10">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass-card rounded-xl p-5 text-center opacity-0 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <Icon className="w-5 h-5 text-silver-dim mx-auto mb-2" />
                  <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-display mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">Your modules</h2>
            <p className="text-muted-foreground font-light">All content unlocked. Click to access.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((module, i) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => navigate(module.path)}
                  className={cn(
                    "group relative p-6 text-left rounded-2xl transition-all duration-500 hover-lift glass-card opacity-0 animate-fade-in",
                    "hover:ring-1 hover:ring-silver/15"
                  )}
                  style={{ animationDelay: `${0.4 + i * 0.08}s` }}
                >
                  <div className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    module.gradient
                  )} />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl glass-card-strong flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-silver group-hover:text-foreground transition-colors" />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-1 text-sm tracking-wide group-hover:text-foreground transition-colors">
                      {module.label}
                    </h3>
                    <p className="text-muted-foreground text-sm font-light">{module.description}</p>
                    <div className="flex items-center gap-1 mt-4 text-silver-dim group-hover:text-foreground transition-colors text-xs font-display">
                      Enter
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HubPage;
