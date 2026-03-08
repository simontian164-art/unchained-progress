import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ChevronDown, ChevronRight, ScanFace, Gem, Shirt, Dumbbell, Eye,
  TrendingUp, Trophy, Zap, Star, Target, Sparkles,
} from "lucide-react";

// ─── Mock Scores ─────────────────────────────────────────────────────

const categories = [
  { key: "face", label: "FaceMax", icon: ScanFace, score: 76, prev: 62, sub: [
    { label: "Symmetry", score: 82 }, { label: "Jawline", score: 74 }, { label: "Eyes", score: 78 },
    { label: "Nose", score: 70 }, { label: "Golden Ratio", score: 72 }, { label: "Harmony", score: 80 },
  ]},
  { key: "groom", label: "GroomMax", icon: Gem, score: 80, prev: 58, sub: [
    { label: "Skin", score: 84 }, { label: "Hair", score: 78 }, { label: "Beard", score: 82 },
    { label: "Dental", score: 76 }, { label: "Nails", score: 80 }, { label: "Fragrance", score: 78 },
  ]},
  { key: "style", label: "StyleMax", icon: Shirt, score: 68, prev: 48, sub: [
    { label: "Fit", score: 72 }, { label: "Color Match", score: 64 }, { label: "Wardrobe", score: 66 },
    { label: "Accessories", score: 70 }, { label: "Occasion", score: 68 }, { label: "Cohesion", score: 66 },
  ]},
  { key: "body", label: "BodyMax", icon: Dumbbell, score: 72, prev: 55, sub: [
    { label: "V-Taper", score: 74 }, { label: "Body Fat", score: 68 }, { label: "Muscle", score: 76 },
    { label: "Posture", score: 70 }, { label: "Symmetry", score: 72 }, { label: "Proportions", score: 70 },
  ]},
  { key: "social", label: "SocialMax", icon: Eye, score: 65, prev: 50, sub: [
    { label: "Confidence", score: 68 }, { label: "Eye Contact", score: 62 }, { label: "Voice", score: 64 },
    { label: "Charisma", score: 66 }, { label: "Posture", score: 70 }, { label: "Presence", score: 60 },
  ]},
];

const weeklyTrend = [
  { week: "W1", score: 48 }, { week: "W2", score: 52 }, { week: "W3", score: 55 },
  { week: "W4", score: 59 }, { week: "W5", score: 62 }, { week: "W6", score: 65 },
  { week: "W7", score: 69 }, { week: "W8", score: 72 },
];

const tierThresholds = [
  { min: 90, label: "Top 1%", color: "text-status-warning" },
  { min: 80, label: "Top 5%", color: "text-status-success" },
  { min: 70, label: "Top 15%", color: "text-silver" },
  { min: 60, label: "Top 30%", color: "text-muted-foreground" },
  { min: 0, label: "Developing", color: "text-muted-foreground/60" },
];

// ─── Sub-components ──────────────────────────────────────────────────

const ScoreRing = ({ score, size = 160, delta }: { score: number; size?: number; delta?: number }) => {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={12} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-display font-bold text-foreground">{score}</span>
        {delta !== undefined && <span className="text-[11px] font-display text-status-success">+{delta} pts</span>}
      </div>
    </div>
  );
};

