import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Upload, Camera, RotateCcw, ArrowLeft, Eye, Sparkles, TrendingUp, CheckCircle, Zap } from "lucide-react";

const mockAnalysis = {
  overallScore: 81,
  metrics: {
    shape: { score: 84, label: "Almond", detail: "Well-defined almond shape with positive canthal tilt — considered the most attractive eye shape." },
    symmetry: { score: 82, label: "Good", detail: "Minimal difference between left and right eye positioning and size." },
    canthalTilt: { score: 86, label: "Positive", detail: "Upward outer canthal angle. Strongly correlated with perceived attractiveness." },
    limbalRing: { score: 78, label: "Visible", detail: "Clear dark ring around iris creating contrast and depth perception." },
    palpebraFissure: { score: 76, label: "Proportionate", detail: "Height-to-width ratio is within attractive range. Good eye openness." },
    upperEyelidExposure: { score: 80, label: "Low", detail: "Minimal upper eyelid exposure — hunter-eye aesthetic with hooded appearance." },
    interpupillaryDistance: { score: 79, label: "Balanced", detail: "Distance between pupils is proportionate to facial width." },
    eyebrowHarmony: { score: 83, label: "Strong", detail: "Brow position and shape complement eye area well." },
  },
  grade: "A",
  archetype: "Hunter Eyes",
  strengths: ["Positive canthal tilt", "Almond eye shape", "Strong brow harmony", "Low upper eyelid exposure"],
  tips: [
    { action: "Prioritize sleep quality (7-9 hrs)", impact: "high", detail: "Dark circles and puffiness are the #1 detractor from eye attractiveness." },
    { action: "Cold compress morning routine", impact: "medium", detail: "Reduces puffiness and tightens skin around the orbital area." },
    { action: "Maintain brow grooming", impact: "medium", detail: "Clean brow line frames the eyes and enhances perceived symmetry." },
    { action: "Limit screen strain", impact: "low", detail: "Reduces redness and maintains bright, clear sclera." },
  ],
};

type Analysis = typeof mockAnalysis;

const ScoreGauge = ({ score, size = 150 }: { score: number; size?: number }) => {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "hsl(var(--status-success))" : score >= 60 ? "hsl(var(--status-warning))" : "hsl(var(--destructive))";
  const grade = score >= 90 ? "S" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : "C";
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(0 0% 12%)" strokeWidth="6" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-display font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground font-display">/100</span>
        </div>
      </div>
      <span className="text-sm font-display font-bold mt-2" style={{ color }}>Grade {grade}</span>
    </div>
  );
};

const MetricBar = ({ label, score, tag, detail }: { label: string; score: number; tag: string; detail: string }) => {
  const color = score >= 80 ? "bg-[hsl(var(--status-success))]" : score >= 60 ? "bg-[hsl(var(--status-warning))]" : "bg-destructive";
  return (
    <div className="glass-card rounded-xl p-4 hover-glow transition-all">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-display text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">{tag}</span>
          <span className="text-sm font-display font-bold text-foreground">{score}</span>
        </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
        <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
};

const EyeAnalyzerPage = () => {
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

  const runAnalysis = async () => { setIsAnalyzing(true); setAnalysis(null); await new Promise((r) => setTimeout(r, 2200)); setAnalysis(mockAnalysis); setIsAnalyzing(false); };
  const handleReset = () => { setAnalysis(null); setUploadedImage(null); };

  const impactColor: Record<string, string> = {
    high: "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success))]/10 border-[hsl(var(--status-success))]/20",
    medium: "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning))]/10 border-[hsl(var(--status-warning))]/20",
    low: "text-muted-foreground bg-muted/30 border-border",
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Eye Analyzer</h1>
        </div>
      </header>

      <div className="relative z-10 container py-10 md:py-16 max-w-5xl">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6">
            <Eye className="w-4 h-4 text-silver" />
            <span className="text-xs font-display text-silver">Eye Area Analysis</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">Eye Attractiveness Score</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Upload a front-facing photo. Get detailed scoring on eye shape, tilt, symmetry, and periorbital aesthetics.</p>
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
              <p className="text-muted-foreground text-sm mb-6">Front-facing, clear lighting, eyes open naturally</p>
              <button className="btn-premium inline-flex items-center gap-2 text-sm"><Upload className="w-4 h-4" /> Choose File</button>
              <p className="text-muted-foreground/50 text-xs mt-6">Demo mode · Results are simulated</p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="max-w-lg mx-auto text-center">
            <div className="glass-card-strong rounded-2xl p-12">
              {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="w-24 h-24 rounded-xl object-cover mx-auto mb-6 opacity-60" />}
              <div className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mx-auto mb-5" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Analyzing eye area...</h3>
              <p className="text-muted-foreground text-sm">Measuring shape, tilt, symmetry & exposure</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-8 opacity-0 animate-fade-in">
            <div className="grid md:grid-cols-3 gap-5">
              <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
                {uploadedImage && <img src={uploadedImage} alt="Analyzed" className="w-full max-w-[180px] rounded-xl object-cover mb-4" />}
                <button onClick={handleReset} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-display"><RotateCcw className="w-4 h-4" /> Analyze another</button>
              </div>

              <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center justify-center shine-line">
                <ScoreGauge score={analysis.overallScore} />
                <span className="text-xs font-display text-muted-foreground mt-3 uppercase tracking-wider">Eye Score</span>
                <span className="text-xs font-display text-silver mt-1">{analysis.archetype}</span>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-status-warning" /><h3 className="text-sm font-display font-semibold text-foreground">Strengths</h3></div>
                <div className="space-y-3">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-status-success mt-0.5 shrink-0" /><span className="text-sm text-muted-foreground">{s}</span></div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2"><Eye className="w-5 h-5 text-silver" /> Detailed Metrics</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(analysis.metrics).map(([key, m]) => (
                  <MetricBar key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} score={m.score} tag={m.label} detail={m.detail} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-silver" /> Enhancement Tips</h2>
              <div className="space-y-3">
                {analysis.tips.map((tip, i) => (
                  <div key={i} className="glass-card rounded-xl p-5 hover-glow transition-all flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg glass-card-strong flex items-center justify-center text-sm font-display font-bold text-foreground shrink-0">{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h4 className="font-display font-semibold text-foreground text-sm">{tip.action}</h4>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border font-display", impactColor[tip.impact])}>{tip.impact}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tip.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 text-center text-muted-foreground text-xs">Demo mode — results are simulated. Photos are not stored.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeAnalyzerPage;
