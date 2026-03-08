import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Upload, RotateCcw, Camera, Sun, Paintbrush, Users,
  Star, Trophy, ChevronDown, ChevronUp, CheckCircle, Sparkles, Image,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const mockPhotoAnalysis = {
  attractiveness: 78,
  lighting: 72,
  background: 85,
  composition: 74,
  expression: 80,
  overall: 77,
  grade: "B+",
};

const poseSuggestions = [
  { name: "Slight Jaw Turn", desc: "Turn chin 15° to left, slightly down", match: 95, tip: "Defines jawline, slims face" },
  { name: "Squinch", desc: "Narrow lower eyelids slightly", match: 92, tip: "Creates confidence & intensity" },
  { name: "3/4 Profile", desc: "Show 3/4 of face, far eye at edge", match: 88, tip: "Most universally flattering angle" },
  { name: "Chin Forward & Down", desc: "Push chin slightly forward and tilt down", match: 85, tip: "Eliminates double chin, sharpens jaw" },
  { name: "One Shoulder Forward", desc: "Angle body, lead with one shoulder", match: 82, tip: "Adds depth and visual interest" },
  { name: "Natural Smile", desc: "Think of something funny, don't force", match: 80, tip: "Duchenne smile engages eyes" },
];

const lightingTips = [
  { condition: "Golden Hour", quality: 96, desc: "Warm, diffused light 1hr before sunset" },
  { condition: "Window Light", quality: 88, desc: "Side-lit from large window, soft shadows" },
  { condition: "Overcast", quality: 82, desc: "Natural diffuser, even illumination" },
  { condition: "Ring Light", quality: 75, desc: "Even face lighting, catch-light in eyes" },
  { condition: "Direct Sun", quality: 45, desc: "Harsh shadows, squinting — avoid midday" },
  { condition: "Overhead Indoor", quality: 35, desc: "Creates under-eye shadows — worst case" },
];

const backgroundScores = [
  { type: "Solid Neutral Wall", score: 94 },
  { type: "Urban Texture", score: 85 },
  { type: "Nature / Greenery", score: 82 },
  { type: "Minimalist Interior", score: 80 },
  { type: "Busy Street", score: 55 },
  { type: "Cluttered Room", score: 30 },
];

interface PhotoSlot {
  id: number;
  image: string | null;
  scores: typeof mockPhotoAnalysis | null;
  analyzing: boolean;
}

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

// ─── Main Page ───────────────────────────────────────────────────────

const PhotoMaxPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Best photo selector: up to 4 slots
  const [slots, setSlots] = useState<PhotoSlot[]>([
    { id: 1, image: null, scores: null, analyzing: false },
    { id: 2, image: null, scores: null, analyzing: false },
    { id: 3, image: null, scores: null, analyzing: false },
    { id: 4, image: null, scores: null, analyzing: false },
  ]);
  const [activeSlot, setActiveSlot] = useState<number>(1);

  const simulateScores = () => ({
    attractiveness: 65 + Math.floor(Math.random() * 30),
    lighting: 55 + Math.floor(Math.random() * 40),
    background: 60 + Math.floor(Math.random() * 35),
    composition: 60 + Math.floor(Math.random() * 30),
    expression: 65 + Math.floor(Math.random() * 30),
    overall: 0,
    grade: "",
  });

  const handleFile = (file: File, slotId: number) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = e.target?.result as string;
      setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, image: img, analyzing: true, scores: null } : s));
      setTimeout(() => {
        const scores = simulateScores();
        scores.overall = Math.round((scores.attractiveness + scores.lighting + scores.background + scores.composition + scores.expression) / 5);
        scores.grade = scores.overall >= 85 ? "A" : scores.overall >= 75 ? "B+" : scores.overall >= 65 ? "B" : "C+";
        setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, analyzing: false, scores } : s));
      }, 1800);
    };
    reader.readAsDataURL(file);
  };

  const activeData = slots.find((s) => s.id === activeSlot);
  const bestSlot = slots.filter((s) => s.scores).sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0))[0];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">PhotoMax</h1>
            <p className="text-muted-foreground text-[11px] font-display">Profile photo optimization dashboard</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Photo Upload Slots */}
          <div className="opacity-0 animate-fade-in">
            <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-3">UPLOAD & COMPARE (up to 4 photos)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {slots.map((slot) => (
                <div key={slot.id}
                  className={cn(
                    "glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:ring-1 hover:ring-silver/20",
                    activeSlot === slot.id && "ring-2 ring-foreground/20"
                  )}
                  onClick={() => {
                    setActiveSlot(slot.id);
                    if (!slot.image) {
                      const input = document.createElement("input");
                      input.type = "file"; input.accept = "image/*";
                      input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f, slot.id); };
                      input.click();
                    }
                  }}
                >
                  {slot.image ? (
                    <div className="relative">
                      <img src={slot.image} alt={`Photo ${slot.id}`} className="w-full aspect-square object-cover" />
                      {slot.analyzing && (
                        <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
                        </div>
                      )}
                      {slot.scores && (
                        <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm p-2 flex items-center justify-between">
                          <span className="text-xs font-display font-bold text-foreground">{slot.scores.overall}</span>
                          {bestSlot?.id === slot.id && <Trophy className="w-3.5 h-3.5 text-status-warning" />}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square flex flex-col items-center justify-center gap-2">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] font-display text-muted-foreground">Photo {slot.id}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {bestSlot?.scores && (
              <div className="mt-3 glass-card rounded-lg px-4 py-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-status-warning" />
                <span className="text-xs font-display text-foreground">Best photo: Slot {bestSlot.id} — Score {bestSlot.scores.overall}/100</span>
              </div>
            )}
          </div>

          {/* Active Photo Scores */}
          {activeData?.scores && (
            <div className="grid sm:grid-cols-3 gap-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>
              <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
                <ScoreRing score={activeData.scores.overall} size={130} />
                <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">PHOTO SCORE</h3>
                <span className="text-[10px] text-muted-foreground mt-1">Grade: {activeData.scores.grade}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-1">BREAKDOWN</h3>
                <MiniBar score={activeData.scores.attractiveness} label="Attractiveness" />
                <MiniBar score={activeData.scores.lighting} label="Lighting Quality" />
                <MiniBar score={activeData.scores.background} label="Background" />
                <MiniBar score={activeData.scores.composition} label="Composition" />
                <MiniBar score={activeData.scores.expression} label="Expression" />
              </div>
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-status-warning" /> QUICK TIPS
                </h3>
                {[
                  activeData.scores.lighting < 75 && "Improve lighting — try golden hour or window light",
                  activeData.scores.background < 75 && "Clean up background — use solid neutral wall",
                  activeData.scores.composition < 75 && "Try 3/4 angle with chin slightly forward",
                  activeData.scores.expression < 80 && "Practice natural Duchenne smile (eyes engaged)",
                ].filter(Boolean).map((tip) => (
                  <div key={tip as string} className="flex items-start gap-2 glass-card rounded-lg px-3 py-2">
                    <CheckCircle className="w-3 h-3 text-status-success shrink-0 mt-0.5" />
                    <span className="text-[11px] text-muted-foreground">{tip}</span>
                  </div>
                ))}
                {activeData.scores.overall >= 80 && (
                  <div className="flex items-start gap-2 glass-card rounded-lg px-3 py-2">
                    <Star className="w-3 h-3 text-status-warning shrink-0 mt-0.5" />
                    <span className="text-[11px] text-foreground">Great photo — strong profile pic candidate!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No photo selected message */}
          {!activeData?.scores && !activeData?.analyzing && (
            <div className="glass-card rounded-2xl p-10 text-center opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>
              <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Upload a photo above to see analysis</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Demo mode — results are simulated</p>
            </div>
          )}

          {/* Lighting Analyzer */}
          <SectionWrapper title="LIGHTING GUIDE" icon={<Sun className="w-4.5 h-4.5 text-status-warning" />} delay="0.15s">
            <div className="grid sm:grid-cols-2 gap-3">
              {lightingTips.map((lt) => {
                const color = lt.quality >= 80 ? "hsl(142 50% 45%)" : lt.quality >= 60 ? "hsl(35 60% 50%)" : "hsl(0 50% 50%)";
                return (
                  <div key={lt.condition} className="glass-card rounded-xl p-3 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-display font-bold text-foreground">{lt.condition}</span>
                      <span className="text-xs font-display font-bold text-foreground">{lt.quality}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                      <div className="h-full rounded-full" style={{ width: `${lt.quality}%`, background: color, transition: "width 0.8s" }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{lt.desc}</p>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>

          {/* Background Cleanliness */}
          <SectionWrapper title="BACKGROUND ANALYSIS" icon={<Paintbrush className="w-4.5 h-4.5 text-silver" />} delay="0.2s">
            <div className="space-y-2">
              {backgroundScores.map((bg) => {
                const color = bg.score >= 80 ? "hsl(142 50% 45%)" : bg.score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 50% 50%)";
                return (
                  <div key={bg.type} className="flex items-center gap-3 glass-card rounded-lg px-4 py-3 hover:ring-1 hover:ring-silver/15 transition-all duration-300">
                    <span className="text-xs font-display text-foreground flex-1">{bg.type}</span>
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${bg.score}%`, background: color, transition: "width 0.6s" }} />
                    </div>
                    <span className="text-[10px] font-display font-bold text-foreground w-6 text-right">{bg.score}</span>
                    <span className={cn("text-[9px] font-display px-1.5 py-0.5 rounded-full",
                      bg.score >= 80 ? "bg-status-success/10 text-status-success" : bg.score >= 60 ? "bg-status-warning/10 text-status-warning" : "bg-destructive/10 text-destructive"
                    )}>{bg.score >= 80 ? "Great" : bg.score >= 60 ? "OK" : "Avoid"}</span>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>

          {/* Pose Suggestions */}
          <SectionWrapper title="POSE GALLERY" icon={<Users className="w-4.5 h-4.5 text-sky-400" />} delay="0.25s">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {poseSuggestions.map((pose, i) => (
                <div key={pose.name} className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-display font-bold text-foreground group-hover:text-silver transition-colors">{pose.name}</span>
                    <span className="text-[10px] font-display font-bold text-foreground">{pose.match}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden mb-2">
                    <div className="h-full rounded-full" style={{
                      width: `${pose.match}%`,
                      background: pose.match >= 90 ? "hsl(142 50% 45%)" : "hsl(35 60% 50%)",
                      transition: "width 0.6s",
                    }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">{pose.desc}</p>
                  <p className="text-[10px] text-status-success">{pose.tip}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

        </div>
      </main>
    </div>
  );
};

export default PhotoMaxPage;
