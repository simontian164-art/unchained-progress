import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, TrendingUp, Star, Trophy, Zap, Flame, Clock,
  ChevronRight, CheckCircle, Sparkles, Target,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const categoryScores = [
  { label: "Face", score: 76, prev: 62 },
  { label: "Body", score: 72, prev: 55 },
  { label: "Skin", score: 80, prev: 58 },
  { label: "Style", score: 68, prev: 48 },
  { label: "Grooming", score: 74, prev: 60 },
  { label: "Social", score: 65, prev: 50 },
  { label: "Mind", score: 70, prev: 52 },
  { label: "Money", score: 58, prev: 40 },
];

const weeklyScores = [
  { week: "W1", score: 42 }, { week: "W2", score: 48 }, { week: "W3", score: 51 },
  { week: "W4", score: 56 }, { week: "W5", score: 60 }, { week: "W6", score: 64 },
  { week: "W7", score: 67 }, { week: "W8", score: 70 },
];

const timeline = [
  { week: 1, title: "Foundation Set", desc: "Started skincare routine, first gym session, wardrobe audit", score: 42, badge: "🌱" },
  { week: 2, title: "First Wins", desc: "Consistent gym 3x, haircut upgrade, posture practice started", score: 48, badge: "⚡" },
  { week: 4, title: "Visible Changes", desc: "Skin clearing, body composition shifting, style finds working", score: 56, badge: "🔥" },
  { week: 6, title: "Confidence Shift", desc: "Compliments received, eye contact natural, voice deeper", score: 64, badge: "💎" },
  { week: 8, title: "Current Level", desc: "Consistent routines, measurable progress across all areas", score: 70, badge: "👑" },
];

const levels = [
  { level: 1, name: "Beginner", xpReq: 0 },
  { level: 2, name: "Aware", xpReq: 200 },
  { level: 3, name: "Developing", xpReq: 500 },
  { level: 4, name: "Intermediate", xpReq: 1000 },
  { level: 5, name: "Advanced", xpReq: 1800 },
  { level: 6, name: "Elite", xpReq: 3000 },
  { level: 7, name: "Top 10%", xpReq: 5000 },
  { level: 8, name: "Legendary", xpReq: 8000 },
];

const streakDays = [true, true, true, true, true, false, true, true, true, true, false, true, true, true];
const currentStreak = 4;
const bestStreak = 14;
const totalXP = 1420;

const radarLabels = ["Face", "Body", "Skin", "Style", "Grooming", "Social", "Mind", "Money"];

// ─── Sub-components ──────────────────────────────────────────────────

const ScoreRing = ({ score, size = 140, label, delta }: { score: number; size?: number; label?: string; delta?: number }) => {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-foreground">{score}</span>
          {delta !== undefined && (
            <span className="text-[10px] font-display text-status-success">+{delta} pts</span>
          )}
        </div>
      </div>
      {label && <span className="text-[11px] font-display text-muted-foreground mt-2">{label}</span>}
    </div>
  );
};

