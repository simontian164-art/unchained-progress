import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Upload, RotateCcw, ArrowLeft, Dumbbell, Scissors, Heart, ChevronDown, ChevronUp, Zap, Target, TrendingUp, Shield } from "lucide-react";

const mockAnalysis = {
  overallScore: 68,
  definition: { score: 65, level: "moderate", assessment: "Decent jawline definition with room for improvement through body fat reduction and targeted exercises." },
  angle: { score: 70, measurement: "125°", ideal: "115-120°", assessment: "Slightly obtuse gonial angle. Lowering body fat can sharpen this." },
  symmetry: { score: 75, assessment: "Good bilateral symmetry with minor differences." },
  chin: { score: 72, projection: "average", assessment: "Average chin projection. Good balance with other features." },
  neckDefinition: { score: 60, assessment: "Moderate neck-jaw separation. Can be improved." },
  bodyFatImpact: { estimatedFacialBF: "moderate", assessment: "Body fat is the #1 controllable factor for jawline appearance. Even 3-5% reduction can dramatically reveal existing bone structure.", potentialGain: "+8-12 points with 3-5% BF reduction" },
  exercises: [
    { name: "Chin Tucks", description: "Pull chin straight back creating a double chin. Hold 5 seconds. Release.", frequency: "3 sets of 15, daily", targetArea: "Neck posture", expectedTimeframe: "2-4 weeks", effectiveness: "high" },
    { name: "Jaw Clenches", description: "Clench jaw firmly for 5 seconds, release slowly.", frequency: "3 sets of 10, daily", targetArea: "Masseter", expectedTimeframe: "4-8 weeks", effectiveness: "medium" },
    { name: "Tongue Press", description: "Press tongue firmly against roof of mouth. Hold 10 seconds.", frequency: "Throughout the day", targetArea: "Jaw muscles", expectedTimeframe: "6-12 weeks", effectiveness: "medium" },
  ],
  grooming: [
    { tip: "Maintain clean neckline", reason: "Defined beard line or clean shave below jawline enhances visible definition", priority: "high" },
    { tip: "Consider stubble length", reason: "Light stubble can add perceived definition and shadow", priority: "medium" },
  ],
  lifestyle: [
    { action: "Reduce body fat to 12-15%", impact: "Single biggest factor for jawline visibility", timeframe: "3-6 months" },
    { action: "Improve posture", impact: "Forward head posture hides jaw definition", timeframe: "2-4 weeks" },
    { action: "Stay hydrated", impact: "Reduces facial bloating and puffiness", timeframe: "1-2 weeks" },
  ],
  summary: "Moderate jawline definition with good symmetry. Primary improvement path is through body fat reduction.",
};

const ScoreRing = ({ score, size = 140, label }: { score: number; size?: number; label?: string }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "hsl(var(--status-success))" : score >= 50 ? "hsl(var(--status-warning))" : "hsl(var(--destructive))";
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-foreground">{score}</span>
        <span className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">/100</span>
      </div>
      {label && <span className="text-xs text-muted-foreground font-display mt-2 uppercase tracking-wider">{label}</span>}
    </div>
  );
};

const MiniBar = ({ score, label }: { score: number; label: string }) => {
  const color = score >= 75 ? "bg-[hsl(var(--status-success))]" : score >= 50 ? "bg-[hsl(var(--status-warning))]" : "bg-destructive";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center"><span className="text-xs font-display text-muted-foreground uppercase tracking-wider">{label}</span><span className="text-xs font-display text-foreground font-bold">{score}</span></div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${score}%` }} /></div>
    </div>
  );
};

