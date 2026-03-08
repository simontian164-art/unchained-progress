import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ChevronDown, TrendingUp, Star, Trophy,
  Zap, Clock, Target, Sparkles, ChevronRight,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const stages = [
  { month: 0, label: "Starting Point", score: 38, tier: "Bottom 60%", desc: "No routine, default appearance, low awareness", emoji: "🌱",
    areas: { face: 35, body: 30, skin: 25, style: 40, grooming: 35, social: 30, mind: 45, photo: 20 } },
  { month: 1, label: "Awareness", score: 46, tier: "Top 50%", desc: "First haircut upgrade, basic skincare, gym started", emoji: "⚡",
    areas: { face: 38, body: 38, skin: 42, style: 44, grooming: 45, social: 34, mind: 50, photo: 28 } },
  { month: 2, label: "Foundation", score: 54, tier: "Top 40%", desc: "Consistent gym, skin clearing, wardrobe audit done", emoji: "🔥",
    areas: { face: 42, body: 50, skin: 58, style: 52, grooming: 55, social: 42, mind: 55, photo: 40 } },
  { month: 3, label: "Developing", score: 62, tier: "Top 30%", desc: "Style identity forming, posture improved, beard groomed", emoji: "💪",
    areas: { face: 50, body: 60, skin: 68, style: 62, grooming: 65, social: 52, mind: 60, photo: 52 } },
  { month: 4, label: "Refined", score: 70, tier: "Top 20%", desc: "Compliments regular, body composition visible, confidence up", emoji: "💎",
    areas: { face: 58, body: 70, skin: 76, style: 70, grooming: 74, social: 64, mind: 68, photo: 62 } },
  { month: 5, label: "Advanced", score: 78, tier: "Top 10%", desc: "Head-turning presence, every detail intentional", emoji: "🏆",
    areas: { face: 65, body: 78, skin: 84, style: 78, grooming: 82, social: 74, mind: 74, photo: 74 } },
  { month: 6, label: "Elite", score: 85, tier: "Top 5%", desc: "Maxed routines, social magnetism, full transformation", emoji: "👑",
    areas: { face: 72, body: 85, skin: 90, style: 86, grooming: 88, social: 82, mind: 80, photo: 84 } },
];

const milestones = [
  { month: 0.5, title: "First Gym Session", category: "Body", icon: "💪" },
  { month: 1, title: "Skincare Routine Set", category: "Skin", icon: "✨" },
  { month: 1.5, title: "Haircut Upgrade", category: "Grooming", icon: "💇" },
  { month: 2, title: "Wardrobe Audit Complete", category: "Style", icon: "👔" },
  { month: 2.5, title: "First Compliment", category: "Social", icon: "🗣️" },
  { month: 3, title: "Body Recomp Visible", category: "Body", icon: "🔥" },
  { month: 3.5, title: "Style Identity Locked", category: "Style", icon: "🎯" },
  { month: 4, title: "Confidence Shift", category: "Social", icon: "⚡" },
  { month: 4.5, title: "Profile Photo Upgrade", category: "Photo", icon: "📸" },
  { month: 5, title: "Top 10% Reached", category: "Overall", icon: "💎" },
  { month: 6, title: "Full Transformation", category: "Overall", icon: "👑" },
];

const areaLabels = ["face", "body", "skin", "style", "grooming", "social", "mind", "photo"] as const;
const areaNames: Record<string, string> = { face: "Face", body: "Body", skin: "Skin", style: "Style", grooming: "Groom", social: "Social", mind: "Mind", photo: "Photo" };

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

