import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ScanFace, Sparkles, Shirt, Dumbbell, Camera, Eye,
  Flame, Trophy, Clock, Crown, ArrowRight, Zap, Target,
  Settings,
} from "lucide-react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import OnboardingModal from "@/components/OnboardingModal";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";
import { useState } from "react";

const allModules = [
  { id: "facemax", icon: ScanFace, label: "FaceMax", path: "/hub/facemax", descM: "Jawline, facial structure & symmetry", descF: "Facial harmony, contouring & glow", progress: 0, gradient: "from-rose-500 to-pink-600", glow: "shadow-rose-500/20", gender: "both" as const },
  { id: "skin", icon: Sparkles, label: "SkinMax", path: "/hub/skin", descM: "Clear skin & anti-aging protocols", descF: "Radiant skin routines & treatments", progress: 65, gradient: "from-emerald-400 to-teal-500", glow: "shadow-emerald-500/20", gender: "both" as const },
  { id: "style", icon: Shirt, label: "StyleMax", path: "/hub/style", descM: "Menswear & fit mastery", descF: "Wardrobe curation & outfit styling", progress: 40, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20", gender: "both" as const },
  { id: "body", icon: Dumbbell, label: "BodyMax", path: "/hub/body", descM: "Muscle building & physique goals", descF: "Toning, curves & fitness goals", progress: 72, gradient: "from-amber-400 to-orange-500", glow: "shadow-amber-500/20", gender: "both" as const },
  { id: "photo", icon: Camera, label: "PhotoMax", path: "/hub/photo", descM: "Profile photo scoring", descF: "Best angles & photo optimization", progress: 0, gradient: "from-sky-400 to-blue-500", glow: "shadow-sky-500/20", gender: "both" as const },
  { id: "presence", icon: Eye, label: "SocialMax", path: "/hub/presence", descM: "Presence, frame & confidence", descF: "Charisma, elegance & social skills", progress: 55, gradient: "from-fuchsia-500 to-pink-500", glow: "shadow-fuchsia-500/20", gender: "both" as const },
  { id: "grooming", icon: Sparkles, label: "GroomingMax", path: "/hub/grooming", descM: "Beard, hair & grooming mastery", descF: "Hair care, brows & beauty routines", progress: 30, gradient: "from-teal-400 to-cyan-500", glow: "shadow-teal-500/20", gender: "both" as const },
  { id: "beard", icon: ScanFace, label: "BeardStyle", path: "/hub/beard", descM: "Find your ideal beard style", descF: "", progress: 0, gradient: "from-stone-400 to-stone-600", glow: "shadow-stone-500/20", gender: "male" as const },
  // Female-specific modules
  { id: "makeup", icon: Sparkles, label: "MakeupMax", path: "/hub/makeup", descM: "", descF: "Foundation, contour & color matched to you", progress: 0, gradient: "from-fuchsia-400 to-pink-500", glow: "shadow-fuchsia-500/20", gender: "female" as const },
  { id: "hair", icon: Sparkles, label: "HairMax", path: "/hub/hair", descM: "", descF: "Hair type care, styling & color", progress: 0, gradient: "from-amber-400 to-yellow-500", glow: "shadow-amber-500/20", gender: "female" as const },
  { id: "nails", icon: Sparkles, label: "NailMax", path: "/hub/nails", descM: "", descF: "Shapes, shades & nail care", progress: 0, gradient: "from-pink-400 to-rose-500", glow: "shadow-pink-500/20", gender: "female" as const },
  { id: "fragrance", icon: Sparkles, label: "FragranceMax", path: "/hub/fragrance", descM: "Find your signature scent", descF: "Scent profiles & seasonal picks", progress: 0, gradient: "from-violet-400 to-purple-500", glow: "shadow-violet-500/20", gender: "both" as const },
];

const quickLinks = [
  { icon: Flame, label: "Progress", desc: "Track your glow-up", path: "/hub/glowup", gradient: "from-orange-500 to-red-500", glow: "shadow-orange-500/20" },
  { icon: Trophy, label: "Leaderboard", desc: "See your rank", path: "/hub/gamification", gradient: "from-yellow-400 to-amber-500", glow: "shadow-yellow-500/20" },
  { icon: Clock, label: "Timeline", desc: "Transformation history", path: "/hub/timeline", gradient: "from-cyan-400 to-blue-500", glow: "shadow-cyan-500/20" },
];

const HubPage = () => {
  const navigate = useNavigate();
  const { profile, setProfile, hasCompletedOnboarding } = useUserProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const overallScore = 58;
  const streak = 7;
  const weeklyXP = 340;

  const gender = profile?.gender || "male";
  const modules = allModules
    .filter(m => m.gender === "both" || m.gender === gender)
    .map(m => ({ ...m, desc: gender === "female" ? m.descF || m.descM : m.descM }));

  const circumference = 2 * Math.PI * 40;
  const strokeDash = (overallScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {!hasCompletedOnboarding && (
          <OnboardingModal onComplete={(p) => setProfile(p)} />
        )}
      </AnimatePresence>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(var(--accent-gold)/0.04)] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative p-4 md:p-8 max-w-6xl mx-auto space-y-5 md:space-y-8">

        {/* Compact Header + Score Row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[hsl(var(--accent-gold))] to-[hsl(var(--accent-warm))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-gold)/0.25)]">
              <Crown className="h-4 w-4 text-background" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-sm tracking-tight block leading-tight">GLOWMAX</span>
              <span className="text-[10px] text-muted-foreground">
                {gender === "female" ? "Your glow-up queen hub" : "Your glow-up king hub"}
              </span>
            </div>
          </div>

          {/* Compact stats */}
          <div className="flex items-center gap-3">
            {[
              { icon: "🔥", value: `${streak}d` },
              { icon: "⚡", value: weeklyXP },
            ].map((s) => (
              <div key={s.icon} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs">
                <span>{s.icon}</span>
                <span className="font-bold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Compact Score + Next Action */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {/* Score ring - compact */}
          <div className="relative shrink-0 rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-center">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--accent-gold))" />
                  <stop offset="100%" stopColor="hsl(var(--accent-warm))" />
                </linearGradient>
              </defs>
              <circle cx="44" cy="44" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" strokeOpacity="0.4" />
              <motion.circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - strokeDash }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                transform="rotate(-90 44 44)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-display font-black text-foreground">{overallScore}</span>
              <span className="text-[9px] text-muted-foreground">GLOW</span>
            </div>
          </div>

          {/* Next Action CTA */}
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => navigate("/hub/facemax")}
            className="flex-1 group relative rounded-2xl overflow-hidden border border-[hsl(var(--accent-gold)/0.2)] bg-gradient-to-br from-[hsl(var(--accent-gold)/0.08)] to-card active:scale-[0.98] transition-transform"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--accent-gold)/0.4)] to-transparent" />
            <div className="p-4 flex flex-col justify-between h-full text-left">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                <span className="text-[10px] font-bold text-[hsl(var(--accent-gold))] uppercase tracking-wider">Recommended</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-0.5">Start FaceMax Analysis</p>
                <p className="text-[11px] text-muted-foreground">Unlock your facial potential with AI scoring</p>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] text-[hsl(var(--accent-gold))] font-medium">Begin now</span>
                <ArrowRight className="h-3 w-3 text-[hsl(var(--accent-gold))] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Modules Grid - Bigger Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-display font-bold text-[hsl(var(--accent-gold))] uppercase tracking-widest">Modules</h2>
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
                  transition={{ delay: 0.15 + 0.06 * i, duration: 0.4 }}
                  onClick={() => navigate(mod.path)}
                  className={cn(
                    "group relative text-left rounded-2xl overflow-hidden active:scale-[0.96] transition-all duration-200",
                    "bg-card border border-border hover:border-[hsl(var(--accent-gold)/0.15)]",
                    "hover:shadow-lg hover:shadow-[hsl(var(--accent-gold)/0.05)]"
                  )}
                >
                  {/* Gradient accent bar */}
                  <div className={cn("h-1.5 w-full bg-gradient-to-r opacity-70 group-hover:opacity-100 transition-opacity", mod.gradient)} />

                  <div className="p-4 md:p-5">
                    {/* Icon */}
                    <div className={cn(
                      "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg",
                      mod.gradient, mod.glow
                    )}>
                      <Icon className="h-5.5 w-5.5 text-white" />
                    </div>

                    {/* Label */}
                    <h3 className="font-display font-bold text-foreground text-sm leading-tight mb-0.5">{mod.label}</h3>
                    <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{mod.desc}</p>

                    {/* Progress */}
                    {mod.progress > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-foreground">{mod.progress}%</span>
                          <Zap className="h-3 w-3 text-[hsl(var(--accent-gold))]" />
                        </div>
                        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mod.progress}%` }}
                            transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full rounded-full bg-gradient-to-r", mod.gradient)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-8 rounded-full bg-[hsl(var(--accent-gold)/0.15)]" />
                        <span className="text-[10px] font-medium text-[hsl(var(--accent-gold))]">Start</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="space-y-3">
          <h2 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest px-1">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  onClick={() => navigate(link.path)}
                  className="group w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 hover:border-[hsl(var(--accent-gold)/0.12)] active:scale-[0.98] transition-all duration-200"
                >
                  <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg", link.gradient, link.glow)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{link.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-[hsl(var(--accent-gold))] group-hover:translate-x-0.5 shrink-0 transition-all" />
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
