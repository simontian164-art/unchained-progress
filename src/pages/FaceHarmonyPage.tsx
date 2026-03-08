import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Upload, Camera, RotateCcw, ArrowLeft, Sparkles, TrendingUp, CheckCircle,
  Eye, Shield, Diamond, Target, Ruler, Star, ChevronRight, Zap
} from "lucide-react";

// Combined mock analysis
const mockAnalysis = {
  overallHarmony: 76,
  grade: "B+",
  archetype: "Balanced Classical",
  features: {
    symmetry: { score: 78, icon: "symmetry", label: "Facial Symmetry", description: "Bilateral balance and alignment" },
    goldenRatio: { score: 72, icon: "golden", label: "Golden Ratio", description: "φ proportions and thirds" },
    jawline: { score: 68, icon: "jawline", label: "Jawline", description: "Definition and angle" },
    cheekbones: { score: 76, icon: "cheekbone", label: "Cheekbones", description: "Projection and width" },
    eyes: { score: 81, icon: "eyes", label: "Eyes", description: "Shape, tilt, and symmetry" },
    nose: { score: 73, icon: "nose", label: "Nose", description: "Proportions and profile" },
    lips: { score: 75, icon: "lips", label: "Lips", description: "Shape and balance" },
    skin: { score: 79, icon: "skin", label: "Skin Quality", description: "Texture, tone, and clarity" },
  },
  radarData: [78, 72, 68, 76, 81, 73, 75, 79],
  strengths: [
    "Eye area is your strongest feature (81)",
    "Good skin quality and clarity",
    "Well-balanced cheekbone projection",
  ],
  improvements: [
    { area: "Jawline", current: 68, potential: 80, action: "Body fat reduction to 12-15% for sharper definition" },
    { area: "Golden Ratio", current: 72, potential: 78, action: "Facial thirds are slightly off — grooming can optimize" },
    { area: "Nose", current: 73, potential: 77, action: "Contouring and angles can enhance perception" },
  ],
  percentile: 72,
  summary: "Your facial harmony score places you in the top 28% of analyzed faces. Primary improvement opportunity lies in jawline definition through body composition optimization.",
};

type Analysis = typeof mockAnalysis;

const ScoreGauge = ({ score, size = 180 }: { score: number; size?: number }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "hsl(var(--status-success))" : score >= 60 ? "hsl(var(--status-warning))" : "hsl(var(--destructive))";
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(0 0% 12%)" strokeWidth="8" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-display font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground font-display">/100</span>
        </div>
      </div>
    </div>
  );
};

// Radar chart for visual harmony overview
const RadarChart = ({ data, labels, size = 260 }: { data: number[]; labels: string[]; size?: number }) => {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const levels = [25, 50, 75, 100];
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const dataPoints = data.map((v, i) => getPoint(i, v));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background levels */}
      {levels.map((level) => {
        const r = (level / 100) * maxR;
        return (
          <polygon
            key={level}
            points={data.map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(" ")}
            fill="none"
            stroke="hsl(0 0% 20%)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Axis lines */}
      {data.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(0 0% 20%)" strokeWidth="0.5" />;
      })}

      {/* Data polygon */}
      <polygon points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")} fill="hsl(var(--silver) / 0.15)" stroke="hsl(var(--silver))" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="hsl(var(--silver))" />
      ))}

      {/* Labels */}
      {labels.map((label, i) => {
        const p = getPoint(i, 115);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(0 0% 50%)"
            fontSize="9"
            fontFamily="Space Grotesk"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

const FeatureIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    symmetry: <Ruler className="w-4 h-4" />,
    golden: <Star className="w-4 h-4" />,
    jawline: <Shield className="w-4 h-4" />,
    cheekbone: <Diamond className="w-4 h-4" />,
    eyes: <Eye className="w-4 h-4" />,
    nose: <Target className="w-4 h-4" />,
    lips: <Sparkles className="w-4 h-4" />,
    skin: <Sparkles className="w-4 h-4" />,
  };
  return <>{icons[type] || <Star className="w-4 h-4" />}</>;
};

const FeatureBar = ({ feature, score, label, description, delay }: { feature: string; score: number; label: string; description: string; delay: number }) => {
  const color = score >= 80 ? "bg-[hsl(var(--status-success))]" : score >= 70 ? "bg-[hsl(var(--status-warning))]" : score >= 60 ? "bg-silver" : "bg-muted-foreground";
  const navigate = useNavigate();
  
  const routes: Record<string, string> = {
    symmetry: "/hub/face-analyzer",
    golden: "/hub/golden-ratio",
    jawline: "/hub/jawline",
    cheekbone: "/hub/cheekbone",
    eyes: "/hub/eyes",
    nose: "/hub/nose",
    lips: "/hub/attractiveness",
    skin: "/hub/skin",
  };

  return (
    <button
      onClick={() => navigate(routes[feature] || "/hub")}
      className="glass-card rounded-xl p-4 hover-glow transition-all text-left group w-full opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg glass-card-strong flex items-center justify-center text-silver group-hover:text-foreground transition-colors">
            <FeatureIcon type={feature} />
          </div>
          <div>
            <span className="text-sm font-display text-foreground block">{label}</span>
            <span className="text-[10px] text-muted-foreground">{description}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-display font-bold text-foreground">{score}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground/60 transition-all group-hover:translate-x-0.5" />
        </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)} style={{ width: `${score}%` }} />
      </div>
    </button>
  );
};

const FaceHarmonyPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setUploadedImage(e.target?.result as string); runAnalysis(); };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => { setIsAnalyzing(true); setAnalysis(null); await new Promise((r) => setTimeout(r, 3000)); setAnalysis(mockAnalysis); setIsAnalyzing(false); };
  const handleReset = () => { setAnalysis(null); setUploadedImage(null); };

  const radarLabels = ["Sym", "φ", "Jaw", "Cheek", "Eyes", "Nose", "Lips", "Skin"];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Facial Harmony</h1>
        </div>
      </header>

      <div className="relative z-10 container py-10 md:py-16 max-w-6xl">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-silver" />
            <span className="text-xs font-display text-silver">Comprehensive Analysis</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">Facial Harmony Dashboard</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Upload a photo for a complete analysis combining symmetry, ratios, and all facial features into one harmony score.</p>
        </div>

        {!analysis && !isAnalyzing && (
          <div className="max-w-lg mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={cn("glass-card-strong rounded-2xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300", isDragging ? "ring-2 ring-silver/30 scale-[1.02]" : "hover:ring-1 hover:ring-silver/15")}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mx-auto mb-6"><Camera className="w-7 h-7 text-silver" /></div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Upload your photo</h3>
              <p className="text-muted-foreground text-sm mb-6">Front-facing, clear lighting, neutral expression</p>
              <button className="btn-premium inline-flex items-center gap-2 text-sm"><Upload className="w-4 h-4" /> Choose File</button>
              <p className="text-muted-foreground/50 text-xs mt-6">Demo mode · All results are simulated</p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="max-w-lg mx-auto text-center">
            <div className="glass-card-strong rounded-2xl p-12">
              {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="w-24 h-24 rounded-xl object-cover mx-auto mb-6 opacity-60" />}
              <div className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mx-auto mb-5" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Running full analysis...</h3>
              <p className="text-muted-foreground text-sm">Analyzing symmetry, ratios, and 8 facial features</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-8">
            {/* Top section: Photo + Main score + Radar */}
            <div className="grid lg:grid-cols-3 gap-6 opacity-0 animate-fade-in">
              {/* Photo */}
              <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
                {uploadedImage && <img src={uploadedImage} alt="Analyzed" className="w-full max-w-[200px] rounded-xl object-cover mb-4" />}
                <button onClick={handleReset} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-display"><RotateCcw className="w-4 h-4" /> Analyze another</button>
              </div>

              {/* Main score */}
              <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center justify-center shine-line">
                <ScoreGauge score={analysis.overallHarmony} />
                <div className="text-center mt-4">
                  <span className="text-sm font-display font-bold text-foreground block">Grade {analysis.grade}</span>
                  <span className="text-xs font-display text-silver">{analysis.archetype}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-display">Percentile</span>
                    <span className="font-display font-bold text-foreground">Top {100 - analysis.percentile}%</span>
                  </div>
                </div>
              </div>

              {/* Radar chart */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 text-center">Feature Balance</h3>
                <RadarChart data={analysis.radarData} labels={radarLabels} size={220} />
              </div>
            </div>

            {/* Feature breakdown */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-silver" /> Feature Scores
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(analysis.features).map(([key, f], i) => (
                  <FeatureBar key={key} feature={key} score={f.score} label={f.label} description={f.description} delay={0.05 + i * 0.05} />
                ))}
              </div>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="glass-card rounded-2xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle className="w-5 h-5 text-status-success" />
                  <h3 className="text-sm font-display font-bold text-foreground">Your Strengths</h3>
                </div>
                <div className="space-y-3">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full glass-card-strong flex items-center justify-center text-[10px] font-display text-foreground shrink-0">{i + 1}</span>
                      <span className="text-sm text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="glass-card rounded-2xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-5 h-5 text-status-warning" />
                  <h3 className="text-sm font-display font-bold text-foreground">Priority Improvements</h3>
                </div>
                <div className="space-y-4">
                  {analysis.improvements.map((imp, i) => (
                    <div key={i} className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display font-semibold text-foreground text-sm">{imp.area}</span>
                        <div className="flex items-center gap-1 text-xs font-display">
                          <span className="text-muted-foreground">{imp.current}</span>
                          <span className="text-silver">→</span>
                          <span className="text-status-success">{imp.potential}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{imp.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card-strong rounded-xl p-5 text-center opacity-0 animate-fade-in" style={{ animationDelay: "0.7s" }}>
              <p className="text-sm text-foreground font-display">{analysis.summary}</p>
            </div>

            <div className="glass-card rounded-xl p-4 text-center text-muted-foreground text-xs">
              Demo mode — all results are simulated. Photos are not stored.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceHarmonyPage;
