import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Upload, Camera, RotateCcw, Sparkles, Eye, ArrowLeft,
  TrendingUp, TrendingDown, Minus, Star, Target, Zap, CheckCircle, Layers
} from "lucide-react";

interface SymmetryScore { score: number; detail: string; }
interface FacialRatio { value: string; ideal: string; deviation: "low" | "medium" | "high"; }
interface Improvement { area: string; priority: "high" | "medium" | "low"; suggestion: string; impact: string; }

interface SymmetryAnalysis {
  overallSymmetryScore: number;
  scores: {
    eyeSymmetry: SymmetryScore; noseAlignment: SymmetryScore; lipSymmetry: SymmetryScore;
    jawlineBalance: SymmetryScore; browSymmetry: SymmetryScore; cheekboneBalance: SymmetryScore;
  };
  ratios: {
    facialThirds: FacialRatio; facialWidth: FacialRatio; eyeSpacing: FacialRatio;
    noseToFaceWidth: FacialRatio; lipToJawRatio: FacialRatio;
  };
  improvements: Improvement[];
  strengths: string[];
}

const mockAnalysis: SymmetryAnalysis = {
  overallSymmetryScore: 78,
  scores: {
    eyeSymmetry: { score: 82, detail: "Good horizontal alignment with minor tilt difference" },
    noseAlignment: { score: 75, detail: "Slight deviation from center axis" },
    lipSymmetry: { score: 85, detail: "Well-balanced lip proportions" },
    jawlineBalance: { score: 72, detail: "Minor asymmetry in jaw angle" },
    browSymmetry: { score: 80, detail: "Brows are reasonably balanced" },
    cheekboneBalance: { score: 76, detail: "Slight difference in cheekbone projection" },
  },
  ratios: {
    facialThirds: { value: "1:1.05:1.1", ideal: "1:1:1", deviation: "low" },
    facialWidth: { value: "1.52", ideal: "1.618", deviation: "medium" },
    eyeSpacing: { value: "1.0", ideal: "1.0", deviation: "low" },
    noseToFaceWidth: { value: "0.28", ideal: "0.25", deviation: "low" },
    lipToJawRatio: { value: "0.42", ideal: "0.40", deviation: "low" },
  },
  improvements: [
    { area: "Jawline Definition", priority: "high", suggestion: "Reduce facial body fat and consider jaw exercises", impact: "Significant improvement in profile and front-facing symmetry" },
    { area: "Skin Quality", priority: "medium", suggestion: "Consistent skincare routine with SPF", impact: "Improved overall facial appearance" },
    { area: "Brow Grooming", priority: "low", suggestion: "Professional shaping to enhance symmetry", impact: "Subtle but noticeable improvement" },
  ],
  strengths: ["Strong eye symmetry", "Well-proportioned lips", "Good facial thirds ratio"],
};

// Visual overlay component
const FaceOverlay = ({ showOverlay }: { showOverlay: boolean }) => {
  if (!showOverlay) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Center vertical line */}
      <div className="absolute left-1/2 top-[15%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent" style={{ transform: "translateX(-50%)" }} />
      
      {/* Facial thirds horizontal lines */}
      <div className="absolute left-[20%] right-[20%] top-[22%] h-px bg-cyan-400/40" />
      <div className="absolute left-[15%] right-[15%] top-[45%] h-px bg-cyan-400/40" />
      <div className="absolute left-[18%] right-[18%] top-[68%] h-px bg-cyan-400/40" />
      
      {/* Eye level line */}
      <div className="absolute left-[10%] right-[10%] top-[35%] h-px bg-amber-400/50" />
      
      {/* Eye markers */}
      <div className="absolute left-[30%] top-[33%] w-4 h-4 border-2 border-amber-400/70 rounded-full" style={{ transform: "translate(-50%, -50%)" }} />
      <div className="absolute right-[30%] top-[33%] w-4 h-4 border-2 border-amber-400/70 rounded-full" style={{ transform: "translate(50%, -50%)" }} />
      
      {/* Nose bridge marker */}
      <div className="absolute left-1/2 top-[45%] w-2 h-2 bg-cyan-400/80 rounded-full" style={{ transform: "translate(-50%, -50%)" }} />
      
      {/* Nose tip marker */}
      <div className="absolute left-1/2 top-[55%] w-3 h-3 border-2 border-cyan-400/70 rounded-full" style={{ transform: "translate(-50%, -50%)" }} />
      
      {/* Lip center marker */}
      <div className="absolute left-1/2 top-[65%] w-5 h-2 border border-rose-400/60 rounded-full" style={{ transform: "translate(-50%, -50%)" }} />
      
      {/* Jawline guides */}
      <div className="absolute left-[22%] top-[72%] w-3 h-3 border-2 border-emerald-400/60 rounded-full" />
      <div className="absolute right-[22%] top-[72%] w-3 h-3 border-2 border-emerald-400/60 rounded-full" />
      
      {/* Cheekbone markers */}
      <div className="absolute left-[20%] top-[48%] w-2.5 h-2.5 bg-violet-400/60 rounded-full" />
      <div className="absolute right-[20%] top-[48%] w-2.5 h-2.5 bg-violet-400/60 rounded-full" />
      
      {/* Golden ratio spiral hint (simplified) */}
      <div className="absolute left-[25%] top-[25%] w-[50%] h-[50%] border border-amber-400/20 rounded-full" />
      
      {/* Labels */}
      <div className="absolute top-[33%] left-[8%] text-[9px] font-display text-amber-400/80 -translate-y-1/2">Eyes</div>
      <div className="absolute top-[55%] right-[8%] text-[9px] font-display text-cyan-400/80 -translate-y-1/2">Nose</div>
      <div className="absolute top-[65%] left-[8%] text-[9px] font-display text-rose-400/80 -translate-y-1/2">Lips</div>
      <div className="absolute top-[72%] right-[8%] text-[9px] font-display text-emerald-400/80 -translate-y-1/2">Jaw</div>
    </div>
  );
};

