import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Shirt, Watch, Glasses, Palette, TrendingUp, Star,
  ChevronDown, ChevronUp, CheckCircle, BarChart3, Sparkles, Crown,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const outfitSuggestions = [
  "Swap sneakers for Chelsea boots to elevate the outfit",
  "Add a minimal silver chain for visual interest",
  "Try a darker wash denim for sharper contrast",
  "Layer with a structured overshirt for depth",
];

const wardrobeEssentials = [
  { item: "White Oxford Shirt", owned: true },
  { item: "Dark Slim Jeans", owned: true },
  { item: "Navy Blazer", owned: false },
  { item: "Grey Wool Trousers", owned: false },
  { item: "White Sneakers", owned: true },
  { item: "Chelsea Boots", owned: false },
  { item: "Black Leather Belt", owned: true },
  { item: "Cashmere Crew Neck", owned: false },
  { item: "Tailored Chinos", owned: true },
  { item: "Bomber Jacket", owned: true },
];

const skinTones = [
  { name: "Fair", hsl: "30 30% 85%", colors: ["Navy", "Burgundy", "Forest Green", "Charcoal", "Dusty Rose"] },
  { name: "Light", hsl: "25 35% 75%", colors: ["Olive", "Teal", "Burnt Orange", "Slate Blue", "Cream"] },
  { name: "Medium", hsl: "25 40% 60%", colors: ["Royal Blue", "Terracotta", "Emerald", "Mustard", "Ivory"] },
  { name: "Tan", hsl: "20 45% 50%", colors: ["White", "Coral", "Lavender", "Sky Blue", "Gold"] },
  { name: "Deep", hsl: "20 50% 35%", colors: ["White", "Silver", "Ruby Red", "Electric Blue", "Amber"] },
];

const bodyTypes = [
  { type: "Ectomorph", desc: "Lean & long", cuts: ["Slim fit", "Layered looks", "Structured shoulders", "Horizontal stripes"], outfits: ["Bomber + slim jeans", "Fitted blazer + chinos", "Layered tee + overshirt"] },
  { type: "Mesomorph", desc: "Athletic build", cuts: ["Regular fit", "V-neck tees", "Tapered trousers", "Fitted jackets"], outfits: ["Henley + slim chinos", "Polo + tailored shorts", "Leather jacket + jeans"] },
  { type: "Endomorph", desc: "Broader frame", cuts: ["Straight fit", "Vertical patterns", "Darker tones", "Structured blazers"], outfits: ["Dark blazer + straight jeans", "Monochrome layers", "V-neck + dark chinos"] },
];

const watchStyles = [
  { name: "Minimalist", match: 92 }, { name: "Dive Watch", match: 85 },
  { name: "Dress Watch", match: 88 }, { name: "Chronograph", match: 78 },
  { name: "Digital Sport", match: 62 },
];

const glassesFrames = [
  { name: "Wayfarer", match: 90 }, { name: "Round", match: 82 },
  { name: "Aviator", match: 87 }, { name: "Clubmaster", match: 84 },
  { name: "Rectangular", match: 76 },
];

const weeklyRatings = [65, 72, 68, 78, 74, 82, 85];

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

