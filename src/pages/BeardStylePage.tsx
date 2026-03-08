import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Upload, Camera, RotateCcw, ArrowLeft, Scissors, CheckCircle, Star, Sparkles } from "lucide-react";

const beardStyles = [
  {
    id: "stubble",
    name: "Designer Stubble",
    description: "3-5 day growth, maintained edges",
    bestFor: ["Oval", "Square", "Diamond"],
    maintenance: "Low",
    attractiveness: 85,
    tips: "Keep neckline clean. Trim every 2-3 days to maintain length.",
  },
  {
    id: "short-boxed",
    name: "Short Boxed Beard",
    description: "Full coverage, trimmed to 1-2cm",
    bestFor: ["Oval", "Round", "Oblong"],
    maintenance: "Medium",
    attractiveness: 82,
    tips: "Define cheek line and neckline. Use beard oil daily.",
  },
  {
    id: "corporate",
    name: "Corporate Beard",
    description: "Professional, well-groomed full beard",
    bestFor: ["Square", "Rectangular", "Oval"],
    maintenance: "Medium-High",
    attractiveness: 78,
    tips: "Regular barber visits. Keep mustache trimmed above lip.",
  },
  {
    id: "goatee",
    name: "Classic Goatee",
    description: "Chin beard with connected mustache",
    bestFor: ["Round", "Oval", "Diamond"],
    maintenance: "Medium",
    attractiveness: 72,
    tips: "Elongates round faces. Keep edges sharp and defined.",
  },
  {
    id: "van-dyke",
    name: "Van Dyke",
    description: "Disconnected goatee and mustache",
    bestFor: ["Round", "Square", "Heart"],
    maintenance: "Medium",
    attractiveness: 70,
    tips: "Adds length to face. Style mustache with wax.",
  },
  {
    id: "full-beard",
    name: "Full Beard",
    description: "Natural full coverage, medium-long",
    bestFor: ["Oblong", "Triangle", "Diamond"],
    maintenance: "High",
    attractiveness: 80,
    tips: "Brush daily. Use beard balm for shape and control.",
  },
  {
    id: "circle-beard",
    name: "Circle Beard",
    description: "Round goatee connecting to mustache",
    bestFor: ["Square", "Rectangular", "Heart"],
    maintenance: "Medium",
    attractiveness: 68,
    tips: "Softens angular features. Keep circular shape precise.",
  },
  {
    id: "clean-shaven",
    name: "Clean Shaven",
    description: "No facial hair, smooth skin",
    bestFor: ["All face shapes"],
    maintenance: "High (daily)",
    attractiveness: 75,
    tips: "Good skincare essential. Shows jawline definition clearly.",
  },
];

const mockAnalysis = {
  faceShape: "Oval",
  faceShapeScore: 85,
  recommendations: [
    { styleId: "stubble", match: 95 },
    { styleId: "short-boxed", match: 90 },
    { styleId: "corporate", match: 82 },
    { styleId: "full-beard", match: 78 },
    { styleId: "goatee", match: 72 },
    { styleId: "van-dyke", match: 65 },
    { styleId: "circle-beard", match: 60 },
    { styleId: "clean-shaven", match: 70 },
  ],
  summary: "Your oval face shape is versatile and suits most beard styles. Designer stubble and short boxed beard will enhance your natural facial harmony.",
};

type Analysis = typeof mockAnalysis;

