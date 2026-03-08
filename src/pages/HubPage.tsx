import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sparkles, Shirt, Dumbbell, Brain, Eye, DollarSign, LogOut,
  TrendingUp, Target, Trophy, ArrowRight, ScanFace, Star, Ruler,
  Shield, Zap, ChevronRight, Diamond,
} from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import DailyTracker from "@/components/DailyTracker";

const modules = [
  { id: "face", icon: ScanFace, label: "FACE ANALYZER", path: "/hub/face-analyzer", description: "AI symmetry & ratio analysis", gradient: "from-cyan-500/15 to-sky-500/5", progress: 0 },
  { id: "attract", icon: Star, label: "ATTRACTIVENESS", path: "/hub/attractiveness", description: "Feature scoring dashboard", gradient: "from-amber-500/15 to-yellow-500/5", progress: 0 },
  { id: "golden", icon: Ruler, label: "GOLDEN RATIO", path: "/hub/golden-ratio", description: "φ overlay & measurements", gradient: "from-yellow-600/15 to-amber-600/5", progress: 0 },
  { id: "jawline", icon: Shield, label: "JAWLINE ANALYZER", path: "/hub/jawline", description: "Jaw definition & exercises", gradient: "from-slate-500/15 to-zinc-500/5", progress: 0 },
  { id: "cheekbone", icon: Diamond, label: "CHEEKBONE", path: "/hub/cheekbone", description: "Prominence & definition meter", gradient: "from-pink-500/15 to-rose-500/5", progress: 0 },
  { id: "skin", icon: Sparkles, label: "SKIN MAX", path: "/hub/skin", description: "Skincare system & products", gradient: "from-rose-500/15 to-pink-500/5", progress: 65 },
  { id: "style", icon: Shirt, label: "STYLE MAX", path: "/hub/style", description: "Wardrobe & fit mastery", gradient: "from-blue-500/15 to-indigo-500/5", progress: 40 },
  { id: "body", icon: Dumbbell, label: "BODY MAX", path: "/hub/body", description: "Training & composition", gradient: "from-orange-500/15 to-amber-500/5", progress: 72 },
  { id: "iq", icon: Brain, label: "IQ MAX", path: "/hub/iq", description: "Focus & mental clarity", gradient: "from-violet-500/15 to-purple-500/5", progress: 30 },
  { id: "presence", icon: Eye, label: "PRESENCE MAX", path: "/hub/presence", description: "Social presence & voice", gradient: "from-emerald-500/15 to-green-500/5", progress: 55 },
  { id: "money", icon: DollarSign, label: "MONEY MAX", path: "/hub/money", description: "Income & skill leverage", gradient: "from-yellow-500/15 to-amber-500/5", progress: 20 },
];

const overallScore = 58;
const weeklyXP = 340;
const streak = 7;

const HubPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "analyzers" | "modules">("all");

  const filteredModules = selectedCategory === "analyzers"
    ? modules.filter((m) => ["face", "attract", "golden", "jawline"].includes(m.id))
    : selectedCategory === "modules"
    ? modules.filter((m) => !["face", "attract", "golden", "jawline"].includes(m.id))
    : modules;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Looksmaxer</h1>
            <p className="text-muted-foreground text-xs font-display">ALL ACCESS MEMBER</p>
          </div>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-2 glass-card">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-display hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 container py-8 md:py-10">
        <div className="max-w-6xl mx-auto">

          {/* Top Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Overall Score - large */}
            <div className="col-span-2 lg:col-span-1 glass-card-strong rounded-2xl p-6 shine-line flex flex-col items-center justify-center opacity-0 animate-fade-in">
              <ProgressRing value={overallScore} size={110} strokeWidth={5} sublabel="/ 100" />
              <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">OVERALL SCORE</h3>
            </div>

            {/* Quick stat cards */}
            {[
              { label: "Weekly XP", value: weeklyXP.toString(), icon: Zap, sub: "+120 this week", color: "text-status-warning" },
              { label: "Day Streak", value: streak.toString(), icon: TrendingUp, sub: "Personal best: 14", color: "text-status-success" },
              { label: "Modules Active", value: "10", icon: Target, sub: "All unlocked", color: "text-silver" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <stat.icon className={cn("w-5 h-5 mb-3", stat.color)} />
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs font-display text-muted-foreground mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-1">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Modules */}
            <div className="lg:col-span-2 space-y-5">
              {/* Filter tabs */}
              <div className="flex items-center gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                {(["all", "analyzers", "modules"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wider transition-all",
                      selectedCategory === cat
                        ? "glass-card-strong text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat === "all" ? "All" : cat === "analyzers" ? "Analyzers" : "Modules"}
                  </button>
                ))}
              </div>

              {/* Module grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredModules.map((module, i) => {
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.id}
                      onClick={() => navigate(module.path)}
                      className={cn(
                        "group relative p-5 text-left rounded-2xl transition-all duration-500 hover-lift glass-card opacity-0 animate-fade-in",
                        "hover:ring-1 hover:ring-silver/15"
                      )}
                      style={{ animationDelay: `${0.4 + i * 0.06}s` }}
                    >
                      <div className={cn(
                        "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        module.gradient
                      )} />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl glass-card-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-5 h-5 text-silver group-hover:text-foreground transition-colors" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground/60 transition-all group-hover:translate-x-0.5" />
                        </div>
                        <h3 className="font-display font-bold text-foreground mb-0.5 text-xs tracking-wide">
                          {module.label}
                        </h3>
                        <p className="text-muted-foreground text-xs font-light mb-3">{module.description}</p>

                        {/* Progress bar */}
                        {module.progress > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${module.progress}%`,
                                  background: module.progress >= 70
                                    ? "hsl(142 50% 45%)"
                                    : module.progress >= 40
                                    ? "hsl(35 60% 50%)"
                                    : "hsl(0 0% 50%)",
                                  transition: "width 1s ease-out",
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-display text-muted-foreground">{module.progress}%</span>
                          </div>
                        )}
                        {module.progress === 0 && (
                          <span className="text-[10px] font-display text-muted-foreground/50">Upload to analyze</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <DailyTracker />

              {/* Quick Level Card */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-5 h-5 text-status-warning" />
                  <div>
                    <h3 className="font-display font-bold text-foreground text-xs tracking-wide">LEVEL 4</h3>
                    <p className="text-[10px] text-muted-foreground">260 XP to Level 5</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "62%",
                      background: "linear-gradient(90deg, hsl(35 60% 40%), hsl(35 60% 55%))",
                      transition: "width 1.5s ease-out",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">740 XP</span>
                  <span className="text-[10px] text-muted-foreground">1000 XP</span>
                </div>
              </div>

              {/* Weekly Summary */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-4">WEEKLY SUMMARY</h3>
                <div className="flex items-end gap-1 h-16">
                  {[35, 60, 45, 80, 55, 90, 70].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm"
                        style={{
                          height: `${val}%`,
                          background: i === 6
                            ? "hsl(0 0% 75%)"
                            : "hsl(0 0% 20%)",
                          transition: "height 0.8s ease-out",
                          transitionDelay: `${i * 0.05}s`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} className={cn("text-[9px] font-display flex-1 text-center", i === 6 ? "text-foreground" : "text-muted-foreground/60")}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HubPage;
