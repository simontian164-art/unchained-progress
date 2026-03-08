import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { FaceCapture } from "@/components/FaceCapture";
import {
  ArrowLeft, Camera, RotateCcw, ScanFace, Ruler, Shield, Diamond,
  Eye, Target, Sparkles, Crown, ChevronRight, TrendingUp, Star,
} from "lucide-react";

// ─── Mock Analysis Data ──────────────────────────────────────────────

const mockAnalysis = {
  overall: 76,
  grade: "B+",
  percentile: 82,
  features: {
    symmetry: { score: 78, label: "Facial Symmetry", icon: ScanFace, detail: "Left-right deviation: 3.2%", path: "/hub/face-analyzer" },
    goldenRatio: { score: 82, label: "Golden Ratio", icon: Ruler, detail: "φ deviation: 4.1% from ideal", path: "/hub/golden-ratio" },
    jawline: { score: 71, label: "Jawline Definition", icon: Shield, detail: "Gonial angle: 128° (ideal 125°)", path: "/hub/jawline" },
    cheekbones: { score: 74, label: "Cheekbone Prominence", icon: Diamond, detail: "Malar projection: above average", path: "/hub/cheekbone" },
    eyes: { score: 85, label: "Eye Attractiveness", icon: Eye, detail: "Canthal tilt: +4° positive", path: "/hub/eyes" },
    nose: { score: 72, label: "Nose Proportion", icon: Target, detail: "Nasal index: 68 (ideal 65-70)", path: "/hub/nose" },
    harmony: { score: 79, label: "Facial Harmony", icon: Sparkles, detail: "Feature integration: cohesive", path: "/hub/harmony" },
    hairstyle: { score: 80, label: "Hairstyle Compatibility", icon: Crown, detail: "Face shape: Oval — high versatility", path: "/hub/hairline" },
  },
  strengths: [
    "Strong positive canthal tilt enhances eye attractiveness",
    "Good golden ratio adherence across midface",
    "Facial harmony score above 75th percentile",
  ],
  improvements: [
    { area: "Jawline", current: 71, potential: 82, tip: "Mewing exercises & lean body fat for definition" },
    { area: "Nose", current: 72, potential: 78, tip: "Contouring techniques for visual narrowing" },
    { area: "Cheekbones", current: 74, potential: 81, tip: "Facial exercises and strategic highlighting" },
  ],
  hairstyles: [
    { name: "Textured Crop", match: 94 },
    { name: "Side Part", match: 90 },
    { name: "Quiff", match: 87 },
    { name: "Slick Back", match: 82 },
    { name: "Buzz Cut", match: 75 },
  ],
};

type Analysis = typeof mockAnalysis;
const radarLabels = ["Symmetry", "Golden Ratio", "Jawline", "Cheekbones", "Eyes", "Nose", "Harmony", "Hair"];

// ─── Sub-components ──────────────────────────────────────────────────

const ScoreRing = ({ score, size = 140, sublabel }: { score: number; size?: number; sublabel?: string }) => {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  const grade = score >= 90 ? "A+" : score >= 85 ? "A" : score >= 80 ? "A-" : score >= 75 ? "B+" : score >= 70 ? "B" : "C+";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground font-display">{sublabel || grade}</span>
      </div>
    </div>
  );
};