const ExerciseCard = ({ exercise }: { exercise: typeof mockAnalysis.exercises[0] }) => {
  const [open, setOpen] = useState(false);
  const effColor = exercise.effectiveness === "high" ? "text-[hsl(var(--status-success))]" : exercise.effectiveness === "medium" ? "text-[hsl(var(--status-warning))]" : "text-muted-foreground";
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Dumbbell className="w-4 h-4 text-foreground" /></div>
          <div><h4 className="text-sm font-display font-semibold text-foreground">{exercise.name}</h4><p className="text-xs text-muted-foreground font-display">{exercise.targetArea} · {exercise.frequency}</p></div>
        </div>
        <div className="flex items-center gap-2"><span className={cn("text-xs font-display uppercase", effColor)}>{exercise.effectiveness}</span>{open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}</div>
      </button>
      {open && (<div className="px-4 pb-4 border-t border-border pt-3 space-y-2"><p className="text-sm text-foreground">{exercise.description}</p><p className="text-xs text-muted-foreground font-display">Expected results: {exercise.expectedTimeframe}</p></div>)}
    </div>
  );
};

// Interactive slider meter
const SliderMeter = ({ label, value, onChange, min = 0, max = 100 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) => {
  const pct = ((value - min) / (max - min)) * 100;
  const color = pct >= 75 ? "hsl(var(--status-success))" : pct >= 50 ? "hsl(var(--status-warning))" : "hsl(var(--destructive))";
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-sm font-display font-bold text-foreground">{value}</span>
      </div>
      <div className="relative h-2 bg-muted rounded-full">
        <div className="absolute h-full rounded-full transition-all duration-200" style={{ width: `${pct}%`, background: color }} />
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-foreground bg-background shadow-lg transition-all duration-200 pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
};

const JawlineAnalyzerPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scores" | "exercises" | "grooming" | "lifestyle">("scores");

  // Slider-based self-assessment
  const [selfAssessMode, setSelfAssessMode] = useState(false);
  const [sliders, setSliders] = useState({ definition: 50, angle: 50, symmetry: 50, chinProjection: 50, neckSeparation: 50 });

  const selfScore = Math.round(
    sliders.definition * 0.3 + sliders.angle * 0.2 + sliders.symmetry * 0.2 + sliders.chinProjection * 0.15 + sliders.neckSeparation * 0.15
  );
  const selfGrade = selfScore >= 85 ? "Elite" : selfScore >= 70 ? "Strong" : selfScore >= 50 ? "Average" : "Below Average";
  const selfGradeColor = selfScore >= 85 ? "text-[hsl(var(--status-success))]" : selfScore >= 70 ? "text-[hsl(var(--status-warning))]" : selfScore >= 50 ? "text-muted-foreground" : "text-destructive";

  const updateSlider = (key: keyof typeof sliders) => (value: number) => setSliders((prev) => ({ ...prev, [key]: value }));

  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setUploadedImage(e.target?.result as string); runAnalysis(); };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => { setIsAnalyzing(true); setAnalysis(null); setSelfAssessMode(false); await new Promise((r) => setTimeout(r, 2500)); setAnalysis(mockAnalysis); setIsAnalyzing(false); };
  const reset = () => { setAnalysis(null); setUploadedImage(null); setActiveTab("scores"); setSelfAssessMode(false); };

  const tabs = [
    { id: "scores" as const, label: "Scores", icon: Target },
    { id: "exercises" as const, label: "Exercises", icon: Dumbbell },
    { id: "grooming" as const, label: "Grooming", icon: Scissors },
    { id: "lifestyle" as const, label: "Lifestyle", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center justify-between">
          <button onClick={() => navigate("/hub")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /><span className="text-sm font-display">Hub</span></button>
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Jawline Analyzer</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 container py-10 max-w-4xl mx-auto">
        {!analysis && !isAnalyzing ? (
          <div className="space-y-10">
            {/* Upload section */}
            <div className="flex flex-col items-center justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-20 h-20 rounded-2xl glass-card-strong flex items-center justify-center mb-6"><Shield className="w-9 h-9 text-silver" /></div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Jawline Analysis</h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">Upload a photo for AI analysis, or use the self-assessment sliders below.</p>
              <div className="flex items-center gap-4">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <button onClick={() => fileRef.current?.click()} className="btn-premium flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Photo</button>
                <button onClick={() => setSelfAssessMode(true)} className="btn-premium-outline flex items-center gap-2 text-sm"><Target className="w-4 h-4" /> Self-Assess</button>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-display">Demo mode · Results are simulated</p>
            </div>

            {/* Self-assessment slider panel */}
            {selfAssessMode && (
              <div className="max-w-lg mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="glass-card-strong rounded-2xl p-6 shine-line">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-foreground text-sm tracking-wide">JAWLINE DEFINITION METER</h3>
                    <button onClick={() => setSelfAssessMode(false)} className="text-xs text-muted-foreground hover:text-foreground font-display">Close</button>
                  </div>

                  {/* Live score ring */}
                  <div className="flex justify-center mb-8">
                    <div className="flex flex-col items-center">
                      <ScoreRing score={selfScore} size={120} />
                      <span className={cn("text-sm font-display font-bold mt-3", selfGradeColor)}>{selfGrade}</span>
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-5">
                    <SliderMeter label="Jawline Definition" value={sliders.definition} onChange={updateSlider("definition")} />
                    <SliderMeter label="Gonial Angle Sharpness" value={sliders.angle} onChange={updateSlider("angle")} />
                    <SliderMeter label="Bilateral Symmetry" value={sliders.symmetry} onChange={updateSlider("symmetry")} />
                    <SliderMeter label="Chin Projection" value={sliders.chinProjection} onChange={updateSlider("chinProjection")} />
                    <SliderMeter label="Neck-Jaw Separation" value={sliders.neckSeparation} onChange={updateSlider("neckSeparation")} />
                  </div>

                  {/* Weighted breakdown */}
                  <div className="mt-6 pt-5 border-t border-border">
                    <h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-3">Score Weights</h4>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {[
                        { label: "Def.", weight: "30%" },
                        { label: "Angle", weight: "20%" },
                        { label: "Sym.", weight: "20%" },
                        { label: "Chin", weight: "15%" },
                        { label: "Neck", weight: "15%" },
                      ].map((w) => (
                        <div key={w.label} className="glass-card rounded-lg p-2">
                          <span className="text-[10px] text-muted-foreground font-display block">{w.label}</span>
                          <span className="text-xs font-display font-bold text-foreground">{w.weight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tip based on score */}
                  <div className="mt-5 glass-card rounded-xl p-4 flex items-start gap-3">
                    <Zap className="w-4 h-4 text-[hsl(var(--status-warning))] mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      {selfScore >= 75
                        ? "Strong jawline profile. Focus on maintenance through posture and body fat management."
                        : selfScore >= 50
                        ? "Average definition. Lowering body fat to 12-15% and jaw exercises can significantly improve your score."
                        : "Room for improvement. Body fat reduction is the #1 controllable factor — even 3-5% drop reveals more structure."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 rounded-full border-2 border-border border-t-foreground animate-spin mb-6" />
            <p className="text-foreground font-display font-semibold">Analyzing jawline…</p>
            <p className="text-muted-foreground text-sm mt-1">Detecting definition, angle & symmetry</p>
          </div>
        ) : analysis ? (
          <div className="space-y-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="grid md:grid-cols-[1fr_200px] gap-8 items-start">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div><h2 className="text-2xl font-display font-bold text-foreground mb-1">Analysis Complete</h2><p className="text-muted-foreground text-sm">{analysis.summary}</p></div>
                  <button onClick={reset} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-display"><RotateCcw className="w-3 h-3" /> New</button>
                </div>
                <div className="flex items-center gap-8">
                  <ScoreRing score={analysis.overallScore} label="Overall" />
                  <div className="space-y-2 flex-1">
                    <div className="glass-card rounded-lg p-3"><span className="text-xs font-display text-muted-foreground uppercase">Definition</span><p className="text-foreground font-display font-bold capitalize">{analysis.definition.level}</p></div>
                    <div className="glass-card rounded-lg p-3"><span className="text-xs font-display text-muted-foreground uppercase">Gonial Angle</span><p className="text-foreground font-display font-bold">{analysis.angle.measurement}</p></div>
                    <div className="glass-card rounded-lg p-3"><span className="text-xs font-display text-muted-foreground uppercase">Body Fat Impact</span><p className="text-foreground font-display font-bold capitalize">{analysis.bodyFatImpact.estimatedFacialBF}</p><p className="text-xs text-muted-foreground">{analysis.bodyFatImpact.potentialGain}</p></div>
                  </div>
                </div>
              </div>
              {uploadedImage && (<div className="hidden md:block"><img src={uploadedImage} alt="Analyzed" className="w-full aspect-square object-cover rounded-xl grayscale opacity-60" /><p className="text-xs text-muted-foreground font-display mt-2 text-center">Not stored</p></div>)}
            </div>

            <div className="flex gap-1 p-1 glass-card rounded-xl">
              {tabs.map((tab) => { const Icon = tab.icon; return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-display font-semibold transition-all", activeTab === tab.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}><Icon className="w-3.5 h-3.5" /> {tab.label}</button>
              ); })}
            </div>

            {activeTab === "scores" && (
              <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>
                <MiniBar score={analysis.definition.score} label="Definition" />
                <MiniBar score={analysis.angle.score} label="Gonial Angle" />
                <MiniBar score={analysis.symmetry.score} label="Symmetry" />
                <MiniBar score={analysis.chin.score} label="Chin Projection" />
                <MiniBar score={analysis.neckDefinition.score} label="Neck-Jaw Separation" />
                <div className="space-y-3 pt-4">
                  {[{ title: "Definition", text: analysis.definition.assessment }, { title: "Angle", text: analysis.angle.assessment }, { title: "Symmetry", text: analysis.symmetry.assessment }, { title: "Chin", text: analysis.chin.assessment }, { title: "Neck", text: analysis.neckDefinition.assessment }].map((item) => (
                    <div key={item.title} className="glass-card rounded-xl p-4"><h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-1">{item.title}</h4><p className="text-sm text-foreground">{item.text}</p></div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "exercises" && (<div className="space-y-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}><p className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-2">{analysis.exercises.length} exercises recommended</p>{analysis.exercises.map((ex, i) => (<ExerciseCard key={i} exercise={ex} />))}</div>)}
            {activeTab === "grooming" && (<div className="space-y-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>{analysis.grooming.map((g, i) => { const prioColor = g.priority === "high" ? "text-[hsl(var(--status-success))]" : "text-[hsl(var(--status-warning))]"; return (<div key={i} className="glass-card rounded-xl p-4"><div className="flex items-start justify-between gap-3 mb-2"><h4 className="text-sm font-display font-semibold text-foreground">{g.tip}</h4><span className={cn("text-xs font-display uppercase shrink-0", prioColor)}>{g.priority}</span></div><p className="text-xs text-muted-foreground">{g.reason}</p></div>); })}</div>)}
            {activeTab === "lifestyle" && (<div className="space-y-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>{analysis.lifestyle.map((l, i) => (<div key={i} className="glass-card rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-[hsl(var(--status-success))]" /><h4 className="text-sm font-display font-semibold text-foreground">{l.action}</h4></div><p className="text-sm text-foreground mb-1">{l.impact}</p><p className="text-xs text-muted-foreground font-display">{l.timeframe}</p></div>))}</div>)}

            <div className="glass-card-strong rounded-xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-[hsl(var(--status-warning))]" /><h3 className="text-sm font-display font-bold text-foreground">Body Fat Factor</h3></div>
              <p className="text-sm text-foreground">{analysis.bodyFatImpact.assessment}</p>
              <p className="text-xs text-muted-foreground mt-2 font-display">Potential improvement: {analysis.bodyFatImpact.potentialGain}</p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default JawlineAnalyzerPage;
