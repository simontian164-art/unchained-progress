import { useState } from "react";
import { cn } from "@/lib/utils";
import ModulePageLayout from "@/components/ModulePageLayout";
import {
  TrendingUp, Star, ChevronDown, ChevronUp, CheckCircle,
  Zap, Mic, Shield, Eye, Users, Sparkles, RotateCcw,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const bodyLanguageCards = [
  { title: "Power Posture", desc: "Shoulders back, chest open, feet shoulder-width", impact: "high", category: "Posture" },
  { title: "Purposeful Walk", desc: "Slightly slower pace, head up, destination clear", impact: "high", category: "Movement" },
  { title: "3-5s Eye Contact", desc: "Hold naturally, break downward, not sideways", impact: "high", category: "Eye Contact" },
  { title: "Stillness Under Pressure", desc: "Don't fidget, react slowly, maintain composure", impact: "medium", category: "Stillness" },
  { title: "Intentional Gestures", desc: "Hands emphasize points, no random waving", impact: "medium", category: "Movement" },
  { title: "Triangle Gaze", desc: "Alternate between eyes and mouth for natural flow", impact: "medium", category: "Eye Contact" },
  { title: "Take Up Space", desc: "Open body, relaxed arms, don't shrink", impact: "high", category: "Posture" },
  { title: "Slow Head Turns", desc: "Turn head deliberately, not snapping to stimuli", impact: "low", category: "Stillness" },
];

const postureChecklist = [
  "Hourly posture check", "Shoulders back while seated", "Chin neutral (not tucked/lifted)",
  "Feet flat when sitting", "Walk with spine straight", "No phone slouch",
];

const voiceTips = [
  { label: "Diaphragm Breathing", detail: "Deeper resonance, more authority without yelling" },
  { label: "Downward Inflection", detail: "Statements end down. Questions go up. Know the difference." },
  { label: "Eliminate Fillers", detail: "'Um', 'like', 'you know' — replace with pauses" },
  { label: "Pace Control", detail: "Slower = more commanding. Let words land." },
];

const dailyPractice = [
  "Record yourself speaking 2 min — watch for filler words & posture",
  "Practice walking slowly in public — time yourself",
  "Next conversation: hold eye contact 50%+ while listening",
  "One meeting: eliminate all filler words, use pauses instead",
];

const weeklyProgress = [52, 58, 55, 65, 62, 72, 74];

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

const MiniBar = ({ score, label }: { score: number; label: string }) => {
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-[11px] font-display text-muted-foreground">{label}</span>
        <span className="text-[11px] font-display font-bold text-foreground">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, transition: "width 1s ease-out" }} />
      </div>
    </div>
  );
};