const RadarChart = ({ scores, size = 240 }: { scores: number[]; size?: number }) => {
  const cx = size / 2, cy = size / 2, r = size / 2 - 28;
  const n = scores.length;
  const angleSlice = (2 * Math.PI) / n;
  const poly = (vals: number[]) => vals.map((s, i) => {
    const a = angleSlice * i - Math.PI / 2;
    return `${cx + (s / 100) * r * Math.cos(a)},${cy + (s / 100) * r * Math.sin(a)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} className="mx-auto">
      {[1, 2, 3, 4].map((li) => {
        const lr = (li / 4) * r;
        const pts = scores.map((_, i) => {
          const a = angleSlice * i - Math.PI / 2;
          return `${cx + lr * Math.cos(a)},${cy + lr * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={li} points={pts} fill="none" stroke="hsl(var(--muted))" strokeWidth={0.5} />;
      })}
      {scores.map((_, i) => {
        const a = angleSlice * i - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="hsl(var(--muted))" strokeWidth={0.5} />;
      })}
      {/* Previous scores (faded) */}
      <polygon points={poly(categoryScores.map((c) => c.prev))} fill="hsl(0 0% 50% / 0.06)" stroke="hsl(0 0% 50% / 0.3)" strokeWidth={1} strokeDasharray="4 2" />
      {/* Current scores */}
      <polygon points={poly(scores)} fill="hsl(35 60% 50% / 0.12)" stroke="hsl(35 60% 50%)" strokeWidth={1.5} />
      {scores.map((s, i) => {
        const a = angleSlice * i - Math.PI / 2;
        const pr = (s / 100) * r;
        const lx = cx + (r + 18) * Math.cos(a);
        const ly = cy + (r + 18) * Math.sin(a);
        return (
          <g key={`g${i}`}>
            <circle cx={cx + pr * Math.cos(a)} cy={cy + pr * Math.sin(a)} r={3} fill="hsl(35 60% 50%)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-display">{radarLabels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────

const GlowUpPage = () => {
  const navigate = useNavigate();

  const overallScore = Math.round(categoryScores.reduce((a, c) => a + c.score, 0) / categoryScores.length);
  const prevOverall = Math.round(categoryScores.reduce((a, c) => a + c.prev, 0) / categoryScores.length);
  const delta = overallScore - prevOverall;

  const currentLevel = levels.filter((l) => totalXP >= l.xpReq).pop()!;
  const nextLevel = levels.find((l) => l.xpReq > totalXP);
  const levelProgress = nextLevel ? ((totalXP - currentLevel.xpReq) / (nextLevel.xpReq - currentLevel.xpReq)) * 100 : 100;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">GlowUp Tracker</h1>
            <p className="text-muted-foreground text-[11px] font-display">Your complete transformation dashboard</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Top Dashboard */}
          <div className="grid sm:grid-cols-4 gap-4 opacity-0 animate-fade-in">
            {/* Overall Score */}
            <div className="sm:col-span-1 glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
              <ScoreRing score={overallScore} size={130} delta={delta} />
              <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">GLOW UP SCORE</h3>
            </div>

            {/* Streak */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-status-warning" />
                <div>
                  <span className="text-lg font-display font-bold text-foreground">{currentStreak}</span>
                  <span className="text-xs text-muted-foreground ml-1 font-display">day streak</span>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap mb-3">
                {streakDays.map((active, i) => (
                  <div key={i} className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                    active ? "bg-status-success/20" : "bg-muted"
                  )}>
                    {active && <CheckCircle className="w-3 h-3 text-status-success" />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-display text-muted-foreground">
                <span>Current: {currentStreak}d</span>
                <span>Best: {bestStreak}d</span>
              </div>
            </div>

            {/* Level */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-status-warning" />
                <div>
                  <span className="text-xs font-display font-bold text-foreground">LEVEL {currentLevel.level}</span>
                  <span className="text-[10px] text-muted-foreground block">{currentLevel.name}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{
                  width: `${levelProgress}%`,
                  background: "linear-gradient(90deg, hsl(35 60% 40%), hsl(35 60% 55%))",
                  transition: "width 1.5s ease-out",
                }} />
              </div>
              <div className="flex justify-between text-[9px] font-display text-muted-foreground">
                <span>{totalXP} XP</span>
                <span>{nextLevel ? `${nextLevel.xpReq} XP` : "MAX"}</span>
              </div>
              {/* Mini level ladder */}
              <div className="mt-3 space-y-1">
                {levels.map((l) => (
                  <div key={l.level} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", totalXP >= l.xpReq ? "bg-status-success" : "bg-muted")} />
                    <span className={cn("text-[9px] font-display", totalXP >= l.xpReq ? "text-foreground" : "text-muted-foreground/50")}>
                      Lv{l.level} {l.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              {[
                { label: "Total XP", value: totalXP.toLocaleString(), icon: <Zap className="w-4 h-4 text-status-warning" /> },
                { label: "Weeks Active", value: "8", icon: <Clock className="w-4 h-4 text-silver" /> },
                { label: "Avg Growth", value: `+${Math.round(delta / 8)}/wk`, icon: <TrendingUp className="w-4 h-4 text-status-success" /> },
                { label: "Top Area", value: "Skin", icon: <Star className="w-4 h-4 text-rose-400" /> },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  {s.icon}
                  <div className="flex-1 flex justify-between">
                    <span className="text-[11px] font-display text-muted-foreground">{s.label}</span>
                    <span className="text-[11px] font-display font-bold text-foreground">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar + Weekly Chart */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="glass-card rounded-2xl p-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-status-warning" /> IMPROVEMENT RADAR
              </h3>
              <p className="text-[9px] text-muted-foreground mb-2">Solid = current · Dashed = starting point</p>
              <RadarChart scores={categoryScores.map((c) => c.score)} size={230} />
            </div>

            <div className="glass-card rounded-2xl p-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-status-success" /> WEEKLY PROGRESS
              </h3>
              <div className="flex items-end gap-2 h-28">
                {weeklyScores.map((w, i) => (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] text-muted-foreground font-display">{w.score}</span>
                    <div className="w-full rounded-sm hover:opacity-80 transition-opacity" style={{
                      height: `${w.score}%`,
                      background: i === weeklyScores.length - 1 ? "hsl(35 60% 50%)" : "hsl(0 0% 22%)",
                      transition: "height 0.8s ease-out",
                      transitionDelay: `${i * 0.06}s`,
                    }} />
                    <span className="text-[9px] font-display text-muted-foreground/60">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="glass-card rounded-2xl p-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-silver" /> CATEGORY BREAKDOWN
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {categoryScores.map((cat) => {
                const gain = cat.score - cat.prev;
                const color = cat.score >= 80 ? "hsl(142 50% 45%)" : cat.score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
                return (
                  <div key={cat.label} className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-display font-bold text-foreground group-hover:text-silver transition-colors">{cat.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground">{cat.prev}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                        <span className="text-xs font-display font-bold text-foreground">{cat.score}</span>
                        <span className="text-[9px] font-display text-status-success">+{gain}</span>
                      </div>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                      {/* Previous (ghost bar) */}
                      <div className="absolute h-full rounded-full opacity-20" style={{ width: `${cat.prev}%`, background: color }} />
                      <div className="relative h-full rounded-full" style={{ width: `${cat.score}%`, background: color, transition: "width 1s ease-out" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transformation Timeline */}
          <div className="glass-card rounded-2xl p-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-silver" /> TRANSFORMATION TIMELINE
            </h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-muted" />
              <div className="space-y-6">
                {timeline.map((entry, i) => (
                  <div key={entry.week} className="flex gap-4 opacity-0 animate-fade-in" style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
                    <div className="relative z-10 w-10 h-10 rounded-xl glass-card-strong flex items-center justify-center shrink-0 text-lg">
                      {entry.badge}
                    </div>
                    <div className="flex-1 glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-display font-bold text-foreground group-hover:text-silver transition-colors">{entry.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-display text-muted-foreground">Week {entry.week}</span>
                          <span className="text-xs font-display font-bold text-foreground">{entry.score}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{entry.desc}</p>
                      <div className="h-1 rounded-full bg-muted overflow-hidden mt-2">
                        <div className="h-full rounded-full" style={{
                          width: `${entry.score}%`,
                          background: entry.score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 40%)",
                          transition: "width 1s ease-out",
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default GlowUpPage;