const RadarChart = ({ size = 260 }: { size?: number }) => {
  const cx = size / 2, cy = size / 2, r = size / 2 - 32;
  const n = categories.length;
  const angleSlice = (2 * Math.PI) / n;
  const poly = (vals: number[]) => vals.map((s, i) => {
    const a = angleSlice * i - Math.PI / 2;
    return `${cx + (s / 100) * r * Math.cos(a)},${cy + (s / 100) * r * Math.sin(a)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} className="mx-auto">
      {[1, 2, 3, 4].map((li) => {
        const lr = (li / 4) * r;
        const pts = categories.map((_, i) => {
          const a = angleSlice * i - Math.PI / 2;
          return `${cx + lr * Math.cos(a)},${cy + lr * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={li} points={pts} fill="none" stroke="hsl(var(--muted))" strokeWidth={0.5} />;
      })}
      {categories.map((_, i) => {
        const a = angleSlice * i - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="hsl(var(--muted))" strokeWidth={0.5} />;
      })}
      <polygon points={poly(categories.map((c) => c.prev))} fill="hsl(0 0% 50% / 0.06)" stroke="hsl(0 0% 50% / 0.3)" strokeWidth={1} strokeDasharray="4 2" />
      <polygon points={poly(categories.map((c) => c.score))} fill="hsl(35 60% 50% / 0.12)" stroke="hsl(35 60% 50%)" strokeWidth={1.5} />
      {categories.map((cat, i) => {
        const a = angleSlice * i - Math.PI / 2;
        const pr = (cat.score / 100) * r;
        const lx = cx + (r + 22) * Math.cos(a);
        const ly = cy + (r + 22) * Math.sin(a);
        return (
          <g key={cat.key}>
            <circle cx={cx + pr * Math.cos(a)} cy={cy + pr * Math.sin(a)} r={3.5} fill="hsl(35 60% 50%)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-display">{cat.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

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

// ─── Main Page ───────────────────────────────────────────────────────

const LooksmaxScorePage = () => {
  const navigate = useNavigate();

  const overall = Math.round(categories.reduce((a, c) => a + c.score, 0) / categories.length);
  const prevOverall = Math.round(categories.reduce((a, c) => a + c.prev, 0) / categories.length);
  const delta = overall - prevOverall;
  const tier = tierThresholds.find((t) => overall >= t.min)!;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Looksmax Score</h1>
            <p className="text-muted-foreground text-[11px] font-display">Your complete attractiveness breakdown</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Hero Row */}
          <div className="grid sm:grid-cols-3 gap-4 opacity-0 animate-fade-in">
            {/* Overall Score */}
            <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
              <ScoreRing score={overall} size={150} delta={delta} />
              <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">OVERALL SCORE</h3>
              <span className={cn("text-[10px] font-display mt-1", tier.color)}>{tier.label}</span>
            </div>

            {/* Radar */}
            <div className="glass-card rounded-2xl p-5 flex flex-col items-center">
              <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-status-warning" /> BALANCE RADAR
              </h3>
              <p className="text-[8px] text-muted-foreground mb-1">Solid = now · Dashed = start</p>
              <RadarChart size={220} />
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              {[
                { label: "Best Area", value: categories.reduce((a, c) => c.score > a.score ? c : a).label, icon: <Trophy className="w-4 h-4 text-status-warning" /> },
                { label: "Weakest", value: categories.reduce((a, c) => c.score < a.score ? c : a).label, icon: <Target className="w-4 h-4 text-rose-400" /> },
                { label: "Avg Growth", value: `+${Math.round(delta / 8)}/wk`, icon: <TrendingUp className="w-4 h-4 text-status-success" /> },
                { label: "Percentile", value: tier.label, icon: <Star className="w-4 h-4 text-status-warning" /> },
                { label: "Total Gain", value: `+${delta} pts`, icon: <Zap className="w-4 h-4 text-silver" /> },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  {s.icon}
                  <div className="flex-1 flex justify-between">
                    <span className="text-[11px] font-display text-muted-foreground">{s.label}</span>
                    <span className="text-[11px] font-display font-bold text-foreground">{s.value}</span>
                  </div>
                </div>
              ))}
              {/* Mini trend */}
              <div className="pt-2 border-t border-border">
                <span className="text-[9px] font-display text-muted-foreground block mb-2">8-Week Trend</span>
                <div className="flex items-end gap-1 h-12">
                  {weeklyTrend.map((w, i) => (
                    <div key={w.week} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full rounded-sm" style={{
                        height: `${w.score}%`,
                        background: i === weeklyTrend.length - 1 ? "hsl(35 60% 50%)" : "hsl(0 0% 22%)",
                        transition: "height 0.8s ease-out",
                        transitionDelay: `${i * 0.05}s`,
                      }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[7px] font-display text-muted-foreground/50">W1</span>
                  <span className="text-[7px] font-display text-muted-foreground/50">W8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <SectionWrapper title="CATEGORY BREAKDOWN" icon={<Sparkles className="w-4 h-4 text-silver" />} delay="0.1s">
            <div className="space-y-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const gain = cat.score - cat.prev;
                const catTier = tierThresholds.find((t) => cat.score >= t.min)!;
                const barColor = cat.score >= 80 ? "hsl(142 50% 45%)" : cat.score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
                return (
                  <div key={cat.key} className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-silver" />
                        <span className="text-xs font-display font-bold text-foreground group-hover:text-silver transition-colors">{cat.label}</span>
                        <span className={cn("text-[9px] font-display", catTier.color)}>{catTier.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground">{cat.prev}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                        <span className="text-sm font-display font-bold text-foreground">{cat.score}</span>
                        <span className="text-[9px] font-display text-status-success">+{gain}</span>
                      </div>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                      <div className="absolute h-full rounded-full opacity-20" style={{ width: `${cat.prev}%`, background: barColor }} />
                      <div className="h-full rounded-full" style={{ width: `${cat.score}%`, background: barColor, transition: "width 1s ease-out" }} />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {cat.sub.map((s) => (
                        <div key={s.label} className="text-center">
                          <span className="text-sm font-display font-bold text-foreground block">{s.score}</span>
                          <span className="text-[8px] font-display text-muted-foreground">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>

          {/* Improvement Priority */}
          <SectionWrapper title="IMPROVEMENT PRIORITY" icon={<TrendingUp className="w-4 h-4 text-status-success" />} delay="0.2s">
            <div className="space-y-2">
              {[...categories].sort((a, b) => a.score - b.score).map((cat, i) => {
                const Icon = cat.icon;
                const potential = 100 - cat.score;
                return (
                  <div key={cat.key} className="flex items-center gap-3 glass-card rounded-xl px-4 py-3">
                    <span className="text-[10px] font-display font-bold text-muted-foreground w-4">{i + 1}</span>
                    <Icon className="w-4 h-4 text-silver" />
                    <span className="text-xs font-display font-bold text-foreground flex-1">{cat.label}</span>
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${potential}%`,
                        background: potential >= 30 ? "hsl(35 60% 50%)" : "hsl(142 50% 45%)",
                        transition: "width 0.8s ease-out",
                      }} />
                    </div>
                    <span className="text-[10px] font-display text-muted-foreground w-16 text-right">+{potential} potential</span>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>

        </div>
      </main>
    </div>
  );
};

export default LooksmaxScorePage;
