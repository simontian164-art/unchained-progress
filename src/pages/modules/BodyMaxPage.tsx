import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ModulePageLayout from "@/components/ModulePageLayout";
import {
  Dumbbell, TrendingUp, Target, Star, ChevronDown, ChevronUp,
  CheckCircle, Zap, ArrowRight, RotateCcw,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const muscleGroups = [
  { label: "Shoulders", left: 82, right: 84 },
  { label: "Chest", left: 78, right: 80 },
  { label: "Arms", left: 75, right: 79 },
  { label: "Back", left: 80, right: 81 },
  { label: "Quads", left: 76, right: 74 },
  { label: "Calves", left: 68, right: 70 },
];

const weeklyProgress = [62, 65, 64, 70, 68, 74, 76];

const trainingRoutine = [
  { day: "DAY A: Push", exercises: "Bench 3×8, OHP 3×8, Lateral Raise 3×15, Tricep Pushdown 3×12" },
  { day: "DAY B: Pull", exercises: "Deadlift 3×5, Row 3×8, Face Pull 3×15, Bicep Curl 3×12" },
  { day: "DAY C: Legs", exercises: "Squat 3×8, RDL 3×10, Leg Press 3×12, Calf Raise 3×15" },
];

const bodyTips = [
  { title: "Body Composition", items: [
    { point: "Target 12-18% body fat", detail: "Face structure shows here. Lower isn't always better for appearance." },
    { point: "Prioritize protein", detail: "0.8-1g per lb of bodyweight. Non-negotiable." },
    { point: "Track calories briefly", detail: "2 weeks teaches portion intuition. Then stop obsessing." },
  ]},
  { title: "Visual Priorities", items: [
    { point: "Shoulders > everything", detail: "Wide shoulders create V-taper. Lateral raises, OHP, lots of volume." },
    { point: "Neck training", detail: "Thick neck = more masculine appearance. Simple exercises work." },
    { point: "Forearms show", detail: "Most visible muscle in casual clothes. Hammer curls, wrist work." },
  ]},
  { title: "Posture", items: [
    { point: "Forward head = instant -1", detail: "Ears should align with shoulders. Check yourself in mirrors." },
    { point: "Rounded shoulders fix", detail: "Face pulls, external rotations, chest stretches. Daily." },
    { point: "Stand like you matter", detail: "Shoulders back, chin neutral, weight even." },
  ]},
];

const radarLabels = ["Shoulders", "Chest", "Back", "Arms", "Core", "Quads", "Calves", "Posture"];

// ─── Sub-components ──────────────────────────────────────────────────

const ScoreRing = ({ score, size = 120, label }: { score: number; size?: number; label?: string }) => {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={8} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold text-foreground">{score}</span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      {label && <span className="text-[11px] font-display text-muted-foreground mt-2">{label}</span>}
    </div>
  );
};

const MiniBar = ({ score, label, showValue = true }: { score: number; label: string; showValue?: boolean }) => {
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-[11px] font-display text-muted-foreground">{label}</span>
        {showValue && <span className="text-[11px] font-display font-bold text-foreground">{score}</span>}
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, transition: "width 1s ease-out" }} />
      </div>
    </div>
  );
};

