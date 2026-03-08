import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ScanFace, Sparkles, Shirt, Dumbbell, Camera, Eye,
  Flame, Trophy, TrendingUp, Zap, Clock,
  ArrowRight,
} from "lucide-react";

const modules = [
  { id: "facemax", icon: ScanFace, label: "Face", path: "/hub/facemax", description: "Facial analysis & optimization", progress: 0 },
  { id: "skin", icon: Sparkles, label: "Skin", path: "/hub/skin", description: "Skincare routines & tracking", progress: 65 },
  { id: "style", icon: Shirt, label: "Style", path: "/hub/style", description: "Wardrobe & fit mastery", progress: 40 },
  { id: "body", icon: Dumbbell, label: "Body", path: "/hub/body", description: "Training & physique", progress: 72 },
  { id: "photo", icon: Camera, label: "Photo", path: "/hub/photo", description: "Profile photo scoring", progress: 0 },
  { id: "presence", icon: Eye, label: "Social", path: "/hub/presence", description: "Presence & confidence", progress: 55 },
];

const quickLinks = [
  { id: "glowup", icon: Flame, label: "Progress Tracker", path: "/hub/glowup" },
  { id: "gamification", icon: Trophy, label: "Leaderboard", path: "/hub/gamification" },
  { id: "timeline", icon: Clock, label: "Timeline", path: "/hub/timeline" },
];

const HubPage = () => {
  const navigate = useNavigate();

  const overallScore = 58;
  const streak = 7;
  const weeklyXP = 340;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">

      {/* Welcome + Stats */}
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your glow-up at a glance.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Score", value: overallScore, icon: TrendingUp, color: "text-foreground" },
          { label: "Streak", value: `${streak}d`, icon: Zap, color: "text-status-warning" },
          { label: "Weekly XP", value: weeklyXP, icon: Trophy, color: "text-status-success" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={cn("h-4 w-4", s.color)} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <span className="text-2xl font-display font-bold text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Module Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className="group text-left rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm mb-0.5">{mod.label}</h3>
                <p className="text-xs text-muted-foreground mb-3">{mod.description}</p>
                {mod.progress > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground/40"
                        style={{ width: `${mod.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{mod.progress}%</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground/50">Not started</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">Quick Access</h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => navigate(link.path)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HubPage;
