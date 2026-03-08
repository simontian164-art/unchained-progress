import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Upload, Camera, RotateCcw, ArrowLeft, Sparkles, TrendingUp, CheckCircle, Zap, Target } from "lucide-react";

const mockAnalysis = {
  overallScore: 73,
  metrics: {
    nasalIndex: { score: 75, value: "0.68", ideal: "0.67", label: "Normal", detail: "Width-to-height ratio is very close to the leptorrhine ideal." },
    bridgeWidth: { score: 78, value: "31mm", ideal: "~30mm", label: "Proportionate", detail: "Nasal bridge width is well-balanced relative to intercanthal distance." },
    tipProjection: { score: 70, value: "0.64", ideal: "0.67", label: "Slightly Under", detail: "Tip projection ratio (Goode method) is marginally below ideal." },
    tipRotation: { score: 72, value: "98°", ideal: "95-105°", label: "Good", detail: "Nasolabial angle is within the attractive range for males." },
    dorsalProfile: { score: 76, value: "Straight", ideal: "Straight/Slight scoop", label: "Attractive", detail: "Straight dorsal line is considered classically attractive." },
    alarWidth: { score: 68, value: "36mm", ideal: "~34mm", label: "Slightly Wide", detail: "Alar base width slightly exceeds intercanthal distance." },
    nasofrontalAngle: { score: 74, value: "132°", ideal: "130-135°", label: "Good", detail: "The angle between forehead and nasal dorsum is within ideal range." },
    symmetry: { score: 80, value: "High", ideal: "Symmetric", label: "Good", detail: "Minimal deviation between left and right nasal structures." },
  },
  grade: "B+",
  archetype: "Classical Straight",
  strengths: ["Straight dorsal profile", "Good bilateral symmetry", "Proportionate bridge width", "Ideal nasofrontal angle"],
  tips: [
    { action: "Contouring with matte bronzer", impact: "medium", detail: "Shadow along the bridge sides narrows perceived width. Highlight the dorsal line." },
    { action: "Photograph from optimal angles", impact: "medium", detail: "Slightly elevated camera angle (10-15°) minimizes alar width perception." },
    { action: "Maintain clear skin around nose", impact: "low", detail: "Pore visibility and redness draw attention to nose proportions." },
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

// Visual nose proportion diagram (SVG)
const NoseDiagram = ({ analysis }: { analysis: Analysis }) => {
  const alarColor = analysis.metrics.alarWidth.score >= 75 ? "hsl(var(--status-success))" : "hsl(var(--status-warning))";
  const bridgeColor = analysis.metrics.bridgeWidth.score >= 75 ? "hsl(var(--status-success))" : "hsl(var(--status-warning))";
  const tipColor = analysis.metrics.tipProjection.score >= 75 ? "hsl(var(--status-success))" : "hsl(var(--status-warning))";

  return (
    <div className="glass-card-strong rounded-2xl p-6 shine-line">
      <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-4 text-center">Proportion Diagram</h3>
      <svg viewBox="0 0 200 260" className="w-full max-w-[180px] mx-auto" fill="none">
        {/* Nose outline - front view */}
        {/* Bridge */}
        <path d="M 90 30 L 85 100 Q 80 130 70 150 Q 65 160 75 170 L 100 180 L 125 170 Q 135 160 130 150 Q 120 130 115 100 L 110 30" stroke="hsl(0 0% 40%)" strokeWidth="1.5" fill="hsl(0 0% 8%)" />
        
        {/* Nostrils */}
        <ellipse cx="85" cy="165" rx="10" ry="6" stroke="hsl(0 0% 30%)" strokeWidth="1" fill="hsl(0 0% 6%)" />
        <ellipse cx="115" cy="165" rx="10" ry="6" stroke="hsl(0 0% 30%)" strokeWidth="1" fill="hsl(0 0% 6%)" />
        
        {/* Tip highlight */}
        <circle cx="100" cy="155" r="4" fill={tipColor} opacity="0.4" />
        <circle cx="100" cy="155" r="2" fill={tipColor} opacity="0.8" />
        
        {/* Bridge width measurement */}
        <line x1="84" y1="80" x2="116" y2="80" stroke={bridgeColor} strokeWidth="1" strokeDasharray="3 2" />
        <line x1="84" y1="76" x2="84" y2="84" stroke={bridgeColor} strokeWidth="1" />
        <line x1="116" y1="76" x2="116" y2="84" stroke={bridgeColor} strokeWidth="1" />
        <text x="100" y="74" textAnchor="middle" fill={bridgeColor} fontSize="8" fontFamily="Space Grotesk">{analysis.metrics.bridgeWidth.value}</text>
        
        {/* Alar width measurement */}
        <line x1="65" y1="168" x2="135" y2="168" stroke={alarColor} strokeWidth="1" strokeDasharray="3 2" />
        <line x1="65" y1="164" x2="65" y2="172" stroke={alarColor} strokeWidth="1" />
        <line x1="135" y1="164" x2="135" y2="172" stroke={alarColor} strokeWidth="1" />
        <text x="100" y="185" textAnchor="middle" fill={alarColor} fontSize="8" fontFamily="Space Grotesk">{analysis.metrics.alarWidth.value}</text>
        
        {/* Dorsal line */}
        <line x1="100" y1="30" x2="100" y2="150" stroke="hsl(0 0% 50%)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
        
        {/* Nasofrontal angle arc */}
        <path d="M 93 35 Q 100 25 107 35" stroke="hsl(0 0% 60%)" strokeWidth="0.8" fill="none" />
        <text x="100" y="22" textAnchor="middle" fill="hsl(0 0% 50%)" fontSize="7" fontFamily="Space Grotesk">{analysis.metrics.nasofrontalAngle.value}</text>
        
        {/* Labels */}
        <text x="45" y="82" textAnchor="end" fill="hsl(0 0% 45%)" fontSize="7" fontFamily="Space Grotesk">Bridge</text>
        <text x="155" y="170" textAnchor="start" fill="hsl(0 0% 45%)" fontSize="7" fontFamily="Space Grotesk">Alar</text>
        <text x="155" y="155" textAnchor="start" fill="hsl(0 0% 45%)" fontSize="7" fontFamily="Space Grotesk">Tip</text>

        {/* Tip rotation angle indicator */}
        <path d="M 100 155 L 100 195" stroke="hsl(0 0% 30%)" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d="M 100 155 L 115 175" stroke="hsl(0 0% 50%)" strokeWidth="0.8" />
        <text x="118" y="188" textAnchor="start" fill="hsl(0 0% 50%)" fontSize="7" fontFamily="Space Grotesk">{analysis.metrics.tipRotation.value}</text>
      </svg>

      {/* Diagram legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 text-[10px] font-display text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: bridgeColor }} />Bridge</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: alarColor }} />Alar</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: tipColor }} />Tip</span>
      </div>
    </div>
  );
};

// Side profile diagram
const ProfileDiagram = ({ analysis }: { analysis: Analysis }) => {
  const projColor = analysis.metrics.tipProjection.score >= 75 ? "hsl(var(--status-success))" : "hsl(var(--status-warning))";
  
  return (
    <div className="glass-card-strong rounded-2xl p-6 shine-line">
      <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-4 text-center">Side Profile</h3>
      <svg viewBox="0 0 200 240" className="w-full max-w-[180px] mx-auto" fill="none">
        {/* Forehead line */}
        <path d="M 80 20 L 80 60" stroke="hsl(0 0% 35%)" strokeWidth="1.5" />
        
        {/* Nasal dorsum */}
        <path d="M 80 60 L 120 140" stroke="hsl(0 0% 50%)" strokeWidth="1.5" />
        
        {/* Tip and columella */}
        <path d="M 120 140 Q 125 145 122 155 Q 118 162 105 168" stroke="hsl(0 0% 50%)" strokeWidth="1.5" />
        
        {/* Upper lip reference */}
        <path d="M 105 168 L 95 180 L 90 190" stroke="hsl(0 0% 30%)" strokeWidth="1" strokeDasharray="3 2" />
        
        {/* Nasofrontal angle */}
        <path d="M 80 50 Q 85 60 83 70" stroke="hsl(0 0% 60%)" strokeWidth="0.8" fill="none" />
        <text x="68" y="65" textAnchor="end" fill="hsl(0 0% 50%)" fontSize="7" fontFamily="Space Grotesk">{analysis.metrics.nasofrontalAngle.value}</text>
        
        {/* Tip projection line (Goode method) */}
        <line x1="80" y1="168" x2="122" y2="155" stroke={projColor} strokeWidth="1" strokeDasharray="3 2" />
        <line x1="80" y1="60" x2="80" y2="168" stroke="hsl(0 0% 25%)" strokeWidth="0.5" strokeDasharray="2 3" />
        
        {/* Nasolabial angle */}
        <path d="M 112 160 Q 105 168 100 178" stroke="hsl(0 0% 60%)" strokeWidth="0.8" fill="none" />
        <text x="130" y="175" fill="hsl(0 0% 50%)" fontSize="7" fontFamily="Space Grotesk">{analysis.metrics.tipRotation.value}</text>
        
        {/* Tip dot */}
        <circle cx="122" cy="148" r="3" fill={projColor} opacity="0.6" />
        
        {/* Dorsal profile label */}
        <text x="115" y="95" textAnchor="start" fill="hsl(0 0% 45%)" fontSize="7" fontFamily="Space Grotesk">{analysis.metrics.dorsalProfile.value}</text>
        
        {/* Projection label */}
        <text x="95" y="158" textAnchor="middle" fill={projColor} fontSize="7" fontFamily="Space Grotesk">{analysis.metrics.tipProjection.value}</text>
        
        {/* Labels */}
        <text x="65" y="25" textAnchor="end" fill="hsl(0 0% 40%)" fontSize="7" fontFamily="Space Grotesk">Forehead</text>
        <text x="140" y="148" textAnchor="start" fill="hsl(0 0% 40%)" fontSize="7" fontFamily="Space Grotesk">Tip</text>
        <text x="85" y="195" textAnchor="start" fill="hsl(0 0% 35%)" fontSize="7" fontFamily="Space Grotesk">Lip</text>
      </svg>
    </div>
  );
};

const MetricBar = ({ label, score, value, ideal, tag, detail }: { label: string; score: number; value: string; ideal: string; tag: string; detail: string }) => {
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
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
        <span>Yours: <span className="text-foreground font-display">{value}</span></span>
        <span>Ideal: <span className="text-silver-dim font-display">{ideal}</span></span>
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
};

const NoseAnalyzerPage = () => {
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
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Nose Analyzer</h1>
        </div>
      </header>

      <div className="relative z-10 container py-10 md:py-16 max-w-5xl">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6">
            <Target className="w-4 h-4 text-silver" />
            <span className="text-xs font-display text-silver">Proportion Analysis</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">Nose Proportion Analyzer</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Upload a front-facing photo. Get nasal index, bridge width, tip projection, and detailed visual diagrams.</p>
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
              <p className="text-muted-foreground text-sm mb-6">Front-facing and/or side profile, clear lighting</p>
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
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Analyzing nose proportions...</h3>
              <p className="text-muted-foreground text-sm">Measuring nasal index, projection & angles</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-8 opacity-0 animate-fade-in">
            {/* Top row: photo + score + strengths */}
            <div className="grid md:grid-cols-3 gap-5">
              <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
                {uploadedImage && <img src={uploadedImage} alt="Analyzed" className="w-full max-w-[180px] rounded-xl object-cover mb-4" />}
                <button onClick={handleReset} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-display"><RotateCcw className="w-4 h-4" /> Analyze another</button>
              </div>

              <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center justify-center shine-line">
                <ScoreGauge score={analysis.overallScore} />
                <span className="text-xs font-display text-muted-foreground mt-3 uppercase tracking-wider">Nose Score</span>
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

            {/* Visual diagrams */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <Target className="w-5 h-5 text-silver" /> Visual Analysis
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <NoseDiagram analysis={analysis} />
                <ProfileDiagram analysis={analysis} />
              </div>
            </div>

            {/* Metric bars */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-silver" /> Detailed Metrics
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(analysis.metrics).map(([key, m]) => (
                  <MetricBar
                    key={key}
                    label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                    score={m.score} value={m.value} ideal={m.ideal} tag={m.label} detail={m.detail}
                  />
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-silver" /> Enhancement Tips
              </h2>
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

export default NoseAnalyzerPage;