const SliderControl = ({ label, value, onChange, icon }: {
  label: string; value: number; onChange: (v: number) => void; icon: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">{icon}<span className="text-xs font-display text-foreground">{label}</span></div>
      <span className="text-xs font-display font-bold text-foreground">{value}%</span>
    </div>
    <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
  </div>
);

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

const RadarChart = ({ scores, labels, size = 220 }: { scores: number[]; labels: string[]; size?: number }) => {
  const cx = size / 2, cy = size / 2, levels = 4;
  const r = size / 2 - 26;
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
      <polygon points={polyPoints} fill="hsl(160 50% 45% / 0.12)" stroke="hsl(160 50% 45%)" strokeWidth={1.5} />
      {scores.map((s, i) => {
        const a = angleSlice * i - Math.PI / 2;
        const pr = (s / 100) * r;
        const lx = cx + (r + 18) * Math.cos(a);
        const ly = cy + (r + 18) * Math.sin(a);
        return (
          <g key={`g${i}`}>
            <circle cx={cx + pr * Math.cos(a)} cy={cy + pr * Math.sin(a)} r={3} fill="hsl(160 50% 45%)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-display">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────

const PresenceMaxPage = () => {
  const [confidence, setConfidence] = useState(68);
  const [eyeContact, setEyeContact] = useState(72);
  const [voiceDepth, setVoiceDepth] = useState(60);
  const [voicePace, setVoicePace] = useState(55);
  const [posture, setPosture] = useState(74);
  const [calmness, setCalmness] = useState(65);

  const [postureChecked, setPostureChecked] = useState<Set<string>>(new Set(["Hourly posture check"]));
  const togglePosture = (item: string) => {
    const next = new Set(postureChecked);
    next.has(item) ? next.delete(item) : next.add(item);
    setPostureChecked(next);
  };

  // Simulated scores
  const voiceScore = Math.round((voiceDepth + voicePace) / 2);
  const charisma = Math.round((confidence * 0.25 + eyeContact * 0.2 + voiceScore * 0.2 + posture * 0.15 + calmness * 0.2));
  const overallSocial = Math.round((charisma + posture + voiceScore + confidence) / 4);
  const postureProgress = Math.round((postureChecked.size / postureChecklist.length) * 100);

  const radarScores = [confidence, eyeContact, posture, voiceScore, calmness, charisma];
  const radarLabels = ["Confidence", "Eye Contact", "Posture", "Voice", "Calmness", "Charisma"];

  return (
    <ModulePageLayout title="SOCIAL MAX" subtitle="Confidence, presence, and how you're perceived.">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Dashboard Top Row */}
        <div className="grid sm:grid-cols-3 gap-4 opacity-0 animate-fade-in">
          <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
            <ScoreRing score={overallSocial} size={130} />
            <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">SOCIAL SCORE</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Combined presence rating</p>
          </div>

          <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
            <RadarChart scores={radarScores} labels={radarLabels} size={200} />
          </div>

          <div className="space-y-3">
            {[
              { label: "Charisma", score: charisma, icon: <Star className="w-4 h-4 text-status-warning" /> },
              { label: "Confidence", score: confidence, icon: <Shield className="w-4 h-4 text-silver" /> },
              { label: "Voice", score: voiceScore, icon: <Mic className="w-4 h-4 text-sky-400" /> },
              { label: "Posture", score: posture, icon: <Zap className="w-4 h-4 text-rose-400" /> },
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

        {/* Confidence & Charisma Sliders */}
        <SectionWrapper title="CONFIDENCE CALCULATOR" icon={<Shield className="w-4.5 h-4.5 text-silver" />} delay="0.1s">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-4">
              <SliderControl label="Self-Confidence" value={confidence} onChange={setConfidence} icon={<Shield className="w-3.5 h-3.5 text-silver" />} />
              <SliderControl label="Eye Contact Comfort" value={eyeContact} onChange={setEyeContact} icon={<Eye className="w-3.5 h-3.5 text-sky-400" />} />
              <SliderControl label="Calmness Under Pressure" value={calmness} onChange={setCalmness} icon={<Sparkles className="w-3.5 h-3.5 text-status-warning" />} />
            </div>
            <div className="space-y-3">
              <div className="glass-card-strong rounded-xl p-5 text-center shine-line">
                <div className="text-3xl font-display font-bold text-foreground">{charisma}</div>
                <div className="text-[10px] text-muted-foreground font-display mt-1">Charisma Rating</div>
                <div className={cn("text-xs font-display font-bold mt-2",
                  charisma >= 80 ? "text-status-success" : charisma >= 65 ? "text-status-warning" : "text-muted-foreground"
                )}>{charisma >= 80 ? "Magnetic" : charisma >= 70 ? "Compelling" : charisma >= 60 ? "Developing" : "Building"}</div>
              </div>
              <MiniBar score={charisma} label="Charisma Score" />
              <MiniBar score={overallSocial} label="Overall Social" />
            </div>
          </div>
        </SectionWrapper>

        {/* Voice Attractiveness */}
        <SectionWrapper title="VOICE ATTRACTIVENESS" icon={<Mic className="w-4.5 h-4.5 text-sky-400" />} delay="0.15s">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-4">
              <SliderControl label="Voice Depth" value={voiceDepth} onChange={setVoiceDepth} icon={<Mic className="w-3.5 h-3.5 text-sky-400" />} />
              <SliderControl label="Speaking Pace" value={voicePace} onChange={setVoicePace} icon={<RotateCcw className="w-3.5 h-3.5 text-silver" />} />
              <MiniBar score={voiceScore} label="Combined Voice Score" />
            </div>
            <div className="space-y-2">
              {voiceTips.map((tip) => (
                <div key={tip.label} className="glass-card rounded-xl p-3 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift group">
                  <span className="text-xs font-display font-bold text-foreground group-hover:text-silver transition-colors">{tip.label}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{tip.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>

        {/* Posture Tracker */}
        <SectionWrapper title="POSTURE TRACKER" icon={<Zap className="w-4.5 h-4.5 text-rose-400" />} delay="0.2s">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-4">
              <SliderControl label="Posture Quality" value={posture} onChange={setPosture} icon={<Zap className="w-3.5 h-3.5 text-rose-400" />} />
              <div className="pt-1">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-display text-muted-foreground">Daily Checklist</span>
                  <span className="text-[10px] font-display font-bold text-foreground">{postureChecked.size}/{postureChecklist.length}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${postureProgress}%`,
                    background: postureProgress >= 80 ? "hsl(142 50% 45%)" : "linear-gradient(90deg, hsl(35 60% 40%), hsl(35 60% 55%))",
                    transition: "width 0.8s ease-out",
                  }} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {postureChecklist.map((item) => (
                <button key={item} onClick={() => togglePosture(item)}
                  className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-muted/20 transition-colors group">
                  <div className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-300",
                    postureChecked.has(item) ? "bg-status-success/20 border-status-success scale-110" : "border-muted-foreground/30 group-hover:border-muted-foreground/60"
                  )}>
                    {postureChecked.has(item) && <CheckCircle className="w-3.5 h-3.5 text-status-success" />}
                  </div>
                  <span className={cn("text-xs transition-all duration-300", postureChecked.has(item) ? "text-muted-foreground line-through" : "text-foreground")}>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </SectionWrapper>

        {/* Body Language Training */}
        <SectionWrapper title="BODY LANGUAGE TRAINING" icon={<Users className="w-4.5 h-4.5 text-status-warning" />} delay="0.25s">
          <div className="grid sm:grid-cols-2 gap-3">
            {bodyLanguageCards.map((card) => (
              <div key={card.title} className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display font-bold text-foreground group-hover:text-silver transition-colors">{card.title}</span>
                  <span className={cn("text-[9px] font-display px-1.5 py-0.5 rounded-full",
                    card.impact === "high" ? "bg-status-warning/10 text-status-warning" : card.impact === "medium" ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground/60"
                  )}>{card.impact}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-1">{card.desc}</p>
                <span className="text-[9px] font-display text-silver">{card.category}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Weekly Progress */}
        <SectionWrapper title="SOCIAL PROGRESS" icon={<TrendingUp className="w-4.5 h-4.5 text-status-success" />} delay="0.3s">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <span className="text-[10px] font-display text-muted-foreground mb-2 block">WEEKLY SOCIAL SCORE</span>
              <div className="flex items-end gap-1.5 h-20">
                {weeklyProgress.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-sm hover:opacity-80 transition-opacity" style={{
                      height: `${val}%`,
                      background: i === weeklyProgress.length - 1 ? "hsl(160 50% 45%)" : "hsl(0 0% 22%)",
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
            <div>
              <span className="text-[10px] font-display text-muted-foreground mb-2 block">DAILY PRACTICE</span>
              <div className="space-y-2">
                {dailyPractice.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 glass-card rounded-lg px-3 py-2">
                    <span className="text-[10px] font-display text-status-warning mt-0.5">{i + 1}.</span>
                    <span className="text-[11px] text-muted-foreground">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

      </div>
    </ModulePageLayout>
  );
};

export default PresenceMaxPage;
