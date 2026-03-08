import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ChevronDown, Scissors, Glasses, Shirt,
  Sparkles, Star, Crown, Palette, Layers,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const hairstyles = [
  { id: "h1", name: "Textured Crop", vibe: "Clean & Modern", match: 92, tier: "S", desc: "Short sides, textured top. Works with every face shape." },
  { id: "h2", name: "Slick Back", vibe: "Power & Edge", match: 85, tier: "A", desc: "Medium length swept back. Best with strong jawline." },
  { id: "h3", name: "Buzz Cut", vibe: "Minimal & Bold", match: 78, tier: "A", desc: "Ultra-low maintenance. Highlights facial bone structure." },
  { id: "h4", name: "French Crop", vibe: "European Classic", match: 88, tier: "S", desc: "Fringe forward, short sides. Softens high foreheads." },
  { id: "h5", name: "Curtains", vibe: "Relaxed Cool", match: 74, tier: "B", desc: "Centre-parted medium length. Suits oval and diamond faces." },
  { id: "h6", name: "Pompadour", vibe: "Statement", match: 70, tier: "B", desc: "Volume on top, tapered sides. Requires styling product." },
  { id: "h7", name: "Crew Cut", vibe: "Classic Clean", match: 82, tier: "A", desc: "Military-inspired, slightly longer on top. Universally flattering." },
  { id: "h8", name: "Messy Quiff", vibe: "Effortless", match: 80, tier: "A", desc: "Tousled volume with texture. Works well with wavy hair." },
];

const beardStyles = [
  { id: "b1", name: "Clean Shaven", match: 88, desc: "Shows jawline definition. Best if jaw is strong.", icon: "✨" },
  { id: "b2", name: "Stubble (3-day)", match: 94, desc: "Universally attractive. Adds masculinity without bulk.", icon: "🔥" },
  { id: "b3", name: "Short Beard", match: 82, desc: "Adds structure to weak jawlines. Keep neckline clean.", icon: "👔" },
  { id: "b4", name: "Full Beard", match: 72, desc: "Maximum masculinity. Requires grooming discipline.", icon: "🧔" },
  { id: "b5", name: "Goatee", match: 65, desc: "Elongates round faces. Keep it trimmed and precise.", icon: "🎯" },
  { id: "b6", name: "Circle Beard", match: 68, desc: "Connected mustache and chin. Adds definition to lower face.", icon: "⭕" },
];

const glassesFrames = [
  { id: "g1", name: "Aviator", match: 86, face: "Oval, Heart", vibe: "Classic cool", material: "Metal" },
  { id: "g2", name: "Wayfarer", match: 92, face: "All shapes", vibe: "Timeless", material: "Acetate" },
  { id: "g3", name: "Round Wire", match: 78, face: "Square, Oval", vibe: "Intellectual", material: "Metal" },
  { id: "g4", name: "Rectangle", match: 84, face: "Round, Oval", vibe: "Professional", material: "Acetate" },
  { id: "g5", name: "Clubmaster", match: 90, face: "Oval, Diamond", vibe: "Sophisticated", material: "Mixed" },
  { id: "g6", name: "Geometric", match: 74, face: "Oval, Round", vibe: "Bold modern", material: "Acetate" },
];

const outfitPresets = [
  { id: "o1", name: "Smart Casual", items: ["Navy blazer", "White tee", "Dark jeans", "White sneakers"], score: 88, occasion: "Date / Social", color: "from-blue-500/15 to-indigo-500/5" },
  { id: "o2", name: "Street Minimal", items: ["Black hoodie", "Cargo pants", "Chunky sneakers", "Watch"], score: 82, occasion: "Everyday", color: "from-neutral-500/15 to-zinc-500/5" },
  { id: "o3", name: "Business Sharp", items: ["Charcoal suit", "Light blue shirt", "Brown oxfords", "Tie"], score: 90, occasion: "Professional", color: "from-slate-500/15 to-gray-500/5" },
  { id: "o4", name: "Summer Fresh", items: ["Linen shirt", "Chinos", "Loafers", "Sunglasses"], score: 85, occasion: "Warm weather", color: "from-amber-500/15 to-yellow-500/5" },
  { id: "o5", name: "Athletic Flex", items: ["Fitted tee", "Joggers", "Running shoes", "Cap"], score: 76, occasion: "Active / Gym", color: "from-emerald-500/15 to-green-500/5" },
  { id: "o6", name: "Night Out", items: ["Black shirt", "Slim trousers", "Chelsea boots", "Cologne"], score: 92, occasion: "Evening / Club", color: "from-violet-500/15 to-purple-500/5" },
];

