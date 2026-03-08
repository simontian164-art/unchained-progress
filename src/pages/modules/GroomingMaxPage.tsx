import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Scissors, Sparkles, SmilePlus, Crown, CheckCircle,
  TrendingUp, ChevronDown, ChevronUp, Droplets, Sun, Star,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const beardStyles = [
  { name: "Designer Stubble", match: 92 }, { name: "Short Boxed", match: 88 },
  { name: "Corporate", match: 85 }, { name: "Classic Goatee", match: 78 },
  { name: "Van Dyke", match: 74 }, { name: "Full Beard", match: 70 },
  { name: "Circle Beard", match: 67 }, { name: "Balbo", match: 63 },
  { name: "Anchor", match: 58 }, { name: "Chevron Mustache", match: 52 },
];

const hairstyles = [
  { name: "Textured Crop", shape: "Oval", suitability: 95 },
  { name: "Side Part", shape: "Square", suitability: 90 },
  { name: "Buzz Cut", shape: "Oval", suitability: 85 },
  { name: "Quiff", shape: "Heart", suitability: 88 },
  { name: "Undercut", shape: "Round", suitability: 82 },
  { name: "Slick Back", shape: "Oblong", suitability: 78 },
];

const skincareChecklist = [
  "Cleanser (AM)", "Sunscreen SPF 50", "Vitamin C Serum", "Moisturizer (AM)",
  "Cleanser (PM)", "Retinol (PM)", "Hydrating Toner", "Eye Cream",
];

const dentalChecklist = [
  "Brush 2x daily", "Floss daily", "Mouthwash", "Tongue scraper",
  "Whitening strips (weekly)", "Dental checkup (6mo)",
];

const beardChecklist = [
  "Wash beard 3x/week", "Apply beard oil daily", "Brush/comb daily",
  "Trim neckline weekly", "Condition after wash", "Shape cheek line",
];

const radarCategories = ["Hair", "Beard", "Skin", "Dental", "Hygiene", "Nails", "Fragrance", "Brows"];

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

const ChecklistGroup = ({ items, checked, onToggle }: { items: string[]; checked: Set<string>; onToggle: (item: string) => void }) => (
  <div className="space-y-2">
    {items.map((item) => (
      <button key={item} onClick={() => onToggle(item)}
        className="flex items-center gap-3 w-full text-left group">
        <div className={cn(
          "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all",
          checked.has(item) ? "bg-status-success/20 border-status-success" : "border-muted-foreground/30 hover:border-muted-foreground/60"
        )}>
          {checked.has(item) && <CheckCircle className="w-3.5 h-3.5 text-status-success" />}
        </div>
        <span className={cn("text-xs transition-colors", checked.has(item) ? "text-muted-foreground line-through" : "text-foreground")}>{item}</span>
      </button>
    ))}
  </div>
);