const CircularScore = ({ score, size = 160, label }: { score: number; size?: number; label?: string }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "hsl(142, 50%, 45%)" : score >= 60 ? "hsl(35, 60%, 50%)" : "hsl(0, 50%, 50%)";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(0 0% 14%)" strokeWidth="6" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      {label && <span className="text-sm font-display text-muted-foreground">{label}</span>}
    </div>
  );
};

const ScoreBar = ({ label, score, detail }: { label: string; score: number; detail: string }) => {
  const color = score >= 80 ? "bg-status-success" : score >= 60 ? "bg-status-warning" : "bg-destructive";
  return (
    <div className="glass-card rounded-xl p-4 hover-glow transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-display text-foreground">{label}</span>
        <span className="text-sm font-display font-bold text-foreground">{score}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
        <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
};

const RatioCard = ({ label, ratio }: { label: string; ratio: FacialRatio }) => {
  const deviationColor = {
    low: "text-status-success border-status-success/20 bg-status-success/5",
    medium: "text-status-warning border-status-warning/20 bg-status-warning/5",
    high: "text-destructive border-destructive/20 bg-destructive/5",
  };
  const deviationIcon = { low: <CheckCircle className="w-3.5 h-3.5" />, medium: <Minus className="w-3.5 h-3.5" />, high: <TrendingDown className="w-3.5 h-3.5" /> };
  return (
    <div className="glass-card rounded-xl p-5 hover-glow transition-all">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-display font-semibold text-foreground">{label}</h4>
        <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border", deviationColor[ratio.deviation])}>
          {deviationIcon[ratio.deviation]}{ratio.deviation}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Yours</span><span className="font-display font-medium text-foreground">{ratio.value}</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Ideal</span><span className="font-display text-silver-dim">{ratio.ideal}</span></div>
      </div>
    </div>
  );
};

const FaceAnalyzerPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymmetryAnalysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = (e) => { const result = e.target?.result as string; setUploadedImage(result); runAnalysis(); };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    await new Promise((r) => setTimeout(r, 2500));
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const handleReset = () => { setAnalysis(null); setUploadedImage(null); };

  const scoreEntries = analysis ? [
    { label: "Eye Symmetry", ...analysis.scores.eyeSymmetry },
    { label: "Nose Alignment", ...analysis.scores.noseAlignment },
    { label: "Lip Symmetry", ...analysis.scores.lipSymmetry },
    { label: "Jawline Balance", ...analysis.scores.jawlineBalance },
    { label: "Brow Symmetry", ...analysis.scores.browSymmetry },
    { label: "Cheekbone Balance", ...analysis.scores.cheekboneBalance },
  ] : [];

  const ratioEntries = analysis ? [
    { label: "Facial Thirds", ratio: analysis.ratios.facialThirds },
    { label: "Facial Width Ratio", ratio: analysis.ratios.facialWidth },
    { label: "Eye Spacing", ratio: analysis.ratios.eyeSpacing },
    { label: "Nose-to-Face Width", ratio: analysis.ratios.noseToFaceWidth },
    { label: "Lip-to-Jaw Ratio", ratio: analysis.ratios.lipToJawRatio },
  ] : [];

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-status-warning/10 text-status-warning border-status-warning/20",
    low: "bg-status-success/10 text-status-success border-status-success/20",
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Face Analyzer</h1>
        </div>
      </header>

      <div className="relative z-10 container py-10 md:py-16 max-w-5xl">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-silver" />
            <span className="text-xs font-display text-silver">AI-Powered Analysis</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">Facial Symmetry Analyzer</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Upload a front-facing photo. Get symmetry scores, facial ratios, and visual overlays.</p>
        </div>

        {!analysis && !isAnalyzing ? (
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
              <p className="text-muted-foreground/50 text-xs mt-6">Demo mode · Results are simulated</p>
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="max-w-lg mx-auto text-center">
            <div className="glass-card-strong rounded-2xl p-12">
              {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="w-24 h-24 rounded-xl object-cover mx-auto mb-6 opacity-60" />}
              <div className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mx-auto mb-5" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Analyzing symmetry...</h3>
              <p className="text-muted-foreground text-sm">Detecting landmarks and measuring proportions</p>
            </div>
          </div>
        ) : analysis && (
          <div className="space-y-10">
            <div className="grid md:grid-cols-3 gap-5 opacity-0 animate-fade-in">
              {/* Image with overlay */}
              <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[220px] mb-4">
                  {uploadedImage && (
                    <>
                      <img src={uploadedImage} alt="Analyzed" className="w-full rounded-xl object-cover" />
                      <FaceOverlay showOverlay={showOverlay} />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowOverlay(!showOverlay)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-display px-3 py-1.5 rounded-lg transition-all",
                      showOverlay ? "glass-card-strong text-cyan-400" : "glass-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {showOverlay ? "Hide Overlay" : "Show Overlay"}
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-display">
                    <RotateCcw className="w-3.5 h-3.5" /> New
                  </button>
                </div>
              </div>

              <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center justify-center shine-line">
                <CircularScore score={analysis.overallSymmetryScore} label="Overall Symmetry" />
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-status-warning" /><h3 className="text-sm font-display font-semibold text-foreground">Your Strengths</h3></div>
                <div className="space-y-3">{analysis.strengths?.map((s, i) => (<div key={i} className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-status-success mt-0.5 shrink-0" /><span className="text-sm text-muted-foreground">{s}</span></div>))}</div>
              </div>
            </div>

            {/* Overlay legend */}
            <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-center gap-4 text-xs opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="text-muted-foreground font-display">Overlay Legend:</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-cyan-400/80 rounded-full" />Center / Nose</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-400/80 rounded-full" />Eyes</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-rose-400/80 rounded-full" />Lips</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-400/80 rounded-full" />Jawline</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-violet-400/80 rounded-full" />Cheekbones</span>
            </div>

            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-center gap-2 mb-5"><Eye className="w-5 h-5 text-silver" /><h2 className="text-xl font-display font-bold text-foreground">Symmetry Scores</h2></div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{scoreEntries.map((s) => (<ScoreBar key={s.label} label={s.label} score={s.score} detail={s.detail} />))}</div>
            </div>

            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-2 mb-5"><Target className="w-5 h-5 text-silver" /><h2 className="text-xl font-display font-bold text-foreground">Facial Ratios</h2></div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{ratioEntries.map((r) => (<RatioCard key={r.label} label={r.label} ratio={r.ratio} />))}</div>
            </div>

            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.45s" }}>
              <div className="flex items-center gap-2 mb-5"><Zap className="w-5 h-5 text-silver" /><h2 className="text-xl font-display font-bold text-foreground">Improvement Suggestions</h2></div>
              <div className="space-y-4">
                {analysis.improvements?.map((imp, i) => (
                  <div key={i} className="glass-card rounded-xl p-5 hover-glow transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg glass-card-strong flex items-center justify-center text-sm font-display font-bold text-foreground">{i + 1}</div>
                        <h4 className="font-display font-semibold text-foreground">{imp.area}</h4>
                      </div>
                      <span className={cn("text-xs px-2.5 py-1 rounded-full border font-display", priorityColors[imp.priority])}>{imp.priority} priority</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 ml-11">{imp.suggestion}</p>
                    <p className="text-xs text-silver-dim ml-11 flex items-center gap-1.5"><TrendingUp className="w-3 h-3" />{imp.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 text-center text-muted-foreground text-xs opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              Demo mode — results are simulated. Photos are not stored.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceAnalyzerPage;
