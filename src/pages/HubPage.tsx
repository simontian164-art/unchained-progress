import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ScanFace, Sparkles, Shirt, Dumbbell, Camera, Eye,
  Flame, Trophy, Clock, TrendingUp, Zap, Crown,
  ChevronRight,
} from "lucide-react";

const modules = [
  { id: "facemax", icon: ScanFace, label: "FaceMax", path: "/hub/facemax", description: "Facial analysis", progress: 0, iconColor: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/10" },
  { id: "skin", icon: Sparkles, label: "SkinMax", path: "/hub/skin", description: "Skincare routines", progress: 65, iconColor: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/10" },
  { id: "style", icon: Shirt, label: "StyleMax", path: "/hub/style", description: "Wardrobe mastery", progress: 40, iconColor: "text-violet-400", bgColor: "bg-violet-500/10", borderColor: "border-violet-500/10" },
  { id: "body", icon: Dumbbell, label: "BodyMax", path: "/hub/body", description: "Training & physique", progress: 72, iconColor: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/10" },
  { id: "photo", icon: Camera, label: "PhotoMax", path: "/hub/photo", description: "Photo scoring", progress: 0, iconColor: "text-sky-400", bgColor: "bg-sky-500/10", borderColor: "border-sky-500/10" },
  { id: "presence", icon: Eye, label: "SocialMax", path: "/hub/presence", description: "Confidence", progress: 55, iconColor: "text-pink-400", bgColor: "bg-pink-500/10", borderColor: "border-pink-500/10" },
];

const HubPage = () => {
  const navigate = useNavigate();
  const overallScore = 58;
  const streak = 7;
  const weeklyXP = 340;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5 md:space-y-8">

      {/* Mobile brand */}
      <div className="flex items-center gap-2.5 md:hidden pt-1">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/10 flex items-center justify-center">
          <Crown className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <span className="font-display font-bold text-foreground text-[15px] tracking-tight block leading-tight">GLOWMAX</span>
          <span className="text-[10px] text-muted-foreground leading-none">Level up your look</span>
        </div>
      </div>

      {/* Score Hero */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-card to-amber-500/[0.04] border border-border rounded-2xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

        <div className="relative p-4 md:p-8">
          <div className="flex items-center gap-4 mb-5 md:mb-7">
            <div className="relative">
              <svg width="72" height="72" viewBox="0 0 72 72" className="md:w-[88px] md:h-[88px]">
                <circle cx="36" cy="36" r="30" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <circle
                  cx="36" cy="36" r="30"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallScore / 100) * 188.5} 188.5`}
                  transform="rotate(-90 36 36)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl md:text-2xl font-display font-bold text-foreground">{overallScore}</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-display font-bold text-foreground tracking-tight">Your Score</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Top 30% is within reach</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {[
              { label: "Score", value: `${overallScore}`, icon: TrendingUp, iconCol: "text-violet-400", bg: "from-violet-500/10 to-violet-500/5", border: "border-violet-500/10" },
              { label: "Streak", value: `${streak}d`, icon: Zap, iconCol: "text-amber-400", bg: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/10" },
              { label: "XP", value: `${weeklyXP}`, icon: Trophy, iconCol: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/10" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl bg-gradient-to-br border p-3 md:p-4 text-center", s.bg, s.border)}>
                <s.icon className={cn("h-4 w-4 mx-auto mb-1.5", s.iconCol)} />
                <span className="block text-lg md:text-2xl font-display font-bold text-foreground leading-none">{s.value}</span>
                <span className="text-[10px] text-muted-foreground mt-1 block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-widest">Modules</h2>
          <span className="text-[10px] text-muted-foreground">{modules.filter(m => m.progress > 0).length} active</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className={cn(
                  "group text-left rounded-2xl border bg-card hover:bg-accent/20 active:scale-[0.97] transition-all duration-200",
                  mod.borderColor
                )}
              >
                <div className="p-3.5 md:p-5">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", mod.bgColor)}>
                    <Icon className={cn("h-[18px] w-[18px]", mod.iconColor)} />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-[13px] md:text-sm leading-tight">{mod.label}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-3 hidden sm:block">{mod.description}</p>

                  {mod.progress > 0 ? (
                    <div className="mt-2 sm:mt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">{mod.progress}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", mod.bgColor.replace("/10", "/40"))}
                          style={{ width: `${mod.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40 mt-2 sm:mt-0 block">Start →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Access */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-display font-semibold text-muted-foreground uppercase tracking-widest px-0.5">Quick Access</h2>
        <div className="space-y-2">
          {[
            { icon: Flame, label: "Progress Tracker", desc: "Track your glow-up journey", path: "/hub/glowup", iconCol: "text-orange-400", bg: "bg-orange-500/10" },
            { icon: Trophy, label: "Leaderboard", desc: "See how you rank", path: "/hub/gamification", iconCol: "text-yellow-400", bg: "bg-yellow-500/10" },
            { icon: Clock, label: "Timeline", desc: "View your transformation", path: "/hub/timeline", iconCol: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="group w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 md:p-4 hover:bg-accent/20 active:scale-[0.98] transition-all duration-200"
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", link.bg)}>
                  <Icon className={cn("h-4 w-4", link.iconCol)} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[13px] md:text-sm font-semibold text-foreground">{link.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{link.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HubPage;
