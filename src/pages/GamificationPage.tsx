import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ChevronDown, Trophy, Flame, Star, Zap,
  Target, Crown, Medal, Shield, CheckCircle, Lock,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const leaderboard = [
  { rank: 1, name: "You", score: 1420, streak: 14, level: 4, isUser: true },
  { rank: 2, name: "Alex M.", score: 1380, streak: 21, level: 4, isUser: false },
  { rank: 3, name: "Jordan K.", score: 1290, streak: 9, level: 3, isUser: false },
  { rank: 4, name: "Marcus T.", score: 1150, streak: 12, level: 3, isUser: false },
  { rank: 5, name: "Daniel R.", score: 1080, streak: 7, level: 3, isUser: false },
  { rank: 6, name: "Chris W.", score: 980, streak: 5, level: 2, isUser: false },
  { rank: 7, name: "Ryan P.", score: 920, streak: 4, level: 2, isUser: false },
  { rank: 8, name: "Ethan S.", score: 840, streak: 3, level: 2, isUser: false },
  { rank: 9, name: "Noah L.", score: 760, streak: 6, level: 2, isUser: false },
  { rank: 10, name: "James H.", score: 680, streak: 2, level: 1, isUser: false },
];

const badges = [
  { id: "b1", icon: "🔥", name: "First Flame", desc: "Complete your first day", unlocked: true, date: "Week 1" },
  { id: "b2", icon: "💪", name: "Gym Rat", desc: "Work out 7 days in a row", unlocked: true, date: "Week 2" },
  { id: "b3", icon: "✨", name: "Skin Glow", desc: "Reach 70+ skin score", unlocked: true, date: "Week 3" },
  { id: "b4", icon: "👔", name: "Style Upgrade", desc: "Build a capsule wardrobe", unlocked: true, date: "Week 4" },
  { id: "b5", icon: "🧠", name: "Mind Sharp", desc: "Read 5 books", unlocked: true, date: "Week 5" },
  { id: "b6", icon: "🎯", name: "Consistent", desc: "14-day streak", unlocked: true, date: "Week 6" },
  { id: "b7", icon: "💎", name: "Diamond Hands", desc: "30-day streak", unlocked: false, date: null },
  { id: "b8", icon: "👑", name: "Top 10%", desc: "Reach overall score 85+", unlocked: false, date: null },
  { id: "b9", icon: "⚡", name: "Speed Runner", desc: "+20 score in one week", unlocked: false, date: null },
  { id: "b10", icon: "🏆", name: "Champion", desc: "Reach #1 on leaderboard", unlocked: false, date: null },
  { id: "b11", icon: "🌟", name: "All-Rounder", desc: "70+ in every category", unlocked: false, date: null },
  { id: "b12", icon: "🔱", name: "Legendary", desc: "Complete all challenges", unlocked: false, date: null },
];

const streakDays = [
  true, true, true, true, true, false, true,
  true, true, true, false, true, true, true,
  true, true, true, true, true, true, false,
  true, true, true, true, false, false, false,
];
const currentStreak = 4;
const bestStreak = 14;
const totalDays = streakDays.filter(Boolean).length;

const challenges = [
  { id: "ch1", title: "7-Day Skin Reset", desc: "Follow full AM/PM skincare for 7 consecutive days", xp: 150, duration: "7 days", progress: 100, status: "completed" as const, category: "Skin" },
  { id: "ch2", title: "Iron Week", desc: "Hit the gym 5 times this week with progressive overload", xp: 200, duration: "7 days", progress: 80, status: "active" as const, category: "Body" },
  { id: "ch3", title: "Style Overhaul", desc: "Create 5 complete outfits using capsule wardrobe principles", xp: 175, duration: "5 days", progress: 60, status: "active" as const, category: "Style" },
  { id: "ch4", title: "Social Butterfly", desc: "Start 3 conversations with strangers this week", xp: 250, duration: "7 days", progress: 33, status: "active" as const, category: "Social" },
  { id: "ch5", title: "Cold Shower Challenge", desc: "Take a cold shower every morning for 14 days", xp: 300, duration: "14 days", progress: 0, status: "locked" as const, category: "Discipline" },
  { id: "ch6", title: "No Sugar Sprint", desc: "Eliminate added sugar for 10 days straight", xp: 250, duration: "10 days", progress: 0, status: "locked" as const, category: "Health" },
  { id: "ch7", title: "Photo Glow Up", desc: "Take professional-quality profile photos", xp: 150, duration: "3 days", progress: 0, status: "locked" as const, category: "Photo" },
  { id: "ch8", title: "Deep Focus Week", desc: "Complete 5 deep work sessions (90min each)", xp: 200, duration: "7 days", progress: 0, status: "locked" as const, category: "Mind" },
];

// ─── Sub-components ──────────────────────────────────────────────────

const SectionWrapper = ({ title, icon, children, delay = "0s" }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: string }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card rounded-2xl overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: delay }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
        <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2">{icon} {title}</h3>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden"><div className="px-5 pb-5">{children}</div></div>
      </div>
    </div>
  );
};

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-status-warning" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-silver" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-700" />;
  return <span className="text-[10px] font-display text-muted-foreground w-4 text-center">{rank}</span>;
};

// ─── Main Page ───────────────────────────────────────────────────────

