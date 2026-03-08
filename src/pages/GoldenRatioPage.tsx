import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Upload, Camera, RotateCcw, Sparkles, Ruler, ArrowLeft } from "lucide-react";

const mockAnalysis = {
  overallGoldenScore: 72,
  summary: "Good overall proportions with some deviation from golden ratios in facial width and thirds distribution.",
  measurements: {
    facialThirds: { ratio: 1.05, ideal: 1.0, verdict: "good" },
    faceWidthToHeight: { ratio: 1.52, ideal: 1.618, verdict: "close" },
    eyeSpacing: { ratio: 1.0, ideal: 1.0, verdict: "ideal" },
    noseWidthToFace: { ratio: 0.28, ideal: 0.25, verdict: "good" },
    mouthWidthToNose: { ratio: 1.55, ideal: 1.618, verdict: "close" },
  },
};

const measurementLabels: Record<string, string> = {
  facialThirds: "Facial Thirds",
  faceWidthToHeight: "Width-to-Height",
  eyeSpacing: "Eye Spacing",
  noseWidthToFace: "Nose Width",
  mouthWidthToNose: "Mouth-to-Nose",
};

const GoldenRatioPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);
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

  const runAnalysis = async () => { setIsAnalyzing(true); setAnalysis(null); await new Promise((r) => setTimeout(r, 2500)); setAnalysis(mockAnalysis); setIsAnalyzing(false); };
  const handleReset = () => { setAnalysis(null); setUploadedImage(null); };

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444";
  const verdictColor = (v: string) => {
    if (["ideal", "golden", "excellent"].includes(v)) return "text-green-400";
    if (["good", "close"].includes(v)) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Golden Ratio</h1>
        </div>
      </header>

      <div className="relative z-10 container py-10 md:py-16 max-w-5xl">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6"><Ruler className="w-4 h-4 text-amber-400" /><span className="text-xs font-display text-amber-400">φ = 1.618</span></div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">Golden Ratio Analyzer</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Upload a front-facing photo. See facial measurements and proportion analysis.</p>
        </div>

        {!analysis && !isAnalyzing && (
          <div className="max-w-lg mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div onClick={() => fileInputRef.current?.click()} onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} className={cn("glass-card-strong rounded-2xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300", isDragging ? "ring-2 ring-amber-400/30 scale-[1.02]" : "hover:ring-1 hover:ring-silver/15")}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mx-auto mb-6"><Camera className="w-7 h-7 text-amber-400" /></div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Upload your photo</h3>
              <p className="text-muted-foreground text-sm mb-6">Front-facing, clear lighting, neutral expression</p>
              <button className="btn-premium inline-flex items-center gap-2 text-sm"><Upload className="w-4 h-4" /> Choose File</button>
              <p className="text-muted-foreground/50 text-xs mt-6">Demo mode · Results are simulated</p>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="max-w-lg mx-auto text-center">
            <div className="glass-card-strong rounded-2xl p-12">
              {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="w-24 h-24 rounded-xl object-cover mx-auto mb-6 opacity-60" />}
              <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-5" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Detecting landmarks...</h3>
              <p className="text-muted-foreground text-sm">Mapping facial proportions and golden ratios</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-8 opacity-0 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="glass-card rounded-2xl overflow-hidden">
                {uploadedImage && <img src={uploadedImage} alt="Face" className="w-full block" />}
                <div className="p-4 flex justify-center">
                  <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-display"><RotateCcw className="w-3.5 h-3.5" /> New photo</button>
                </div>
              </div>

              {/* Score + Measurements */}
              <div className="space-y-5">
                <div className="glass-card-strong rounded-2xl p-6 shine-line text-center">
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <svg width="112" height="112" className="-rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(0 0% 12%)" strokeWidth="6" />
                      <circle cx="56" cy="56" r="48" fill="none" stroke={scoreColor(analysis.overallGoldenScore)} strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 * (1 - analysis.overallGoldenScore / 100)} style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-display font-bold text-foreground">{analysis.overallGoldenScore}</span>
                      <span className="text-[10px] text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-1">Golden Ratio Score</h3>
                  <p className="text-xs text-muted-foreground">{analysis.summary}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2"><Ruler className="w-4 h-4 text-amber-400" /> Measurements</h3>
                  {Object.entries(analysis.measurements).map(([key, m]) => {
                    const label = measurementLabels[key] || key;
                    return (
                      <div key={key} className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-display text-foreground">{label}</span>
                          <span className={cn("text-xs font-display px-2 py-0.5 rounded-full border border-current/20", verdictColor(m.verdict))}>{m.verdict}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Yours: <span className="text-foreground font-display">{m.ratio}</span></span>
                          <span className="text-muted-foreground">Ideal: <span className="text-silver-dim font-display">{m.ideal}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 text-center text-muted-foreground text-xs">Demo mode — results are simulated. Photos are not stored.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoldenRatioPage;