const glowUpStages = [
  { level: 0, label: "Starting Point", desc: "No grooming routine, basic wardrobe, default hair", areas: { hair: 3, beard: 2, glasses: 1, outfit: 3, skin: 2 } },
  { level: 1, label: "Awareness", desc: "First haircut upgrade, basic skincare started", areas: { hair: 5, beard: 3, glasses: 2, outfit: 4, skin: 4 } },
  { level: 2, label: "Foundation", desc: "Consistent grooming, wardrobe audit complete", areas: { hair: 6, beard: 5, glasses: 4, outfit: 5, skin: 5 } },
  { level: 3, label: "Developing", desc: "Style identity forming, beard game improving", areas: { hair: 7, beard: 7, glasses: 5, outfit: 7, skin: 7 } },
  { level: 4, label: "Refined", desc: "Signature look locked in, accessories on point", areas: { hair: 8, beard: 8, glasses: 7, outfit: 8, skin: 8 } },
  { level: 5, label: "Elite", desc: "Head-turning presence, every detail intentional", areas: { hair: 9, beard: 9, glasses: 9, outfit: 9, skin: 9 } },
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

const MiniBar = ({ score, label }: { score: number; label: string }) => {
  const pct = score * 10;
  const color = pct >= 80 ? "hsl(142 50% 45%)" : pct >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 50%)";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-display text-muted-foreground w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[9px] font-display font-bold text-foreground w-5 text-right">{score}</span>
    </div>
  );
};

const tierColor = (tier: string) => tier === "S" ? "text-status-warning" : tier === "A" ? "text-status-success" : "text-muted-foreground";

// ─── Main Page ───────────────────────────────────────────────────────