const StyleCard = ({ style, match, rank, isRecommended }: { style: typeof beardStyles[0]; match: number; rank: number; isRecommended: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const matchColor = match >= 85 ? "text-[hsl(var(--status-success))]" : match >= 70 ? "text-[hsl(var(--status-warning))]" : "text-muted-foreground";

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-5 transition-all duration-300 cursor-pointer",
        isRecommended && "ring-1 ring-silver/20",
        expanded && "glass-card-strong"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-bold",
            rank <= 3 ? "bg-silver/20 text-foreground" : "bg-muted text-muted-foreground"
          )}>
            {rank}
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
              {style.name}
              {rank === 1 && <Star className="w-3.5 h-3.5 text-status-warning fill-status-warning" />}
            </h3>
            <p className="text-xs text-muted-foreground">{style.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={cn("text-lg font-display font-bold", matchColor)}>{match}%</span>
          <span className="text-xs text-muted-foreground block">match</span>
        </div>
      </div>

      {/* Match bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            match >= 85 ? "bg-[hsl(var(--status-success))]" : match >= 70 ? "bg-[hsl(var(--status-warning))]" : "bg-silver"
          )}
          style={{ width: `${match}%` }}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {style.bestFor.map((shape) => (
          <span key={shape} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-display">{shape}</span>
        ))}
        <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-display">{style.maintenance}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="pt-3 border-t border-border space-y-2 opacity-0 animate-fade-in">
          <div className="flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5 text-silver" />
            <span className="text-xs text-muted-foreground">Maintenance: <span className="text-foreground">{style.maintenance}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-silver" />
            <span className="text-xs text-muted-foreground">Avg Rating: <span className="text-foreground">{style.attractiveness}/100</span></span>
          </div>
          <div className="glass-card rounded-lg p-3 mt-2">
            <p className="text-xs text-foreground">{style.tips}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const BeardStylePage = () => {
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

  const runAnalysis = async () => { setIsAnalyzing(true); setAnalysis(null); await new Promise((r) => setTimeout(r, 2000)); setAnalysis(mockAnalysis); setIsAnalyzing(false); };
  const handleReset = () => { setAnalysis(null); setUploadedImage(null); };

  const sortedRecommendations = analysis
    ? [...analysis.recommendations].sort((a, b) => b.match - a.match)
    : [];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="p-2 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Beard Style</h1>
        </div>
      </header>

      <div className="relative z-10 container py-10 md:py-16 max-w-5xl">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6">
            <Scissors className="w-4 h-4 text-silver" />
            <span className="text-xs font-display text-silver">Style Recommender</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">Beard Style Finder</h1>
          <p className="text-muted-foreground text-lg font-light max-w-xl mx-auto">Upload a photo. Get personalized beard style recommendations based on your face shape.</p>
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
              <p className="text-muted-foreground text-sm mb-6">Front-facing, clear lighting, clean-shaven or any beard</p>
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
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">Detecting face shape...</h3>
              <p className="text-muted-foreground text-sm">Matching beard styles to your features</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-8 opacity-0 animate-fade-in">
            {/* Top section */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Photo */}
              <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center">
                {uploadedImage && <img src={uploadedImage} alt="Analyzed" className="w-full max-w-[180px] rounded-xl object-cover mb-4" />}
                <button onClick={handleReset} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-display"><RotateCcw className="w-4 h-4" /> Analyze another</button>
              </div>

              {/* Face shape */}
              <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center justify-center shine-line">
                <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mb-4">
                  <span className="text-3xl font-display font-bold text-foreground">{analysis.faceShape.charAt(0)}</span>
                </div>
                <span className="text-xl font-display font-bold text-foreground">{analysis.faceShape}</span>
                <span className="text-xs font-display text-muted-foreground mt-1">Face Shape</span>
                <div className="mt-4 pt-4 border-t border-border w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-display">Confidence</span>
                    <span className="font-display font-bold text-foreground">{analysis.faceShapeScore}%</span>
                  </div>
                </div>
              </div>

              {/* Top recommendation */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-status-warning fill-status-warning" />
                  <h3 className="text-sm font-display font-semibold text-foreground">Best Match</h3>
                </div>
                {sortedRecommendations[0] && (() => {
                  const style = beardStyles.find((s) => s.id === sortedRecommendations[0].styleId)!;
                  return (
                    <div>
                      <h4 className="font-display font-bold text-foreground text-lg mb-1">{style.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{style.description}</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-status-success" />
                        <span className="text-sm text-status-success font-display font-bold">{sortedRecommendations[0].match}% match</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card rounded-xl p-5 text-center">
              <p className="text-sm text-foreground">{analysis.summary}</p>
            </div>

            {/* All styles grid */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-silver" /> All Beard Styles
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {sortedRecommendations.map((rec, i) => {
                  const style = beardStyles.find((s) => s.id === rec.styleId)!;
                  return (
                    <StyleCard
                      key={rec.styleId}
                      style={style}
                      match={rec.match}
                      rank={i + 1}
                      isRecommended={i < 3}
                    />
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 text-center text-muted-foreground text-xs">
              Demo mode — results are simulated. Photos are not stored.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeardStylePage;