const GamificationPage = () => {
  const navigate = useNavigate();

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter((c) => c.status === "completed").length;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Gamification</h1>
            <p className="text-muted-foreground text-[11px] font-display">Compete, earn badges, conquer challenges</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Top Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-0 animate-fade-in">
            {[
              { label: "Rank", value: "#1", icon: <Trophy className="w-4 h-4 text-status-warning" />, sub: "of 10 users" },
              { label: "Streak", value: `${currentStreak}d`, icon: <Flame className="w-4 h-4 text-orange-400" />, sub: `Best: ${bestStreak}d` },
              { label: "Badges", value: `${unlockedCount}/${badges.length}`, icon: <Star className="w-4 h-4 text-status-warning" />, sub: `${Math.round((unlockedCount / badges.length) * 100)}% unlocked` },
              { label: "Challenges", value: `${completedCount + activeCount}`, icon: <Target className="w-4 h-4 text-status-success" />, sub: `${activeCount} active` },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-[10px] font-display text-muted-foreground">{s.label}</span></div>
                <span className="text-lg font-display font-bold text-foreground">{s.value}</span>
                <span className="text-[9px] text-muted-foreground ml-2">{s.sub}</span>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <SectionWrapper title="GLOW UP LEADERBOARD" icon={<Trophy className="w-4 h-4 text-status-warning" />} delay="0.05s">
            <div className="space-y-1.5">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  entry.isUser ? "glass-card-strong ring-1 ring-status-warning/30" : "glass-card hover:bg-muted/20"
                )}>
                  <div className="w-6 flex justify-center">{rankIcon(entry.rank)}</div>
                  <span className={cn("text-xs font-display font-bold flex-1", entry.isUser ? "text-status-warning" : "text-foreground")}>{entry.name}</span>
                  <div className="flex items-center gap-1 mr-4">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-[9px] font-display text-muted-foreground">{entry.streak}d</span>
                  </div>
                  <div className="flex items-center gap-1 mr-4">
                    <Shield className="w-3 h-3 text-silver" />
                    <span className="text-[9px] font-display text-muted-foreground">Lv{entry.level}</span>
                  </div>
                  <span className="text-xs font-display font-bold text-foreground w-14 text-right">{entry.score.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Badges */}
          <SectionWrapper title="IMPROVEMENT BADGES" icon={<Star className="w-4 h-4 text-status-warning" />} delay="0.1s">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {badges.map((b) => (
                <div key={b.id} className={cn(
                  "glass-card rounded-xl p-3 text-center transition-all duration-300 hover-lift",
                  b.unlocked ? "hover:ring-1 hover:ring-silver/15" : "opacity-40"
                )}>
                  <div className="text-2xl mb-1.5">{b.unlocked ? b.icon : "🔒"}</div>
                  <span className="text-[10px] font-display font-bold text-foreground block mb-0.5">{b.name}</span>
                  <p className="text-[8px] text-muted-foreground leading-tight">{b.desc}</p>
                  {b.unlocked && b.date && (
                    <span className="text-[7px] font-display text-status-success mt-1 block">{b.date}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${(unlockedCount / badges.length) * 100}%`,
                  background: "hsl(35 60% 50%)",
                }} />
              </div>
              <span className="text-[9px] font-display text-muted-foreground">{unlockedCount}/{badges.length}</span>
            </div>
          </SectionWrapper>

          {/* Streak Tracker */}
          <SectionWrapper title="STREAK TRACKER" icon={<Flame className="w-4 h-4 text-orange-400" />} delay="0.15s">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-status-warning/10 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-status-warning" />
                  </div>
                  <div>
                    <span className="text-xl font-display font-bold text-foreground">{currentStreak}</span>
                    <span className="text-xs text-muted-foreground ml-1">day streak</span>
                    <div className="text-[9px] text-muted-foreground">Best: {bestStreak}d · Total active: {totalDays}d</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-display text-muted-foreground">Consistency</span>
                  <div className="text-lg font-display font-bold text-foreground">{Math.round((totalDays / streakDays.length) * 100)}%</div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="text-[8px] font-display text-muted-foreground/50 text-center">{d}</span>
                ))}
                {streakDays.map((active, i) => (
                  <div key={i} className={cn(
                    "aspect-square rounded-md flex items-center justify-center transition-all",
                    active ? "bg-status-success/20" : "bg-muted/50"
                  )}>
                    {active && <CheckCircle className="w-3 h-3 text-status-success" />}
                  </div>
                ))}
              </div>
            </div>
          </SectionWrapper>

          {/* Challenges */}
          <SectionWrapper title="GLOW UP CHALLENGES" icon={<Target className="w-4 h-4 text-status-success" />} delay="0.2s">
            <div className="space-y-3">
              {challenges.map((ch) => (
                <div key={ch.id} className={cn(
                  "glass-card rounded-xl p-4 transition-all duration-300",
                  ch.status === "locked" ? "opacity-50" : "hover:ring-1 hover:ring-silver/15 hover-lift"
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {ch.status === "completed" ? <CheckCircle className="w-4 h-4 text-status-success" /> :
                       ch.status === "active" ? <Zap className="w-4 h-4 text-status-warning" /> :
                       <Lock className="w-4 h-4 text-muted-foreground" />}
                      <span className="text-xs font-display font-bold text-foreground">{ch.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-display text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{ch.category}</span>
                      <span className="text-[9px] font-display font-bold text-status-warning">+{ch.xp} XP</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2 ml-6">{ch.desc}</p>
                  <div className="ml-6 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${ch.progress}%`,
                        background: ch.status === "completed" ? "hsl(142 50% 45%)" : ch.progress > 0 ? "hsl(35 60% 50%)" : "transparent",
                      }} />
                    </div>
                    <span className="text-[9px] font-display text-muted-foreground shrink-0">{ch.progress}%</span>
                    <span className="text-[8px] font-display text-muted-foreground/60 shrink-0">{ch.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>

        </div>
      </main>
    </div>
  );
};

export default GamificationPage;