const RadarChart = ({ scores, size = 220 }: { scores: number[]; size?: number }) => {
  const cx = size / 2, cy = size / 2, levels = 4;
  const r = size / 2 - 24;
  const angleSlice = (2 * Math.PI) / scores.length;

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
      <polygon points={polyPoints} fill="hsl(142 50% 45% / 0.15)" stroke="hsl(142 50% 45%)" strokeWidth={1.5} />
      {scores.map((s, i) => {
        const a = angleSlice * i - Math.PI / 2;
        const pr = (s / 100) * r;
        const lx = cx + (r + 16) * Math.cos(a);
        const ly = cy + (r + 16) * Math.sin(a);
        return (
          <g key={i}>
            <circle cx={cx + pr * Math.cos(a)} cy={cy + pr * Math.sin(a)} r={3} fill="hsl(142 50% 45%)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-display">{radarCategories[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

const SliderControl = ({ label, value, onChange, icon }: { label: string; value: number; onChange: (v: number) => void; icon: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-display text-foreground">{label}</span>
      </div>
      <span className="text-xs font-display font-bold text-foreground">{value}%</span>
    </div>
    <input type="range" min={0} max={100} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
  </div>
);

// ─── Section Components ──────────────────────────────────────────────

const SectionWrapper = ({ title, icon, children, delay = "0s" }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: string }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card rounded-2xl overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: delay }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="font-display font-bold text-foreground text-sm tracking-wide">{title}</h2>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-5">{children}</div>}
    </div>
  );
};

const HaircareSection = ({ sliders, setSlider }: { sliders: Record<string, number>; setSlider: (k: string, v: number) => void }) => {
  const hairScore = Math.round((sliders.hairlineStrength + sliders.hairHealth) / 2);
  return (
    <SectionWrapper title="HAIRCARE" icon={<Crown className="w-5 h-5 text-status-warning" />} delay="0.1s">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          <SliderControl label="Hairline Strength" value={sliders.hairlineStrength} onChange={(v) => setSlider("hairlineStrength", v)} icon={<Crown className="w-3.5 h-3.5 text-status-warning" />} />
          <SliderControl label="Hair Health" value={sliders.hairHealth} onChange={(v) => setSlider("hairHealth", v)} icon={<Sparkles className="w-3.5 h-3.5 text-silver" />} />
          <MiniBar score={hairScore} label="Combined Hair Score" />
          <div className="glass-card rounded-xl p-3">
            <span className="text-[10px] font-display text-muted-foreground">BARBER VISIT TRACKER</span>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "65%", background: "hsl(35 60% 50%)", transition: "width 0.8s" }} />
              </div>
              <span className="text-[10px] text-muted-foreground">18 days ago</span>
            </div>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-display text-muted-foreground mb-2 block">HAIRSTYLE RECOMMENDATIONS</span>
          <div className="space-y-2">
            {hairstyles.map((h, i) => (
              <div key={h.name} className="flex items-center justify-between glass-card rounded-lg px-3 py-2">
                <div>
                  <span className="text-xs font-display text-foreground">{h.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">({h.shape})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${h.suitability}%`, background: h.suitability >= 85 ? "hsl(142 50% 45%)" : "hsl(35 60% 50%)", transition: "width 0.5s" }} />
                  </div>
                  <span className="text-[10px] font-display font-bold text-foreground w-7 text-right">{h.suitability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

const BeardSection = ({ sliders, setSlider, beardChecked, toggleBeardCheck }: {
  sliders: Record<string, number>; setSlider: (k: string, v: number) => void;
  beardChecked: Set<string>; toggleBeardCheck: (item: string) => void;
}) => (
  <SectionWrapper title="BEARD" icon={<Scissors className="w-5 h-5 text-silver" />} delay="0.2s">
    <div className="grid sm:grid-cols-2 gap-5">
      <div className="space-y-4">
        <SliderControl label="Beard Density" value={sliders.beardDensity} onChange={(v) => setSlider("beardDensity", v)} icon={<Scissors className="w-3.5 h-3.5 text-silver" />} />
        <MiniBar score={sliders.beardDensity} label="Density Score" />
        <div className="glass-card rounded-xl p-3">
          <span className="text-[10px] font-display text-muted-foreground mb-2 block">BEARD GROWTH PROGRESS</span>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min(sliders.beardDensity + 10, 100)}%`, background: "linear-gradient(90deg, hsl(0 0% 40%), hsl(0 0% 70%))", transition: "width 0.8s" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground">Week 1</span>
            <span className="text-[9px] text-muted-foreground">Week 12</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-display text-muted-foreground mb-2 block">GROOMING CHECKLIST</span>
          <ChecklistGroup items={beardChecklist} checked={beardChecked} onToggle={toggleBeardCheck} />
        </div>
      </div>
      <div>
        <span className="text-[10px] font-display text-muted-foreground mb-2 block">BEARD STYLE SELECTOR (10 STYLES)</span>
        <div className="space-y-2">
          {beardStyles.map((b, i) => (
            <div key={b.name} className="flex items-center justify-between glass-card rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-display text-muted-foreground w-4">{i + 1}.</span>
                <span className="text-xs font-display text-foreground">{b.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.match}%`, background: b.match >= 80 ? "hsl(142 50% 45%)" : b.match >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)", transition: "width 0.5s" }} />
                </div>
                <span className="text-[10px] font-display font-bold text-foreground w-7 text-right">{b.match}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </SectionWrapper>
);

const SkincareSection = ({ sliders, setSlider, skinChecked, toggleSkinCheck }: {
  sliders: Record<string, number>; setSlider: (k: string, v: number) => void;
  skinChecked: Set<string>; toggleSkinCheck: (item: string) => void;
}) => {
  const skinScore = Math.round((sliders.skinHealth + (100 - sliders.acneSeverity) + sliders.hydration) / 3);
  return (
    <SectionWrapper title="SKINCARE" icon={<Sparkles className="w-5 h-5 text-rose-400" />} delay="0.3s">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          <SliderControl label="Skin Health" value={sliders.skinHealth} onChange={(v) => setSlider("skinHealth", v)} icon={<Sun className="w-3.5 h-3.5 text-status-warning" />} />
          <SliderControl label="Acne Severity" value={sliders.acneSeverity} onChange={(v) => setSlider("acneSeverity", v)} icon={<Droplets className="w-3.5 h-3.5 text-rose-400" />} />
          <SliderControl label="Hydration Level" value={sliders.hydration} onChange={(v) => setSlider("hydration", v)} icon={<Droplets className="w-3.5 h-3.5 text-sky-400" />} />
          <MiniBar score={skinScore} label="Combined Skin Score" />
          <div className="glass-card rounded-xl p-3">
            <span className="text-[10px] font-display text-muted-foreground mb-2 block">SKIN GLOW PROGRESS</span>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${skinScore}%`, background: "linear-gradient(90deg, hsl(35 60% 40%), hsl(35 60% 60%))", transition: "width 0.8s" }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">Start</span>
              <span className="text-[9px] text-foreground font-bold">{skinScore}%</span>
            </div>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-display text-muted-foreground mb-2 block">DAILY SKINCARE ROUTINE</span>
          <ChecklistGroup items={skincareChecklist} checked={skinChecked} onToggle={toggleSkinCheck} />
        </div>
      </div>
    </SectionWrapper>
  );
};

const DentalSection = ({ sliders, setSlider, dentalChecked, toggleDentalCheck }: {
  sliders: Record<string, number>; setSlider: (k: string, v: number) => void;
  dentalChecked: Set<string>; toggleDentalCheck: (item: string) => void;
}) => {
  const smileScore = Math.round((sliders.teethWhiteness * 0.6 + 80 * 0.4));
  return (
    <SectionWrapper title="DENTAL" icon={<SmilePlus className="w-5 h-5 text-sky-400" />} delay="0.4s">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          <SliderControl label="Teeth Whiteness" value={sliders.teethWhiteness} onChange={(v) => setSlider("teethWhiteness", v)} icon={<Star className="w-3.5 h-3.5 text-foreground" />} />
          <MiniBar score={smileScore} label="Smile Attractiveness" />
          {/* Before / After mock */}
          <div className="glass-card rounded-xl p-3">
            <span className="text-[10px] font-display text-muted-foreground mb-2 block">WHITENING VISUALIZATION</span>
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg h-16 flex items-center justify-center" style={{ background: `hsl(40 30% ${20 + sliders.teethWhiteness * 0.1}%)` }}>
                <span className="text-[10px] font-display text-muted-foreground">Before</span>
              </div>
              <div className="flex-1 rounded-lg h-16 flex items-center justify-center" style={{ background: `hsl(40 10% ${40 + sliders.teethWhiteness * 0.45}%)` }}>
                <span className="text-[10px] font-display text-foreground">After</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-display text-muted-foreground mb-2 block">DENTAL HYGIENE CHECKLIST</span>
          <ChecklistGroup items={dentalChecklist} checked={dentalChecked} onToggle={toggleDentalCheck} />
        </div>
      </div>
    </SectionWrapper>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────

const GroomingMaxPage = () => {
  const navigate = useNavigate();

  const [sliders, setSliders] = useState<Record<string, number>>({
    hairlineStrength: 72, hairHealth: 78, beardDensity: 65,
    skinHealth: 70, acneSeverity: 25, hydration: 68, teethWhiteness: 60,
  });
  const setSlider = useCallback((k: string, v: number) => setSliders((p) => ({ ...p, [k]: v })), []);

  const [beardChecked, setBeardChecked] = useState<Set<string>>(new Set());
  const [skinChecked, setSkinChecked] = useState<Set<string>>(new Set());
  const [dentalChecked, setDentalChecked] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (item: string) => {
    const next = new Set(set);
    next.has(item) ? next.delete(item) : next.add(item);
    setter(next);
  };

  // Mock overall scores
  const hairScore = Math.round((sliders.hairlineStrength + sliders.hairHealth) / 2);
  const beardScore = sliders.beardDensity;
  const skinScore = Math.round((sliders.skinHealth + (100 - sliders.acneSeverity) + sliders.hydration) / 3);
  const dentalScore = Math.round(sliders.teethWhiteness * 0.6 + 80 * 0.4);
  const overallScore = Math.round((hairScore + beardScore + skinScore + dentalScore) / 4);
  const radarScores = [hairScore, beardScore, skinScore, dentalScore, 74, 80, 68, 72];

  const suggestions = [
    overallScore < 80 && { text: "Increase hydration intake and apply SPF daily", area: "Skin" },
    sliders.beardDensity < 70 && { text: "Use minoxidil for beard density improvement", area: "Beard" },
    sliders.teethWhiteness < 70 && { text: "Start whitening strips routine weekly", area: "Dental" },
    sliders.hairlineStrength < 75 && { text: "Add scalp massage & biotin to daily routine", area: "Hair" },
  ].filter(Boolean) as { text: string; area: string }[];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">GroomingMax</h1>
            <p className="text-muted-foreground text-[11px] font-display">Complete grooming optimization dashboard</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Overall Score Row */}
          <div className="grid sm:grid-cols-3 gap-5 opacity-0 animate-fade-in">
            <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
              <ScoreRing score={overallScore} size={130} />
              <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">OVERALL GROOMING</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Combined across all categories</p>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <RadarChart scores={radarScores} size={200} />
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-silver" /> IMPROVEMENTS
              </h3>
              {suggestions.length === 0 && <p className="text-xs text-muted-foreground">All scores look great!</p>}
              {suggestions.map((s) => (
                <div key={s.text} className="glass-card rounded-xl p-3">
                  <span className="text-[9px] font-display text-status-warning">{s.area.toUpperCase()}</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category score mini-cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            {[
              { label: "Hair", score: hairScore, icon: <Crown className="w-4 h-4 text-status-warning" /> },
              { label: "Beard", score: beardScore, icon: <Scissors className="w-4 h-4 text-silver" /> },
              { label: "Skin", score: skinScore, icon: <Sparkles className="w-4 h-4 text-rose-400" /> },
              { label: "Dental", score: dentalScore, icon: <SmilePlus className="w-4 h-4 text-sky-400" /> },
            ].map((c) => (
              <div key={c.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
                {c.icon}
                <div>
                  <div className="text-lg font-display font-bold text-foreground">{c.score}</div>
                  <div className="text-[10px] font-display text-muted-foreground">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sections */}
          <HaircareSection sliders={sliders} setSlider={setSlider} />
          <BeardSection sliders={sliders} setSlider={setSlider} beardChecked={beardChecked} toggleBeardCheck={toggle(beardChecked, setBeardChecked)} />
          <SkincareSection sliders={sliders} setSlider={setSlider} skinChecked={skinChecked} toggleSkinCheck={toggle(skinChecked, setSkinChecked)} />
          <DentalSection sliders={sliders} setSlider={setSlider} dentalChecked={dentalChecked} toggleDentalCheck={toggle(dentalChecked, setDentalChecked)} />

        </div>
      </main>
    </div>
  );
};

export default GroomingMaxPage;
