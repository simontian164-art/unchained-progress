import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Upload, Camera, RotateCcw, Star, Zap, TrendingUp, CheckCircle, Clock, Sparkles, Shield, ArrowLeft } from "lucide-react";

const mockAnalysis = {
  overallScore: 74,
  features: {
    jawline: { score: 72, definition: "Moderate", shape: "Angular", assessment: "Decent jawline with room for improvement through body fat reduction.", tip: "Lower body fat to 12-15% to reveal more definition." },
    cheekbones: { score: 78, prominence: "Medium-high", assessment: "Good cheekbone projection, creates nice facial structure.", tip: "Mewing and proper tongue posture can enhance appearance." },
    eyes: { score: 80, shape: "Almond", spacing: "Proportionate", symmetry: "Good", assessment: "Well-shaped eyes with good symmetry.", tip: "Proper sleep and hydration keep the eye area fresh." },
    nose: { score: 70, profile: "Straight", proportion: "Slightly wide", assessment: "Proportionate nose with minor width deviation.", tip: "Nose contouring or angles in photos can minimize perceived width." },
    skinQuality: { score: 76, texture: "Smooth", clarity: "Good", tone: "Even", assessment: "Overall good skin with minor texture variations.", tip: "Consistent SPF and retinol routine for long-term improvement." },
  },
  harmony: { score: 75, assessment: "Good facial harmony with balanced proportions" },
  topStrengths: ["Eye symmetry and shape", "Cheekbone projection", "Even skin tone"],
  priorityImprovements: [
    { feature: "Jawline", action: "Focus on reducing body fat and jaw exercises", expectedImpact: "high" as const, timeframe: "3-6 months" },
    { feature: "Skin Texture", action: "Add chemical exfoliation to routine", expectedImpact: "medium" as const, timeframe: "4-8 weeks" },
    { feature: "Under-eye Area", action: "Improve sleep quality and hydration", expectedImpact: "medium" as const, timeframe: "2-4 weeks" },
  ],
};

const RadialGauge = ({ score, size = 180 }: { score: number; size?: number }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const getColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444";
  const getGrade = (s: number) => s >= 90 ? "S" : s >= 80 ? "A" : s >= 70 ? "B" : s >= 60 ? "C" : s >= 50 ? "D" : "F";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(0 0% 12%)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={getColor(score)} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-display font-bold text-foreground">{score}</span>
        <span className="text-lg font-display font-semibold mt-1" style={{ color: getColor(score) }}>Grade {getGrade(score)}</span>
      </div>
    </div>
  );
};

const FeatureCard = ({ name, icon, score, traits, assessment, tip }: { name: string; icon: React.ReactNode; score: number; traits: { label: string; value: string }[]; assessment: string; tip: string; }) => {
  const barColor = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="glass-card rounded-2xl p-6 hover-glow transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-card-strong flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
          <h3 className="font-display font-bold text-foreground text-sm">{name}</h3>
        </div>
        <div className="text-right"><span className="text-2xl font-display font-bold text-foreground">{score}</span><span className="text-xs text-muted-foreground ml-0.5">/100</span></div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4"><div className={cn("h-full rounded-full", barColor)} style={{ width: `${score}%`, transition: "width 1.2s ease-out" }} /></div>
      <div className="flex flex-wrap gap-2 mb-4">
        {traits.map((t) => (<span key={t.label} className="text-xs px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground font-display">{t.label}: <span className="text-foreground">{t.value}</span></span>))}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{assessment}</p>
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30"><Zap className="w-3.5 h-3.5 text-status-warning mt-0.5 shrink-0" /><p className="text-xs text-silver-dim">{tip}</p></div>
    </div>
  );
};

const AttractivenessPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setUploadedImage(e.target?.result as string); runAnalysis(); };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => { setIsAnalyzing(true); setAnalysis(null); await new Promise((r) => setTimeout(r, 2500)); setAnalysis(mockAnalysis); setIsAnalyzing(false); };
  const handleReset = () => { setAnalysis(null); setUploadedImage(null); };

  const impactColors: Record<string, string> = {
    high: "text-green-400 bg-green-500/10 border-green-500/20",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    low: "text-muted-foreground bg-muted/30 border-border",
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Attractiveness Score</h1>
        </div>
      </header>
      <div className="relative z-10 container py-10 md:py-16 max-w-5xl">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6"><Sparkles className="w-4 h-4 text-silver" /><span className="text-xs font-display text-silver">AI Feature Analysis</span></div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">Attractiveness Score</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Upload a front-facing photo. Get detailed scores for jawline, cheekbones, eyes, nose, and skin quality.</p>
        </div>

        {!analysis && !isAnalyzing && (
          <div className="max-w-lg mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div onClick={() => fileInputRef.current?.click()} onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} className={cn("glass-card-strong rounded-2xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300", isDragging ? "ring-2 ring-silver/30 scale-[1.02]" : "hover:ring-1 hover:ring-silver/15")}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mx-auto mb-6"><Camera className="w-7 h-7 text-silver" /></div>
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
              <div className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mx-auto mb-5" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Analyzing features...</h3>
              <p className="text-muted-foreground text-sm">Scoring jawline, cheekbones, eyes, nose & skin</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-5 opacity-0 animate-fade-in">
              <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
                {uploadedImage && <img src={uploadedImage} alt="Analyzed" className="w-full max-w-[180px] rounded-xl object-cover mb-4" />}
                <button onClick={handleReset} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-display"><RotateCcw className="w-4 h-4" /> Analyze another</button>
              </div>
              <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center justify-center shine-line">
                <RadialGauge score={analysis.overallScore} />
                <span className="text-sm font-display text-muted-foreground mt-3">Overall Score</span>
                {analysis.harmony && (
                  <div className="mt-4 w-full pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm mb-1.5"><span className="text-muted-foreground font-display">Facial Harmony</span><span className="font-display font-bold text-foreground">{analysis.harmony.score}</span></div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-silver rounded-full" style={{ width: `${analysis.harmony.score}%`, transition: "width 1.2s ease-out" }} /></div>
                    <p className="text-xs text-muted-foreground mt-2">{analysis.harmony.assessment}</p>
                  </div>
                )}
              </div>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5"><Star className="w-4 h-4 text-status-warning" /><h3 className="text-sm font-display font-semibold text-foreground">Top Strengths</h3></div>
                <div className="space-y-3">{analysis.topStrengths?.map((s, i) => (<div key={i} className="flex items-start gap-2.5"><CheckCircle className="w-4 h-4 text-status-success mt-0.5 shrink-0" /><span className="text-sm text-muted-foreground">{s}</span></div>))}</div>
              </div>
            </div>

            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2"><Shield className="w-5 h-5 text-silver" /> Feature Breakdown</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureCard name="Jawline" icon={<span className="text-sm font-bold text-silver">J</span>} score={analysis.features.jawline.score} traits={[{ label: "Definition", value: analysis.features.jawline.definition }, { label: "Shape", value: analysis.features.jawline.shape }]} assessment={analysis.features.jawline.assessment} tip={analysis.features.jawline.tip} />
                <FeatureCard name="Cheekbones" icon={<span className="text-sm font-bold text-silver">C</span>} score={analysis.features.cheekbones.score} traits={[{ label: "Prominence", value: analysis.features.cheekbones.prominence }]} assessment={analysis.features.cheekbones.assessment} tip={analysis.features.cheekbones.tip} />
                <FeatureCard name="Eyes" icon={<span className="text-sm font-bold text-silver">E</span>} score={analysis.features.eyes.score} traits={[{ label: "Shape", value: analysis.features.eyes.shape }, { label: "Spacing", value: analysis.features.eyes.spacing }, { label: "Symmetry", value: analysis.features.eyes.symmetry }]} assessment={analysis.features.eyes.assessment} tip={analysis.features.eyes.tip} />
                <FeatureCard name="Nose" icon={<span className="text-sm font-bold text-silver">N</span>} score={analysis.features.nose.score} traits={[{ label: "Profile", value: analysis.features.nose.profile }, { label: "Proportion", value: analysis.features.nose.proportion }]} assessment={analysis.features.nose.assessment} tip={analysis.features.nose.tip} />
                <FeatureCard name="Skin Quality" icon={<Sparkles className="w-4 h-4 text-silver" />} score={analysis.features.skinQuality.score} traits={[{ label: "Texture", value: analysis.features.skinQuality.texture }, { label: "Clarity", value: analysis.features.skinQuality.clarity }, { label: "Tone", value: analysis.features.skinQuality.tone }]} assessment={analysis.features.skinQuality.assessment} tip={analysis.features.skinQuality.tip} />
              </div>
            </div>

            {analysis.priorityImprovements?.length > 0 && (
              <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-silver" /> Priority Improvements</h2>
                <div className="space-y-3">
                  {analysis.priorityImprovements.map((imp, i) => (
                    <div key={i} className="glass-card rounded-xl p-5 hover-glow transition-all flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg glass-card-strong flex items-center justify-center text-sm font-display font-bold text-foreground shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h4 className="font-display font-semibold text-foreground text-sm">{imp.feature}</h4>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-display", impactColors[imp.expectedImpact])}>{imp.expectedImpact} impact</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{imp.action}</p>
                        <p className="text-xs text-silver-dim flex items-center gap-1.5"><Clock className="w-3 h-3" />{imp.timeframe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card rounded-xl p-4 text-center text-muted-foreground text-xs">Demo mode — results are simulated. Photos are not stored.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttractivenessPage;
