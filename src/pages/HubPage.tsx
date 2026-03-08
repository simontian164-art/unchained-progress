import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ScanFace, Sparkles, Shirt, Dumbbell, Camera, Eye,
  Flame, Trophy, Clock, Zap, Crown, ArrowRight,
} from "lucide-react";

const modules = [
  { id: "facemax", icon: ScanFace, label: "FaceMax", path: "/hub/facemax", desc: "Facial analysis & optimization", progress: 0, gradient: "from-rose-500 to-pink-600", glow: "shadow-rose-500/20" },
  { id: "skin", icon: Sparkles, label: "SkinMax", path: "/hub/skin", desc: "Skincare routines & tracking", progress: 65, gradient: "from-emerald-400 to-teal-500", glow: "shadow-emerald-500/20" },
  { id: "style", icon: Shirt, label: "StyleMax", path: "/hub/style", desc: "Wardrobe & fit mastery", progress: 40, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
  { id: "body", icon: Dumbbell, label: "BodyMax", path: "/hub/body", desc: "Training & physique goals", progress: 72, gradient: "from-amber-400 to-orange-500", glow: "shadow-amber-500/20" },
  { id: "photo", icon: Camera, label: "PhotoMax", path: "/hub/photo", desc: "Profile photo scoring", progress: 0, gradient: "from-sky-400 to-blue-500", glow: "shadow-sky-500/20" },
  { id: "presence", icon: Eye, label: "SocialMax", path: "/hub/presence", desc: "Presence & confidence", progress: 55, gradient: "from-fuchsia-500 to-pink-500", glow: "shadow-fuchsia-500/20" },
];

const HubPage = () => {
  const navigate = useNavigate();
  const overallScore = 58;
  const streak = 7;
  const weeklyXP = 340;

  const circumference = 2 * Math.PI * 54;
  const strokeDash = (overallScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">

        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between md:hidden"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="h-5 w-5 text-background" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-base tracking-tight block leading-tight">GLOWMAX</span>
              <span className="text-[10px] text-muted-foreground">Your glow-up companion</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Rich gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-card to-amber-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/[0.08] via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/15 to-transparent" />
          <div className="absolute inset-0 border border-white/[0.06] rounded-3xl" />

          <div className="relative p-5 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10">
              {/* Score Ring */}
              <div className="relative shrink-0">
                <svg width="128" height="128" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="ringBg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#ringBg)" strokeWidth="6" />
                  <motion.circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - strokeDash }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    transform="rotate(-90 60 60)"
                    filter="url(#glow)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-3xl font-display font-black text-foreground"
                  >
                    {overallScore}
                  </motion.span>
                  <span className="text-[10px] text-muted-foreground -mt-0.5">of 100</span>
                </div>
              </div>

              {/* Info + Stats */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-xl md:text-3xl font-display font-black text-foreground tracking-tight mb-1">
                  Your Glow Score
                </h1>
                <p className="text-sm text-muted-foreground mb-5">You're in the <span className="text-violet-400 font-medium">top 42%</span> — keep grinding</p>

                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {[
                    { label: "Score", value: overallScore, icon: "📊", accent: "from-violet-500/15 to-violet-600/5 border-violet-500/15" },
                    { label: "Streak", value: `${streak}d`, icon: "🔥", accent: "from-amber-500/15 to-orange-500/5 border-amber-500/15" },
                    { label: "XP", value: weeklyXP, icon: "⚡", accent: "from-emerald-500/15 to-teal-500/5 border-emerald-500/15" },
                  ].map((s) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className={cn("rounded-2xl bg-gradient-to-b border p-3 text-center", s.accent)}
                    >
                      <span className="text-base mb-0.5 block">{s.icon}</span>
                      <span className="text-lg md:text-xl font-display font-black text-foreground block leading-none">{s.value}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">{s.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest">Modules</h2>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-muted-foreground">{modules.filter(m => m.progress > 0).length} active</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  onClick={() => navigate(mod.path)}
                  className={cn(
                    "group relative text-left rounded-2xl overflow-hidden active:scale-[0.96] transition-transform duration-200",
                    "bg-card border border-white/[0.04] hover:border-white/[0.08]",
                    `hover:${mod.glow} hover:shadow-lg`
                  )}
                >
                  {/* Top gradient bar */}
                  <div className={cn("h-1 w-full bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity", mod.gradient)} />

                  <div className="p-4 md:p-5">
                    <div className={cn("h-11 w-11 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg", mod.gradient, mod.glow)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-foreground text-sm leading-tight">{mod.label}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 mb-3 line-clamp-1">{mod.desc}</p>

                    {mod.progress > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-medium text-muted-foreground">{mod.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mod.progress}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full rounded-full bg-gradient-to-r", mod.gradient)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground/40">
                        <div className="h-1.5 w-6 rounded-full bg-muted/30" />
                        <span className="text-[10px]">New</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h2 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest px-1">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { icon: Flame, label: "Progress", desc: "Track your glow-up", path: "/hub/glowup", gradient: "from-orange-500 to-red-500", glow: "shadow-orange-500/20" },
              { icon: Trophy, label: "Leaderboard", desc: "See your rank", path: "/hub/gamification", gradient: "from-yellow-400 to-amber-500", glow: "shadow-yellow-500/20" },
              { icon: Clock, label: "Timeline", desc: "Transformation history", path: "/hub/timeline", gradient: "from-cyan-400 to-blue-500", glow: "shadow-cyan-500/20" },
            ].map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  onClick={() => navigate(link.path)}
                  className="group w-full flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-card p-3.5 md:p-4 hover:border-white/[0.08] active:scale-[0.98] transition-all duration-200"
                >
                  <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg", link.gradient, link.glow)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{link.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground group-hover:translate-x-0.5 shrink-0 transition-all" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubPage;