const StyleSimulatorPage = () => {
  const navigate = useNavigate();
  const [selectedHair, setSelectedHair] = useState("h1");
  const [selectedBeard, setSelectedBeard] = useState("b2");
  const [selectedGlasses, setSelectedGlasses] = useState("g2");
  const [selectedOutfit, setSelectedOutfit] = useState("o1");
  const [glowLevel, setGlowLevel] = useState(3);

  const hair = hairstyles.find((h) => h.id === selectedHair)!;
  const beard = beardStyles.find((b) => b.id === selectedBeard)!;
  const glasses = glassesFrames.find((g) => g.id === selectedGlasses)!;
  const outfit = outfitPresets.find((o) => o.id === selectedOutfit)!;
  const stage = glowUpStages[glowLevel];

  const comboScore = Math.round((hair.match + beard.match + glasses.match + outfit.score) / 4);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Style Simulator</h1>
            <p className="text-muted-foreground text-[11px] font-display">Preview your look before committing</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Combo Score Banner */}
          <div className="glass-card-strong rounded-2xl p-5 shine-line opacity-0 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-display text-muted-foreground">CURRENT COMBO SCORE</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-foreground">{comboScore}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: "Hair", value: hair.name },
                  { label: "Beard", value: beard.name },
                  { label: "Frames", value: glasses.name },
                  { label: "Outfit", value: outfit.name },
                ].map((chip) => (
                  <div key={chip.label} className="glass-card rounded-lg px-3 py-1.5">
                    <span className="text-[8px] font-display text-muted-foreground block">{chip.label}</span>
                    <span className="text-[10px] font-display font-bold text-foreground">{chip.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hairstyle Gallery */}
          <SectionWrapper title="HAIRSTYLE GALLERY" icon={<Scissors className="w-4 h-4 text-status-warning" />} delay="0.05s">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {hairstyles.map((h) => (
                <button key={h.id} onClick={() => setSelectedHair(h.id)}
                  className={cn("glass-card rounded-xl p-4 text-left transition-all duration-300 hover-lift",
                    selectedHair === h.id ? "ring-1 ring-status-warning/50 bg-status-warning/5" : "hover:ring-1 hover:ring-silver/15"
                  )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-[10px] font-display font-bold", tierColor(h.tier))}>{h.tier}-Tier</span>
                    <span className="text-xs font-display font-bold text-foreground">{h.match}%</span>
                  </div>
                  <span className="text-xs font-display font-bold text-foreground block mb-0.5">{h.name}</span>
                  <span className="text-[9px] text-status-warning/80 font-display block mb-1">{h.vibe}</span>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{h.desc}</p>
                </button>
              ))}
            </div>
          </SectionWrapper>

          {/* Beard Preview */}
          <SectionWrapper title="BEARD PREVIEW" icon={<Crown className="w-4 h-4 text-silver" />} delay="0.1s">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {beardStyles.map((b) => (
                <button key={b.id} onClick={() => setSelectedBeard(b.id)}
                  className={cn("glass-card rounded-xl p-4 text-left transition-all duration-300 hover-lift",
                    selectedBeard === b.id ? "ring-1 ring-silver/50 bg-silver/5" : "hover:ring-1 hover:ring-silver/15"
                  )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-xs font-display font-bold text-foreground">{b.match}%</span>
                  </div>
                  <span className="text-xs font-display font-bold text-foreground block mb-1">{b.name}</span>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{b.desc}</p>
                </button>
              ))}
            </div>
          </SectionWrapper>

          {/* Glasses Frame Selector */}
          <SectionWrapper title="GLASSES FRAME SELECTOR" icon={<Glasses className="w-4 h-4 text-sky-400" />} delay="0.15s">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {glassesFrames.map((g) => (
                <button key={g.id} onClick={() => setSelectedGlasses(g.id)}
                  className={cn("glass-card rounded-xl p-4 text-left transition-all duration-300 hover-lift",
                    selectedGlasses === g.id ? "ring-1 ring-sky-400/40 bg-sky-400/5" : "hover:ring-1 hover:ring-silver/15"
                  )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-display font-bold text-foreground">{g.name}</span>
                    <span className="text-xs font-display font-bold text-foreground">{g.match}%</span>
                  </div>
                  <div className="space-y-1 text-[9px] font-display text-muted-foreground">
                    <div className="flex justify-between"><span>Face shapes</span><span className="text-foreground">{g.face}</span></div>
                    <div className="flex justify-between"><span>Material</span><span className="text-foreground">{g.material}</span></div>
                    <div className="flex justify-between"><span>Vibe</span><span className="text-silver">{g.vibe}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </SectionWrapper>

          {/* Outfit Preview Cards */}
          <SectionWrapper title="OUTFIT PREVIEW" icon={<Shirt className="w-4 h-4 text-status-success" />} delay="0.2s">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {outfitPresets.map((o) => (
                <button key={o.id} onClick={() => setSelectedOutfit(o.id)}
                  className={cn("glass-card rounded-xl p-4 text-left transition-all duration-300 hover-lift",
                    selectedOutfit === o.id ? "ring-1 ring-status-success/40 bg-status-success/5" : "hover:ring-1 hover:ring-silver/15"
                  )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-display font-bold text-foreground">{o.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-status-warning" />
                      <span className="text-xs font-display font-bold text-foreground">{o.score}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-display text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full inline-block mb-2">{o.occasion}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {o.items.map((item) => (
                      <span key={item} className="text-[9px] font-display text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">{item}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </SectionWrapper>

          {/* Glow Up Simulation Slider */}
          <SectionWrapper title="GLOW UP SIMULATION" icon={<Sparkles className="w-4 h-4 text-status-warning" />} delay="0.25s">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-display font-bold text-foreground">Level {stage.level}: {stage.label}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stage.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-display font-bold text-foreground">
                    {Math.round(Object.values(stage.areas).reduce((a, b) => a + b, 0) / 5 * 10)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">/ 100</span>
                </div>
              </div>

              {/* Slider */}
              <div className="mb-5">
                <input type="range" min={0} max={5} step={1} value={glowLevel} onChange={(e) => setGlowLevel(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-[hsl(35,60%,50%)]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-muted" />
                <div className="flex justify-between mt-2">
                  {glowUpStages.map((s) => (
                    <span key={s.level} className={cn("text-[8px] font-display", s.level === glowLevel ? "text-foreground font-bold" : "text-muted-foreground/50")}>{s.label}</span>
                  ))}
                </div>
              </div>

              {/* Area Bars */}
              <div className="space-y-2">
                <MiniBar score={stage.areas.hair} label="Hair" />
                <MiniBar score={stage.areas.beard} label="Beard" />
                <MiniBar score={stage.areas.glasses} label="Frames" />
                <MiniBar score={stage.areas.outfit} label="Outfit" />
                <MiniBar score={stage.areas.skin} label="Skin" />
              </div>
            </div>

            {/* Stage cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
              {glowUpStages.map((s) => (
                <button key={s.level} onClick={() => setGlowLevel(s.level)}
                  className={cn("glass-card rounded-lg p-2.5 text-center transition-all duration-200",
                    s.level === glowLevel ? "ring-1 ring-status-warning/40 bg-status-warning/5" : "hover:bg-muted/20"
                  )}>
                  <span className={cn("text-lg font-display font-bold block", s.level === glowLevel ? "text-status-warning" : "text-muted-foreground")}>{s.level}</span>
                  <span className="text-[8px] font-display text-muted-foreground">{s.label}</span>
                </button>
              ))}
            </div>
          </SectionWrapper>

        </div>
      </main>
    </div>
  );
};

export default StyleSimulatorPage;