const RadarChart = ({ scores, size = 230 }: { scores: number[]; size?: number }) => {
  const cx = size / 2, cy = size / 2, levels = 4;
  const r = size / 2 - 28;
  const n = scores.length;
  const angleSlice = (2 * Math.PI) / n;

  const polyPoints = scores.map((s, i) => {
    const a = angleSlice * i - Math.PI / 2;
    const pr = (s / 100) * r;
    return `${cx + pr * Math.cos(a)},${cy + pr * Math.sin(a)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} className="mx-auto">
      {Array.from({ length: levels }).map((_, li) => {
        const lr = ((li + 1) / levels) * r;
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
      <polygon points={polyPoints} fill="hsl(25 80% 50% / 0.12)" stroke="hsl(25 80% 50%)" strokeWidth={1.5} />
      {scores.map((s, i) => {
        const a = angleSlice * i - Math.PI / 2;
        const pr = (s / 100) * r;
        const lx = cx + (r + 18) * Math.cos(a);
        const ly = cy + (r + 18) * Math.sin(a);
        return (
          <g key={`g${i}`}>
            <circle cx={cx + pr * Math.cos(a)} cy={cy + pr * Math.sin(a)} r={3} fill="hsl(25 80% 50%)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-display">{radarLabels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

const SymmetryBar = ({ label, left, right }: { label: string; left: number; right: number }) => {
  const diff = Math.abs(left - right);
  const statusColor = diff <= 2 ? "text-status-success" : diff <= 5 ? "text-status-warning" : "text-destructive";
  const statusLabel = diff <= 2 ? "Balanced" : diff <= 5 ? "Slight imbalance" : "Imbalanced";
  return (
    <div className="glass-card rounded-xl p-3 hover:ring-1 hover:ring-silver/15 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-display font-bold text-foreground">{label}</span>
        <span className={cn("text-[9px] font-display", statusColor)}>{statusLabel}</span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-[9px] font-display text-muted-foreground w-5">L</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${left}%`, background: "hsl(210 50% 50%)", transition: "width 0.8s" }} />
        </div>
        <span className="text-[10px] font-display font-bold text-foreground w-6 text-center">{left}</span>
      </div>
      <div className="flex gap-2 items-center mt-1">
        <span className="text-[9px] font-display text-muted-foreground w-5">R</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${right}%`, background: "hsl(25 70% 50%)", transition: "width 0.8s" }} />
        </div>
        <span className="text-[10px] font-display font-bold text-foreground w-6 text-center">{right}</span>
      </div>
    </div>
  );
};

const SectionWrapper = ({ title, icon, children, delay = "0s" }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: string }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card rounded-2xl overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: delay }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl glass-card-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h2 className="font-display font-bold text-foreground text-sm tracking-wide">{title}</h2>
        </div>
        <div className={cn("transition-transform duration-300", open && "rotate-180")}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
      <div className={cn("grid transition-all duration-500 ease-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden"><div className="px-5 pb-5 space-y-5">{children}</div></div>
      </div>
    </div>
  );
};

const SliderControl = ({ label, value, onChange, unit = "%", icon }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; icon: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">{icon}<span className="text-xs font-display text-foreground">{label}</span></div>
      <span className="text-xs font-display font-bold text-foreground">{value}{unit}</span>
    </div>
    <input type="range" min={5} max={40} value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────

const BodyMaxPage = () => {
  const navigate = useNavigate();
  const [bodyFat, setBodyFat] = useState(16);
  const [shoulders, setShoulders] = useState(48);
  const [waist, setWaist] = useState(32);

  // Simulated scores
  const ratio = shoulders / waist;
  const vTaperScore = Math.min(100, Math.round((ratio - 1) * 120));
  const ratioGrade = ratio >= 1.618 ? "Golden" : ratio >= 1.5 ? "Excellent" : ratio >= 1.4 ? "Good" : "Developing";
  const bfScore = bodyFat <= 12 ? 92 : bodyFat <= 15 ? 82 : bodyFat <= 18 ? 70 : bodyFat <= 22 ? 55 : 40;
  const physiqueScore = Math.round((vTaperScore + bfScore + 78 + 80) / 4);
  const radarScores = [82, 78, 80, 77, 74, 76, 69, 75];

  return (
    <ModulePageLayout title="BODY MAX" subtitle="Training, composition, and physique optimization.">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Dashboard Row */}
        <div className="grid sm:grid-cols-3 gap-4 opacity-0 animate-fade-in">
          <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
            <ScoreRing score={physiqueScore} size={130} />
            <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">PHYSIQUE SCORE</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Combined attractiveness rating</p>
          </div>

          <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
            <RadarChart scores={radarScores} size={210} />
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            {[
              { label: "V-Taper", score: vTaperScore, icon: <Target className="w-4 h-4 text-status-warning" /> },
              { label: "Body Fat", score: bfScore, icon: <Zap className="w-4 h-4 text-silver" /> },
              { label: "Symmetry", score: 78, icon: <RotateCcw className="w-4 h-4 text-sky-400" /> },
              { label: "Posture", score: 75, icon: <Dumbbell className="w-4 h-4 text-rose-400" /> },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-3 flex items-center gap-3 hover:ring-1 hover:ring-silver/15 transition-all duration-300">
                {s.icon}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-display text-muted-foreground">{s.label}</span>
                    <span className="text-[11px] font-display font-bold text-foreground">{s.score}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
                    <div className="h-full rounded-full" style={{
                      width: `${s.score}%`,
                      background: s.score >= 80 ? "hsl(142 50% 45%)" : s.score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)",
                      transition: "width 1s ease-out",
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* V-Taper Calculator */}
        <SectionWrapper title="V-TAPER CALCULATOR" icon={<Target className="w-4.5 h-4.5 text-status-warning" />} delay="0.1s">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display text-foreground">Shoulder Width (inches)</span>
                  <span className="text-xs font-display font-bold text-foreground">{shoulders}"</span>
                </div>
                <input type="range" min={36} max={56} value={shoulders} onChange={(e) => setShoulders(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display text-foreground">Waist Width (inches)</span>
                  <span className="text-xs font-display font-bold text-foreground">{waist}"</span>
                </div>
                <input type="range" min={24} max={44} value={waist} onChange={(e) => setWaist(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
              </div>
              <SliderControl label="Body Fat %" value={bodyFat} onChange={setBodyFat} icon={<Zap className="w-3.5 h-3.5 text-silver" />} />
            </div>
            <div className="space-y-4">
              <div className="glass-card-strong rounded-xl p-5 text-center shine-line">
                <div className="text-3xl font-display font-bold text-foreground">{ratio.toFixed(2)}</div>
                <div className="text-[10px] text-muted-foreground font-display mt-1">Shoulder-to-Waist Ratio</div>
                <div className={cn("text-xs font-display font-bold mt-2",
                  ratio >= 1.618 ? "text-status-success" : ratio >= 1.5 ? "text-status-warning" : "text-muted-foreground"
                )}>{ratioGrade}</div>
                <div className="text-[9px] text-muted-foreground mt-1">Golden ratio target: 1.618</div>
              </div>
              <MiniBar score={vTaperScore} label="V-Taper Score" />
              <MiniBar score={bfScore} label="Body Composition Score" />
              <div className="glass-card rounded-xl p-3">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-success" />
                  {ratio >= 1.5 ? "Great V-taper. Focus on maintaining lean mass." : "Build shoulder width with lateral raises & OHP volume."}
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Muscle Symmetry */}
        <SectionWrapper title="MUSCLE SYMMETRY" icon={<RotateCcw className="w-4.5 h-4.5 text-sky-400" />} delay="0.2s">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {muscleGroups.map((mg) => (
              <SymmetryBar key={mg.label} {...mg} />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full" style={{ background: "hsl(210 50% 50%)" }} />
              <span className="text-[9px] text-muted-foreground font-display">Left</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full" style={{ background: "hsl(25 70% 50%)" }} />
              <span className="text-[9px] text-muted-foreground font-display">Right</span>
            </div>
          </div>
        </SectionWrapper>

        {/* Progress Tracker */}
        <SectionWrapper title="PHYSIQUE PROGRESS" icon={<TrendingUp className="w-4.5 h-4.5 text-status-success" />} delay="0.3s">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <span className="text-[10px] font-display text-muted-foreground mb-2 block">WEEKLY PHYSIQUE RATING</span>
              <div className="flex items-end gap-1.5 h-24">
                {weeklyProgress.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] text-muted-foreground font-display">{val}</span>
                    <div className="w-full rounded-sm hover:opacity-80 transition-opacity" style={{
                      height: `${val}%`,
                      background: i === weeklyProgress.length - 1 ? "hsl(25 80% 50%)" : "hsl(0 0% 22%)",
                      transition: "height 0.8s ease-out",
                      transitionDelay: `${i * 0.06}s`,
                    }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className={cn("text-[9px] font-display flex-1 text-center", i === 6 ? "text-foreground" : "text-muted-foreground/60")}>{d}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-5 h-5 text-status-warning" />
                  <div>
                    <span className="text-xs font-display font-bold text-foreground">PHYSIQUE LEVEL 4</span>
                    <span className="text-[10px] text-muted-foreground block">180 XP to Level 5</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: "68%",
                    background: "linear-gradient(90deg, hsl(25 70% 40%), hsl(25 70% 55%))",
                    transition: "width 1.5s ease-out",
                  }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground">820 XP</span>
                  <span className="text-[9px] text-muted-foreground">1000 XP</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {["Today: 76 — Best this week", "Yesterday: 74 — +2 from Tuesday", "3 days ago: 70 — Solid session"].map((e) => (
                  <div key={e} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-silver shrink-0" /> {e}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Knowledge Sections */}
        {bodyTips.map((section, si) => (
          <SectionWrapper key={section.title} title={section.title.toUpperCase()} icon={<Dumbbell className="w-4.5 h-4.5 text-silver" />} delay={`${0.4 + si * 0.05}s`}>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.point} className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift group">
                  <h3 className="font-display font-medium text-foreground mb-1 group-hover:text-silver transition-colors">{item.point}</h3>
                  <p className="text-muted-foreground text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>
        ))}

        {/* Starter Routine */}
        <div className="glass-card-strong rounded-2xl p-6 ring-1 ring-silver/10 opacity-0 animate-fade-in" style={{ animationDelay: "0.55s" }}>
          <h2 className="text-sm font-display font-bold text-foreground mb-4 tracking-wide">STARTER ROUTINE (3×/WEEK)</h2>
          <div className="space-y-3">
            {trainingRoutine.map((r) => (
              <div key={r.day} className="glass-card rounded-xl p-3 hover:bg-muted/20 transition-colors">
                <div className="text-xs font-display font-bold text-foreground mb-1">{r.day}</div>
                <div className="text-muted-foreground text-[11px]">{r.exercises}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ModulePageLayout>
  );
};

export default BodyMaxPage;