const RadarChart = ({ scores, size = 260 }: { scores: number[]; size?: number }) => {
  const cx = size / 2, cy = size / 2, levels = 4;
  const r = size / 2 - 30;
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
        return <line key={`l${i}`} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="hsl(var(--muted))" strokeWidth={0.5} />;
      })}
      <polygon points={polyPoints} fill="hsl(142 50% 45% / 0.12)" stroke="hsl(142 50% 45%)" strokeWidth={1.5} />
      {scores.map((s, i) => {
        const a = angleSlice * i - Math.PI / 2;
        const pr = (s / 100) * r;
        const lx = cx + (r + 20) * Math.cos(a);
        const ly = cy + (r + 20) * Math.sin(a);
        return (
          <g key={`g${i}`}>
            <circle cx={cx + pr * Math.cos(a)} cy={cy + pr * Math.sin(a)} r={3.5} fill="hsl(142 50% 45%)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-display">{radarLabels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

const FeatureCard = ({ feature, delay, onNavigate }: {
  feature: { score: number; label: string; icon: typeof ScanFace; detail: string; path: string };
  delay: string; onNavigate: (path: string) => void;
}) => {
  const Icon = feature.icon;
  const color = feature.score >= 80 ? "hsl(142 50% 45%)" : feature.score >= 65 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <button onClick={() => onNavigate(feature.path)}
      className="glass-card rounded-xl p-4 text-left w-full group hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift opacity-0 animate-fade-in"
      style={{ animationDelay: delay }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg glass-card-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-4.5 h-4.5 text-silver group-hover:text-foreground transition-colors" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-display font-bold text-foreground">{feature.score}</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground/60 transition-all group-hover:translate-x-0.5" />
        </div>
      </div>
      <h3 className="text-xs font-display font-bold text-foreground mb-1 tracking-wide">{feature.label}</h3>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
        <div className="h-full rounded-full" style={{ width: `${feature.score}%`, background: color, transition: "width 1s ease-out" }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{feature.detail}</p>
    </button>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────

const FaceMaxPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = (images: string[]) => {
    setShowCamera(false);
    setUploadedImage(images[0]);
    runAnalysis();
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2800));
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const handleReset = () => { setAnalysis(null); setUploadedImage(null); };

  const featureScores = analysis
    ? Object.values(analysis.features).map((f) => f.score)
    : [];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      {/* Camera overlay */}
      <AnimatePresence>
        {showCamera && (
          <FaceCapture
            onCapture={handleCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">FaceMax</h1>
            <p className="text-muted-foreground text-[11px] font-display">Complete facial analysis dashboard</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto">

          {/* Camera Launch State */}
          {!analysis && !isAnalyzing && (
            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div
                className="glass-card-strong rounded-2xl p-12 md:p-16 text-center cursor-pointer hover:bg-accent/10 transition-all active:scale-[0.98]"
                onClick={() => setShowCamera(true)}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-foreground text-xl mb-2">Open Camera</h3>
                <p className="text-muted-foreground text-sm mb-4">We'll guide you through 3 angles for the best analysis</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {["Pull hair back", "Good lighting", "Neutral expression"].map(tip => (
                    <span key={tip} className="text-[11px] text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-full">{tip}</span>
                  ))}
                </div>
                <p className="text-muted-foreground/40 text-[10px] mt-4">Demo mode — all results are simulated</p>
              </div>
            </div>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="glass-card-strong rounded-2xl p-20 text-center opacity-0 animate-fade-in">
              <div className="w-16 h-16 rounded-full border-2 border-muted border-t-foreground animate-spin mx-auto mb-6" />
              <h3 className="font-display font-bold text-foreground mb-2">Analyzing Facial Structure</h3>
              <p className="text-muted-foreground text-sm">Mapping 68 landmarks, computing ratios & symmetry…</p>
            </div>
          )}

          {/* Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between opacity-0 animate-fade-in">
                <h2 className="font-display font-bold text-foreground text-sm tracking-wide">FACEMAX ANALYSIS</h2>
                <button onClick={handleReset} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-display glass-card rounded-lg px-3 py-2">
                  <RotateCcw className="w-3 h-3" /> New Analysis
                </button>
              </div>

              {/* Top Row: Score + Radar + Strengths */}
              <div className="grid lg:grid-cols-3 gap-5">
                {/* Overall Score + Photo */}
                <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>
                  {uploadedImage && (
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <img src={uploadedImage} alt="Uploaded" className="w-full aspect-[4/3] object-cover" />
                    </div>
                  )}
                  <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
                    <ScoreRing score={analysis.overall} size={140} />
                    <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">OVERALL FACE SCORE</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">Top {100 - analysis.percentile}% percentile</p>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-2">FEATURE RADAR</h3>
                  <RadarChart scores={featureScores} size={240} />
                </div>

                {/* Strengths + Quick Stats */}
                <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-status-warning" /> TOP STRENGTHS
                    </h3>
                    <div className="space-y-3">
                      {analysis.strengths.map((s) => (
                        <div key={s} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0 mt-1.5" />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hairstyle Compatibility */}
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2 mb-3">
                      <Crown className="w-4 h-4 text-silver" /> HAIRSTYLE MATCH
                    </h3>
                    <div className="space-y-2">
                      {analysis.hairstyles.map((h, i) => {
                        const color = h.match >= 90 ? "hsl(142 50% 45%)" : h.match >= 80 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
                        return (
                          <div key={h.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-display text-muted-foreground w-4">{i + 1}.</span>
                              <span className="text-xs font-display text-foreground">{h.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${h.match}%`, background: color, transition: "width 0.6s ease-out" }} />
                              </div>
                              <span className="text-[10px] font-display font-bold text-foreground w-8 text-right">{h.match}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Breakdown Grid */}
              <div>
                <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  FEATURE BREAKDOWN — Click to explore
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(analysis.features).map((f, i) => (
                    <FeatureCard key={f.label} feature={f} delay={`${0.22 + i * 0.04}s`} onNavigate={navigate} />
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="glass-card rounded-2xl p-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.55s" }}>
                <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-silver" /> PRIORITY IMPROVEMENTS
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {analysis.improvements.map((imp) => (
                    <div key={imp.area} className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-display font-bold text-foreground">{imp.area}</span>
                        <div className="flex items-center gap-1 text-[10px] font-display">
                          <span className="text-muted-foreground">{imp.current}</span>
                          <span className="text-muted-foreground/40">→</span>
                          <span className="text-status-success font-bold">{imp.potential}</span>
                        </div>
                      </div>
                      {/* Current vs Potential bars */}
                      <div className="space-y-1 mb-3">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${imp.current}%`, background: "hsl(35 60% 50%)", transition: "width 0.8s" }} />
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${imp.potential}%`, background: "hsl(142 50% 45%)", transition: "width 1s", transitionDelay: "0.3s" }} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[9px] text-muted-foreground">Current</span>
                          <span className="text-[9px] text-status-success">Potential</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{imp.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FaceMaxPage;
