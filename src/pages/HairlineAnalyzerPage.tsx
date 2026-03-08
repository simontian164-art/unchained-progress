import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, RotateCcw, Crown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mockAnalysis = {
  overallScore: 78,
  grade: "B+",
  hairlineType: "Mature Rounded",
  density: 82,
  symmetry: 85,
  templeRecession: 18,
  foreheadRatio: 0.33,
  metrics: [
    { label: "Hairline Density", score: 82, tag: "Strong", detail: "Good follicle density across frontal line" },
    { label: "Symmetry", score: 85, tag: "Excellent", detail: "Minimal left-right deviation detected" },
    { label: "Temple Fullness", score: 72, tag: "Moderate", detail: "Slight recession at temporal peaks" },
    { label: "Forehead Proportion", score: 76, tag: "Good", detail: "Within ideal 1/3 facial thirds ratio" },
    { label: "Hairline Definition", score: 80, tag: "Strong", detail: "Clear, well-defined frontal border" },
    { label: "Norwood Scale", score: 88, tag: "NW1-2", detail: "Minimal to no significant recession" },
  ],
  strengths: ["Strong mid-scalp density", "Symmetrical hairline shape", "Good frontal definition"],
  tips: [
    { title: "Scalp Massage", description: "Daily 5-min massage to boost blood flow to follicles", impact: "medium" },
    { title: "Biotin Supplementation", description: "Support keratin production for hair strength", impact: "medium" },
    { title: "Minoxidil (Temples)", description: "Target slight temple recession with topical treatment", impact: "high" },
    { title: "Low-Level Laser Therapy", description: "Stimulate dormant follicles at hairline edge", impact: "high" },
  ],
};

type Analysis = typeof mockAnalysis;

const ScoreGauge = ({ score, size = 150 }: { score: number; size?: number }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 50% 50%)";
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : "C";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground font-display">{grade}</span>
      </div>
    </div>
  );
};

const MetricBar = ({ label, score, tag, detail }: { label: string; score: number; tag: string; detail: string }) => {
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 50% 50%)";
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-display text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-display text-muted-foreground px-2 py-0.5 rounded-full glass-card">{tag}</span>
          <span className="text-xs font-display font-bold text-foreground">{score}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, transition: "width 1s ease-out" }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{detail}</p>
    </div>
  );
};

const HairlineAnalyzerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => { setUploadedImage(e.target?.result as string); runAnalysis(); };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2200));
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const handleReset = () => { setAnalysis(null); setUploadedImage(null); };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Hairline Analyzer</h1>
            <p className="text-muted-foreground text-[11px] font-display">AI-powered hairline health assessment</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-4xl mx-auto">
          {!analysis && !isAnalyzing && (
            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div
                className={cn("glass-card-strong rounded-2xl p-12 text-center transition-all cursor-pointer", isDragging && "ring-2 ring-silver/30")}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-bold text-foreground mb-2">Upload Forehead Photo</h3>
                <p className="text-muted-foreground text-sm mb-1">Front-facing, hairline visible, good lighting</p>
                <p className="text-muted-foreground/50 text-xs">Demo mode — results are simulated</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-card-strong rounded-2xl p-16 text-center opacity-0 animate-fade-in">
              <div className="w-16 h-16 rounded-full border-2 border-muted border-t-foreground animate-spin mx-auto mb-6" />
              <h3 className="font-display font-bold text-foreground mb-2">Analyzing Hairline</h3>
              <p className="text-muted-foreground text-sm">Mapping density, symmetry & recession…</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Top row */}
              <div className="flex items-center justify-between opacity-0 animate-fade-in">
                <h2 className="font-display font-bold text-foreground text-sm tracking-wide">ANALYSIS RESULTS</h2>
                <button onClick={handleReset} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-display glass-card rounded-lg px-3 py-2">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Score + image */}
                <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  {uploadedImage && (
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <img src={uploadedImage} alt="Uploaded" className="w-full aspect-[4/3] object-cover" />
                    </div>
                  )}
                  <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
                    <ScoreGauge score={analysis.overallScore} />
                    <p className="text-xs font-display text-muted-foreground mt-3">Hairline Health Score</p>
                    <div className="glass-card rounded-lg px-3 py-1.5 mt-2">
                      <span className="text-[11px] font-display text-foreground">{analysis.hairlineType}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="md:col-span-2 space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <div className="glass-card rounded-2xl p-6 space-y-5">
                    <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2">
                      <Crown className="w-4 h-4 text-status-warning" /> DETAILED METRICS
                    </h3>
                    {analysis.metrics.map((m) => (
                      <MetricBar key={m.label} {...m} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths + Tips */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-status-success" /> STRENGTHS
                  </h3>
                  <div className="space-y-3">
                    {analysis.strengths.map((s) => (
                      <div key={s} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                  <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-silver" /> IMPROVEMENT TIPS
                  </h3>
                  <div className="space-y-3">
                    {analysis.tips.map((t) => (
                      <div key={t.title} className="glass-card rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={cn("w-3 h-3", t.impact === "high" ? "text-status-warning" : "text-muted-foreground")} />
                          <span className="text-xs font-display font-bold text-foreground">{t.title}</span>
                          <span className={cn("text-[9px] font-display px-1.5 py-0.5 rounded-full ml-auto",
                            t.impact === "high" ? "bg-status-warning/10 text-status-warning" : "bg-muted text-muted-foreground"
                          )}>{t.impact}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HairlineAnalyzerPage;
