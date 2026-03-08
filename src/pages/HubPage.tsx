import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ScanFace, Sparkles, Shirt, Dumbbell, Camera, Eye,
  Flame, Trophy, Clock, TrendingUp, Zap, ArrowUpRight,
  ChevronRight,
} from "lucide-react";

const modules = [
  { id: "facemax", icon: ScanFace, label: "FaceMax", path: "/hub/facemax", description: "Facial analysis & optimization", progress: 0, accent: "from-rose-500/20 to-orange-500/10" },
  { id: "skin", icon: Sparkles, label: "SkinMax", path: "/hub/skin", description: "Skincare routines & tracking", progress: 65, accent: "from-emerald-500/20 to-teal-500/10" },
  { id: "style", icon: Shirt, label: "StyleMax", path: "/hub/style", description: "Wardrobe & fit mastery", progress: 40, accent: "from-violet-500/20 to-indigo-500/10" },
  { id: "body", icon: Dumbbell, label: "BodyMax", path: "/hub/body", description: "Training & physique", progress: 72, accent: "from-amber-500/20 to-yellow-500/10" },
  { id: "photo", icon: Camera, label: "PhotoMax", path: "/hub/photo", description: "Profile photo scoring", progress: 0, accent: "from-sky-500/20 to-cyan-500/10" },
  { id: "presence", icon: Eye, label: "SocialMax", path: "/hub/presence", description: "Presence & confidence", progress: 55, accent: "from-pink-500/20 to-fuchsia-500/10" },
];

const HubPage = () => {
  const navigate = useNavigate();

  const overallScore = 58;
  const streak = 7;
  const weeklyXP = 340;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* Hero Stats */}
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/60 via-transparent to-transparent" />
        <div className="relative p-6 md:p-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your Progress</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {[
              { label: "Overall Score", value: overallScore, suffix: "/100", icon: TrendingUp, gradient: "from-foreground/10 to-transparent" },
              { label: "Day Streak", value: streak, suffix: " days", icon: Zap, gradient: "from-status-warning/10 to-transparent" },
              { label: "Weekly XP", value: weeklyXP, suffix: " xp", icon: Trophy, gradient: "from-status-success/10 to-transparent" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl border border-border/50 p-4 md:p-5 bg-gradient-to-br", s.gradient)}>
                <div className="flex items-center gap-1.5 mb-3">
                  <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-display font-bold text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.suffix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest">Modules</h2>
          <span className="text-[10px] text-muted-foreground">{modules.filter(m => m.progress > 0).length}/{modules.length} active</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className="group relative text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-muted-foreground/20 transition-all duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Gradient accent */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", mod.accent)} />
                
                <div className="relative p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-accent/80 border border-border/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-[18px] w-[18px] text-foreground" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                  </div>
                  
                  <h3 className="font-display font-bold text-foreground text-sm mb-1">{mod.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{mod.description}</p>
                  
                  {mod.progress > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground/30 transition-all duration-700"
                          style={{ width: `${mod.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">{mod.progress}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      <span className="text-[11px] text-muted-foreground/60">Start exploring</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Access */}
      <div className="space-y-4">
        <h2 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest">Quick Access</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Flame, label: "Progress Tracker", desc: "Track your glow-up journey", path: "/hub/glowup" },
            { icon: Trophy, label: "Leaderboard", desc: "See how you rank", path: "/hub/gamification" },
            { icon: Clock, label: "Timeline", desc: "View your transformation", path: "/hub/timeline" },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent/30 transition-all duration-200"
              >
                <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{link.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{link.desc}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HubPage;