const PieChart = ({ segments, size = 140 }: { segments: { label: string; value: number; color: string }[]; size?: number }) => {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  let cumulative = 0;

  const paths = segments.map((seg) => {
    const start = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += seg.value;
    const end = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const largeArc = end - start > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${cx + r * Math.cos(start)} ${cy + r * Math.sin(start)} A ${r} ${r} 0 ${largeArc} 1 ${cx + r * Math.cos(end)} ${cy + r * Math.sin(end)} Z`;
    return <path key={seg.label} d={d} fill={seg.color} stroke="hsl(var(--background))" strokeWidth={2} />;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>{paths}</svg>
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-[10px] font-display text-muted-foreground">{s.label} ({s.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

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

// ─── Section Components ──────────────────────────────────────────────

const OutfitAnalyzer = ({ outfitScore, setOutfitScore }: { outfitScore: number; setOutfitScore: (v: number) => void }) => {
  const balanceSegments = [
    { label: "Tops", value: 35, color: "hsl(210 40% 45%)" },
    { label: "Bottoms", value: 25, color: "hsl(35 60% 50%)" },
    { label: "Footwear", value: 20, color: "hsl(142 40% 40%)" },
    { label: "Accessories", value: 20, color: "hsl(0 0% 55%)" },
  ];

  return (
    <SectionWrapper title="OUTFIT ANALYZER" icon={<Shirt className="w-5 h-5 text-silver" />} delay="0.1s">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display text-foreground flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-status-warning" /> Outfit Rating
              </span>
              <span className="text-xs font-display font-bold text-foreground">{outfitScore}%</span>
            </div>
            <input type="range" min={0} max={100} value={outfitScore} onChange={(e) => setOutfitScore(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
          </div>
          <MiniBar score={outfitScore} label="Attractiveness Score" />
          <MiniBar score={Math.round(outfitScore * 0.9)} label="Cohesion" />
          <MiniBar score={Math.round(outfitScore * 0.85)} label="Color Harmony" />
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-display text-muted-foreground mb-3 block">CLOTHING BALANCE</span>
            <PieChart segments={balanceSegments} size={120} />
          </div>
          <div>
            <span className="text-[10px] font-display text-muted-foreground mb-2 block">AI SUGGESTIONS</span>
            <div className="space-y-2">
              {outfitSuggestions.map((s) => (
                <div key={s} className="flex items-start gap-2 glass-card rounded-lg px-3 py-2">
                  <Sparkles className="w-3 h-3 text-status-warning shrink-0 mt-0.5" />
                  <span className="text-[11px] text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

const WardrobeAnalyzer = () => {
  const owned = wardrobeEssentials.filter((e) => e.owned).length;
  const completeness = Math.round((owned / wardrobeEssentials.length) * 100);
  const pieSegments = [
    { label: "Owned", value: owned * 10, color: "hsl(142 50% 45%)" },
    { label: "Missing", value: (wardrobeEssentials.length - owned) * 10, color: "hsl(0 0% 25%)" },
  ];

  return (
    <SectionWrapper title="WARDROBE ANALYZER" icon={<BarChart3 className="w-5 h-5 text-status-warning" />} delay="0.2s">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          <ScoreRing score={completeness} size={110} label="Completeness" />
          <PieChart segments={pieSegments} size={100} />
        </div>
        <div>
          <span className="text-[10px] font-display text-muted-foreground mb-2 block">ESSENTIALS CHECKLIST</span>
          <div className="space-y-2">
            {wardrobeEssentials.map((e) => (
              <div key={e.item} className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center shrink-0",
                  e.owned ? "bg-status-success/20 border-status-success" : "border-muted-foreground/30"
                )}>
                  {e.owned && <CheckCircle className="w-3.5 h-3.5 text-status-success" />}
                </div>
                <span className={cn("text-xs", e.owned ? "text-muted-foreground line-through" : "text-foreground")}>{e.item}</span>
                {!e.owned && <span className="text-[9px] text-status-warning ml-auto font-display">MISSING</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

const ColorMatchingTool = ({ selectedTone, setSelectedTone }: { selectedTone: number; setSelectedTone: (v: number) => void }) => {
  const tone = skinTones[selectedTone];
  const harmonyScore = 78 + selectedTone * 3;

  return (
    <SectionWrapper title="COLOR MATCHING" icon={<Palette className="w-5 h-5 text-rose-400" />} delay="0.3s">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          <span className="text-[10px] font-display text-muted-foreground block">SKIN TONE SELECTOR</span>
          <div className="flex gap-3">
            {skinTones.map((t, i) => (
              <button key={t.name} onClick={() => setSelectedTone(i)}
                className={cn("flex flex-col items-center gap-1.5 group transition-all", selectedTone === i && "scale-110")}>
                <div className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all",
                  selectedTone === i ? "border-foreground" : "border-transparent hover:border-muted-foreground/40"
                )} style={{ background: `hsl(${t.hsl})` }} />
                <span className={cn("text-[9px] font-display", selectedTone === i ? "text-foreground" : "text-muted-foreground")}>{t.name}</span>
              </button>
            ))}
          </div>
          <MiniBar score={harmonyScore} label="Color Harmony Score" />
        </div>
        <div>
          <span className="text-[10px] font-display text-muted-foreground mb-2 block">RECOMMENDED COLORS FOR {tone.name.toUpperCase()}</span>
          <div className="space-y-2">
            {tone.colors.map((c) => (
              <div key={c} className="flex items-center gap-3 glass-card rounded-lg px-3 py-2">
                <div className="w-4 h-4 rounded-full border border-muted-foreground/20" style={{ background: `hsl(var(--muted))` }} />
                <span className="text-xs font-display text-foreground">{c}</span>
                <span className="text-[9px] text-status-success ml-auto font-display">MATCH</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

const BodyTypeSection = ({ selectedBody, setSelectedBody }: { selectedBody: number; setSelectedBody: (v: number) => void }) => {
  const bt = bodyTypes[selectedBody];

  return (
    <SectionWrapper title="BODY TYPE RECOMMENDATIONS" icon={<Crown className="w-5 h-5 text-status-warning" />} delay="0.35s">
      <div className="space-y-4">
        <div className="flex gap-3">
          {bodyTypes.map((b, i) => (
            <button key={b.type} onClick={() => setSelectedBody(i)}
              className={cn(
                "flex-1 glass-card rounded-xl p-3 text-center transition-all",
                selectedBody === i ? "ring-1 ring-foreground/20 bg-muted/30" : "hover:bg-muted/10"
              )}>
              <span className="text-xs font-display font-bold text-foreground block">{b.type}</span>
              <span className="text-[10px] text-muted-foreground">{b.desc}</span>
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <span className="text-[10px] font-display text-muted-foreground mb-2 block">RECOMMENDED CUTS</span>
            <div className="space-y-2">
              {bt.cuts.map((c) => (
                <div key={c} className="flex items-center gap-2 glass-card rounded-lg px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5 text-status-success" />
                  <span className="text-xs font-display text-foreground">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-display text-muted-foreground mb-2 block">OUTFIT EXAMPLES</span>
            <div className="space-y-2">
              {bt.outfits.map((o, i) => (
                <div key={o} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Shirt className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="text-xs font-display text-foreground">{o}</span>
                    <span className="text-[9px] text-muted-foreground block">Look {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

const AccessoriesSection = () => (
  <SectionWrapper title="ACCESSORIES" icon={<Watch className="w-5 h-5 text-silver" />} delay="0.4s">
    <div className="grid sm:grid-cols-2 gap-5">
      <div>
        <span className="text-[10px] font-display text-muted-foreground mb-2 block">WATCH STYLE MATCH</span>
        <div className="space-y-2">
          {watchStyles.map((w) => (
            <div key={w.name} className="flex items-center justify-between glass-card rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Watch className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-display text-foreground">{w.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${w.match}%`, background: w.match >= 85 ? "hsl(142 50% 45%)" : "hsl(35 60% 50%)", transition: "width 0.5s" }} />
                </div>
                <span className="text-[10px] font-display font-bold text-foreground w-7 text-right">{w.match}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="text-[10px] font-display text-muted-foreground mb-2 block">GLASSES FRAME MATCH</span>
        <div className="space-y-2">
          {glassesFrames.map((g) => (
            <div key={g.name} className="flex items-center justify-between glass-card rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Glasses className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-display text-foreground">{g.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${g.match}%`, background: g.match >= 85 ? "hsl(142 50% 45%)" : "hsl(35 60% 50%)", transition: "width 0.5s" }} />
                </div>
                <span className="text-[10px] font-display font-bold text-foreground w-7 text-right">{g.match}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <MiniBar score={84} label="Accessory Balance Score" />
        </div>
      </div>
    </div>
  </SectionWrapper>
);

const StyleProgressTracker = ({ outfitScore }: { outfitScore: number }) => {
  const styleLevel = outfitScore >= 85 ? 5 : outfitScore >= 70 ? 4 : outfitScore >= 55 ? 3 : 2;
  const levelProgress = ((outfitScore % 15) / 15) * 100;

  return (
    <SectionWrapper title="STYLE PROGRESS" icon={<TrendingUp className="w-5 h-5 text-status-success" />} delay="0.45s">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-display text-muted-foreground mb-2 block">WEEKLY OUTFIT RATINGS</span>
            <div className="flex items-end gap-1.5 h-20">
              {weeklyRatings.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm" style={{
                    height: `${val}%`,
                    background: i === weeklyRatings.length - 1 ? "hsl(142 50% 45%)" : "hsl(0 0% 22%)",
                    transition: "height 0.8s ease-out",
                    transitionDelay: `${i * 0.05}s`,
                  }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className={cn("text-[9px] font-display flex-1 text-center", i === 6 ? "text-foreground" : "text-muted-foreground/60")}>{d}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5 text-status-warning" />
              <div>
                <span className="text-xs font-display font-bold text-foreground">STYLE LEVEL {styleLevel}</span>
                <span className="text-[10px] text-muted-foreground block">Keep improving to level up</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${levelProgress}%`,
                background: "linear-gradient(90deg, hsl(35 60% 40%), hsl(35 60% 55%))",
                transition: "width 0.8s",
              }} />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-display text-muted-foreground mb-2 block">RATING HISTORY</span>
            <div className="space-y-1.5">
              {["Today: 85/100 — Best this week", "Yesterday: 82/100 — Strong cohesion", "2 days ago: 74/100 — Needs accessories"].map((entry) => (
                <div key={entry} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-silver shrink-0" />
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────

const StyleMaxDashboard = () => {
  const navigate = useNavigate();
  const [outfitScore, setOutfitScore] = useState(76);
  const [selectedTone, setSelectedTone] = useState(2);
  const [selectedBody, setSelectedBody] = useState(1);

  const wardrobeScore = Math.round((wardrobeEssentials.filter((e) => e.owned).length / wardrobeEssentials.length) * 100);
  const colorScore = 78 + selectedTone * 3;
  const overallStyle = Math.round((outfitScore + wardrobeScore + colorScore + 84) / 4);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">StyleMax</h1>
            <p className="text-muted-foreground text-[11px] font-display">Complete wardrobe & style optimization</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Top score cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-0 animate-fade-in">
            {[
              { label: "Overall Style", score: overallStyle, icon: <Star className="w-4 h-4 text-status-warning" /> },
              { label: "Outfit", score: outfitScore, icon: <Shirt className="w-4 h-4 text-silver" /> },
              { label: "Wardrobe", score: wardrobeScore, icon: <BarChart3 className="w-4 h-4 text-rose-400" /> },
              { label: "Color Match", score: colorScore, icon: <Palette className="w-4 h-4 text-sky-400" /> },
            ].map((c) => (
              <div key={c.label} className="glass-card-strong rounded-xl p-4 flex items-center gap-3 shine-line">
                {c.icon}
                <div>
                  <div className="text-lg font-display font-bold text-foreground">{c.score}</div>
                  <div className="text-[10px] font-display text-muted-foreground">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sections */}
          <OutfitAnalyzer outfitScore={outfitScore} setOutfitScore={setOutfitScore} />
          <WardrobeAnalyzer />
          <ColorMatchingTool selectedTone={selectedTone} setSelectedTone={setSelectedTone} />
          <BodyTypeSection selectedBody={selectedBody} setSelectedBody={setSelectedBody} />
          <AccessoriesSection />
          <StyleProgressTracker outfitScore={outfitScore} />

        </div>
      </main>
    </div>
  );
};

export default StyleMaxDashboard;