const ScoreRing = ({ score, size = 120 }: { score: number; size?: number }) => {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-display font-bold text-foreground">{score}</span>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────

const TransformationTimelinePage = () => {
  const navigate = useNavigate();
  const [sliderValue, setSliderValue] = useState(50);

  const beforeStage = stages[0];
  const afterStage = stages[stages.length - 1];
  const interpolatedScore = Math.round(beforeStage.score + (afterStage.score - beforeStage.score) * (sliderValue / 100));

  // Predicted score based on current month (mock: month 4)
  const currentMonth = 4;
  const currentStage = stages[currentMonth];
  const predictedFinal = afterStage.score;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Transformation Timeline</h1>
            <p className="text-muted-foreground text-[11px] font-display">Visualise your glow up journey</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Before / After Slider */}
          <div className="glass-card-strong rounded-2xl p-6 shine-line opacity-0 animate-fade-in">
            <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-status-warning" /> BEFORE → AFTER SLIDER
            </h3>
            <div className="flex items-center gap-6 mb-5">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-display text-muted-foreground mb-2">
                  <span>Month 0 — {beforeStage.label}</span>
                  <span>Month 6 — {afterStage.label}</span>
                </div>
                <input type="range" min={0} max={100} value={sliderValue} onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-muted" />
                <div className="h-3 rounded-full overflow-hidden mt-3 relative bg-muted">
                  <div className="absolute inset-0 h-full rounded-full" style={{
                    background: `linear-gradient(90deg, hsl(0 0% 35%) 0%, hsl(35 60% 50%) 50%, hsl(142 50% 45%) 100%)`,
                  }} />
                  <div className="absolute top-0 h-full bg-background/60" style={{ left: `${sliderValue}%`, right: 0 }} />
                </div>
              </div>
              <div className="shrink-0 text-center">
                <ScoreRing score={interpolatedScore} size={100} />
                <span className="text-[9px] font-display text-muted-foreground mt-1 block">{sliderValue}% through</span>
              </div>
            </div>

            {/* Area comparison bars */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {areaLabels.map((area) => {
                const before = beforeStage.areas[area];
                const after = afterStage.areas[area];
                const current = Math.round(before + (after - before) * (sliderValue / 100));
                return (
                  <div key={area} className="text-center">
                    <div className="h-16 flex items-end justify-center mb-1">
                      <div className="w-5 rounded-t-sm" style={{
                        height: `${current}%`,
                        background: current >= 70 ? "hsl(142 50% 45%)" : current >= 50 ? "hsl(35 60% 50%)" : "hsl(0 0% 40%)",
                        transition: "height 0.3s ease-out",
                      }} />
                    </div>
                    <span className="text-[8px] font-display text-muted-foreground">{areaNames[area]}</span>
                    <span className="text-[10px] font-display font-bold text-foreground block">{current}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Milestones */}
          <SectionWrapper title="PROGRESS MILESTONES" icon={<Trophy className="w-4 h-4 text-status-warning" />} delay="0.05s">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-muted" />
              <div className="space-y-4">
                {milestones.map((m, i) => {
                  const reached = m.month <= currentMonth;
                  return (
                    <div key={m.title} className={cn("flex gap-4 opacity-0 animate-fade-in", !reached && "opacity-40")} style={{ animationDelay: `${0.1 + i * 0.04}s` }}>
                      <div className={cn(
                        "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg",
                        reached ? "glass-card-strong" : "glass-card"
                      )}>
                        {m.icon}
                      </div>
                      <div className={cn("flex-1 glass-card rounded-xl p-3 transition-all duration-300", reached && "hover:ring-1 hover:ring-silver/15")}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-display font-bold text-foreground">{m.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-display text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{m.category}</span>
                            <span className="text-[9px] font-display text-muted-foreground">Month {m.month}</span>
                          </div>
                        </div>
                        {reached && <span className="text-[8px] font-display text-status-success">✓ Achieved</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionWrapper>

          {/* Improvement Stages */}
          <SectionWrapper title="IMPROVEMENT STAGES" icon={<TrendingUp className="w-4 h-4 text-status-success" />} delay="0.15s">
            <div className="space-y-3">
              {stages.map((s, i) => {
                const active = i === currentMonth;
                const passed = i < currentMonth;
                const barColor = s.score >= 80 ? "hsl(142 50% 45%)" : s.score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 40%)";
                return (
                  <div key={s.month} className={cn(
                    "glass-card rounded-xl p-4 transition-all duration-300",
                    active && "ring-1 ring-status-warning/40 bg-status-warning/5",
                    !passed && !active && "opacity-50"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{s.emoji}</span>
                        <div>
                          <span className={cn("text-xs font-display font-bold", active ? "text-status-warning" : "text-foreground")}>{s.label}</span>
                          {active && <span className="text-[8px] font-display text-status-warning bg-status-warning/10 px-2 py-0.5 rounded-full ml-2">YOU ARE HERE</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-display text-muted-foreground">{s.tier}</span>
                        <span className="text-sm font-display font-bold text-foreground">{s.score}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2 ml-8">{s.desc}</p>
                    <div className="ml-8 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: barColor, transition: "width 0.8s ease-out" }} />
                    </div>
                    {/* Area mini-scores */}
                    <div className="ml-8 mt-2 flex gap-2 flex-wrap">
                      {areaLabels.map((area) => (
                        <span key={area} className="text-[8px] font-display text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                          {areaNames[area]} {s.areas[area]}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>

          {/* Predicted Glow Up Score */}
          <SectionWrapper title="PREDICTED GLOW UP SCORE" icon={<Target className="w-4 h-4 text-silver" />} delay="0.25s">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-4">
                  <ScoreRing score={currentStage.score} size={100} />
                  <div>
                    <span className="text-[10px] font-display text-muted-foreground">Current</span>
                    <div className="text-xl font-display font-bold text-foreground">{currentStage.score}</div>
                    <span className="text-[9px] font-display text-muted-foreground">{currentStage.tier}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                <div className="flex items-center gap-4">
                  <ScoreRing score={predictedFinal} size={100} />
                  <div>
                    <span className="text-[10px] font-display text-status-warning">Predicted (Month 6)</span>
                    <div className="text-xl font-display font-bold text-foreground">{predictedFinal}</div>
                    <span className="text-[9px] font-display text-status-success">+{predictedFinal - currentStage.score} pts</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <span className="text-[10px] font-display text-muted-foreground">Area-by-area projection</span>
                {areaLabels.map((area) => {
                  const now = currentStage.areas[area];
                  const pred = afterStage.areas[area];
                  const gain = pred - now;
                  return (
                    <div key={area} className="flex items-center gap-3">
                      <span className="text-[9px] font-display text-muted-foreground w-12">{areaNames[area]}</span>
                      <span className="text-[9px] font-display text-foreground w-6 text-right">{now}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden relative">
                        <div className="absolute h-full rounded-full opacity-40" style={{
                          width: `${pred}%`, background: "hsl(35 60% 50%)",
                        }} />
                        <div className="relative h-full rounded-full" style={{
                          width: `${now}%`,
                          background: now >= 70 ? "hsl(142 50% 45%)" : now >= 50 ? "hsl(35 60% 50%)" : "hsl(0 0% 50%)",
                          transition: "width 0.8s ease-out",
                        }} />
                      </div>
                      <span className="text-[9px] font-display font-bold text-foreground w-6">{pred}</span>
                      <span className="text-[8px] font-display text-status-success w-8">+{gain}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 glass-card rounded-lg p-3 flex items-center gap-3">
                <Zap className="w-4 h-4 text-status-warning shrink-0" />
                <p className="text-[10px] text-muted-foreground">
                  At your current pace, you'll reach <strong className="text-foreground">{predictedFinal}</strong> by month 6.
                  Focus on <strong className="text-foreground">{areaNames[areaLabels.reduce((a, b) => currentStage.areas[a] < currentStage.areas[b] ? a : b)]}</strong> for
                  the biggest score jump.
                </p>
              </div>
            </div>
          </SectionWrapper>

        </div>
      </main>
    </div>
  );
};

export default TransformationTimelinePage;
