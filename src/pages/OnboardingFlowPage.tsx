import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  User, Globe, ArrowRight, ArrowLeft, Sparkles, ScanFace,
  Dumbbell, Shirt, Eye, Camera, Check, Star, TrendingUp,
  ChevronRight, Crown,
} from "lucide-react";
import { Gender, Ethnicity, useUserProfile } from "@/contexts/UserProfileContext";
import { FaceCapture, type CaptureAnalysisSummary } from "@/components/FaceCapture";

// --- Types ---
type FlowStep = "gender" | "ethnicity" | "facemax" | "body" | "style" | "results";

interface SelfAssessment {
  bodyFitness: number;
  bodyConfidence: number;
  styleSense: number;
  groomingLevel: number;
  skinHealth: number;
  socialPresence: number;
}

interface FaceResult {
  images: string[];
  summary: CaptureAnalysisSummary;
  score: number;
}

// --- Options ---
const genderOptions: { value: Gender; label: string; icon: string; desc: string }[] = [
  { value: "male", label: "Male", icon: "♂", desc: "Jawline, physique & masculine optimization" },
  { value: "female", label: "Female", icon: "♀", desc: "Contour, skincare & feminine glow-up" },
];

const ethnicityOptions: { value: Ethnicity; label: string; desc: string }[] = [
  { value: "caucasian", label: "Caucasian", desc: "European descent" },
  { value: "african", label: "African / Black", desc: "African descent" },
  { value: "asian", label: "East Asian", desc: "East/Southeast Asian" },
  { value: "south-asian", label: "South Asian", desc: "Indian subcontinent" },
  { value: "hispanic", label: "Hispanic / Latino", desc: "Latin American" },
  { value: "middle-eastern", label: "Middle Eastern", desc: "MENA region" },
];

const assessmentFields: { key: keyof SelfAssessment; label: string; icon: typeof Dumbbell; desc: string }[] = [
  { key: "bodyFitness", label: "Body & Fitness", icon: Dumbbell, desc: "How would you rate your current fitness level?" },
  { key: "bodyConfidence", label: "Body Confidence", icon: Eye, desc: "How confident do you feel about your physique?" },
  { key: "skinHealth", label: "Skin Health", icon: Sparkles, desc: "How would you rate your current skin condition?" },
  { key: "styleSense", label: "Style & Fashion", icon: Shirt, desc: "How put-together is your daily look?" },
  { key: "groomingLevel", label: "Grooming", icon: Camera, desc: "How consistent is your grooming routine?" },
  { key: "socialPresence", label: "Social Presence", icon: Star, desc: "How confident are you in social situations?" },
];

const stepOrder: FlowStep[] = ["gender", "ethnicity", "facemax", "body", "results"];
const stepLabels: Record<FlowStep, string> = {
  gender: "Gender",
  ethnicity: "Background",
  facemax: "Face Scan",
  body: "Self-Assessment",
  style: "Style",
  results: "Your Score",
};

// --- Helpers ---
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const computeOverallScore = (faceScore: number, assessment: SelfAssessment) => {
  const avg = Object.values(assessment).reduce((a, b) => a + b, 0) / Object.values(assessment).length;
  // Face is 40%, self-assessment is 60%
  return Math.round(faceScore * 0.4 + avg * 0.6);
};

const getGrade = (score: number) => {
  if (score >= 90) return { grade: "S", color: "text-[hsl(var(--accent-gold))]" };
  if (score >= 80) return { grade: "A", color: "text-emerald-400" };
  if (score >= 70) return { grade: "B+", color: "text-sky-400" };
  if (score >= 60) return { grade: "B", color: "text-blue-400" };
  if (score >= 50) return { grade: "C+", color: "text-amber-400" };
  return { grade: "C", color: "text-orange-400" };
};

const getImprovements = (assessment: SelfAssessment, gender: Gender) => {
  const sorted = Object.entries(assessment)
    .map(([key, val]) => ({ key: key as keyof SelfAssessment, val }))
    .sort((a, b) => a.val - b.val);
  
  const tips: Record<keyof SelfAssessment, { title: string; desc: string; module: string }> = {
    bodyFitness: { title: "Physical Training", desc: gender === "female" ? "Toning & curves program personalized for you" : "Muscle building & physique optimization", module: "BodyMax" },
    bodyConfidence: { title: "Body Confidence", desc: "Posture, presence & physical confidence drills", module: "SocialMax" },
    skinHealth: { title: "Skin Protocol", desc: "Personalized skincare routine based on your ethnicity", module: "SkinMax" },
    styleSense: { title: "Style Upgrade", desc: gender === "female" ? "Wardrobe curation & outfit styling" : "Menswear fit & color mastery", module: "StyleMax" },
    groomingLevel: { title: "Grooming Routine", desc: gender === "female" ? "Hair, brows & beauty optimization" : "Beard, hair & grooming mastery", module: "GroomingMax" },
    socialPresence: { title: "Social Skills", desc: "Charisma, confidence & communication", module: "SocialMax" },
  };

  return sorted.slice(0, 3).map(s => ({ ...tips[s.key], score: s.val }));
};

// --- Slider Component ---
const AssessmentSlider = ({ field, value, onChange }: {
  field: typeof assessmentFields[0];
  value: number;
  onChange: (v: number) => void;
}) => {
  const Icon = field.icon;
  const labels = ["Poor", "Below Avg", "Average", "Good", "Excellent"];
  const labelIndex = Math.min(4, Math.floor(value / 20));

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-[hsl(var(--accent-gold)/0.1)] flex items-center justify-center">
          <Icon className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-display font-bold text-foreground">{field.label}</p>
          <p className="text-xs text-muted-foreground">{field.desc}</p>
        </div>
        <span className="text-sm font-bold text-[hsl(var(--accent-gold))]">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[hsl(var(--accent-gold))] h-2 rounded-full bg-muted cursor-pointer"
      />
      <div className="flex justify-between">
        {labels.map((l, i) => (
          <span key={l} className={cn("text-[10px]", i === labelIndex ? "text-[hsl(var(--accent-gold))] font-bold" : "text-muted-foreground")}>{l}</span>
        ))}
      </div>
    </div>
  );
};

// --- Score Ring ---
const ScoreRing = ({ score, size = 160 }: { score: number; size?: number }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const { grade, color } = getGrade(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="hsl(var(--accent-gold))"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-display font-black text-foreground">{score}</span>
        <span className={cn("text-lg font-display font-bold", color)}>{grade}</span>
      </div>
    </div>
  );
};

// --- Main Flow ---
const OnboardingFlowPage = () => {
  const navigate = useNavigate();
  const { setProfile } = useUserProfile();

  const [step, setStep] = useState<FlowStep>("gender");
  const [gender, setGender] = useState<Gender | null>(null);
  const [ethnicity, setEthnicity] = useState<Ethnicity | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [faceResult, setFaceResult] = useState<FaceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<SelfAssessment>({
    bodyFitness: 50, bodyConfidence: 50, styleSense: 50,
    groomingLevel: 50, skinHealth: 50, socialPresence: 50,
  });

  const stepIndex = stepOrder.indexOf(step);
  const progress = ((stepIndex + 1) / stepOrder.length) * 100;

  const goNext = useCallback(() => {
    const i = stepOrder.indexOf(step);
    if (i < stepOrder.length - 1) setStep(stepOrder[i + 1]);
  }, [step]);

  const goBack = useCallback(() => {
    const i = stepOrder.indexOf(step);
    if (i > 0) setStep(stepOrder[i - 1]);
  }, [step]);

  const canProceed = () => {
    if (step === "gender") return !!gender;
    if (step === "ethnicity") return !!ethnicity;
    if (step === "facemax") return !!faceResult;
    if (step === "body") return true;
    return false;
  };

  const handleFaceCapture = useCallback((images: string[], summary: CaptureAnalysisSummary) => {
    setShowCamera(false);
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      const avgMetrics = summary.avgMetrics;
      const rawScore = avgMetrics ? clamp(Math.round(avgMetrics.symmetryScore * 0.9 + avgMetrics.confidence * 0.1)) : 65;
      setFaceResult({ images, summary, score: clamp(rawScore, 40, 95) });
      setIsAnalyzing(false);
    }, 2500);
  }, []);

  const handleFinish = () => {
    if (gender && ethnicity) {
      setProfile({ gender, ethnicity });
      navigate("/hub", { replace: true });
    }
  };

  const overallScore = faceResult ? computeOverallScore(faceResult.score, assessment) : 0;
  const improvements = gender ? getImprovements(assessment, gender) : [];

  // Camera overlay
  if (showCamera) {
    return <FaceCapture onCapture={handleFaceCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {stepIndex > 0 && step !== "results" && (
            <button onClick={goBack} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-display font-bold text-[hsl(var(--accent-gold))] uppercase tracking-widest">
                {stepLabels[step]}
              </span>
              <span className="text-xs text-muted-foreground">{stepIndex + 1}/{stepOrder.length}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[hsl(var(--accent-gold))] to-[hsl(var(--accent-glow))] rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: Gender */}
          {step === "gender" && (
            <motion.div key="gender" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-gold))] to-[hsl(var(--accent-warm))] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[hsl(var(--accent-gold)/0.25)]">
                  <User className="h-7 w-7 text-background" />
                </div>
                <h1 className="text-2xl font-display font-black text-foreground">Welcome to GlowMax</h1>
                <p className="text-sm text-muted-foreground mt-1">Let's personalize your transformation journey</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {genderOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGender(opt.value)}
                    className={cn(
                      "relative rounded-2xl p-6 text-center transition-all duration-200 border",
                      gender === opt.value
                        ? "border-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold)/0.08)] shadow-lg shadow-[hsl(var(--accent-gold)/0.15)]"
                        : "border-border bg-card hover:border-[hsl(var(--accent-gold)/0.3)]"
                    )}
                  >
                    <span className="text-4xl block mb-3">{opt.icon}</span>
                    <span className="font-display font-bold text-foreground block">{opt.label}</span>
                    <span className="text-xs text-muted-foreground mt-1 block">{opt.desc}</span>
                    {gender === opt.value && (
                      <motion.div layoutId="gender-sel" className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[hsl(var(--accent-gold))] flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-background" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Ethnicity */}
          {step === "ethnicity" && (
            <motion.div key="ethnicity" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-gold))] to-[hsl(var(--accent-warm))] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[hsl(var(--accent-gold)/0.25)]">
                  <Globe className="h-7 w-7 text-background" />
                </div>
                <h2 className="text-2xl font-display font-black text-foreground">Your Background</h2>
                <p className="text-sm text-muted-foreground mt-1">This helps us personalize skincare, hair & product recommendations</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ethnicityOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEthnicity(opt.value)}
                    className={cn(
                      "relative rounded-xl p-4 text-left transition-all duration-200 border",
                      ethnicity === opt.value
                        ? "border-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold)/0.08)] shadow-lg shadow-[hsl(var(--accent-gold)/0.1)]"
                        : "border-border bg-card hover:border-[hsl(var(--accent-gold)/0.2)]"
                    )}
                  >
                    <span className="font-display font-bold text-foreground text-sm block">{opt.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 block">{opt.desc}</span>
                    {ethnicity === opt.value && (
                      <motion.div layoutId="eth-sel" className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[hsl(var(--accent-gold))] flex items-center justify-center">
                        <Check className="h-3 w-3 text-background" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: FaceMax */}
          {step === "facemax" && (
            <motion.div key="facemax" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/25">
                  <ScanFace className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-display font-black text-foreground">Face Scan</h2>
                <p className="text-sm text-muted-foreground mt-1">We'll analyze your facial structure, symmetry & proportions</p>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative h-20 w-20 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-muted" />
                    <div className="absolute inset-0 rounded-full border-4 border-[hsl(var(--accent-gold))] border-t-transparent animate-spin" />
                    <ScanFace className="absolute inset-0 m-auto h-8 w-8 text-[hsl(var(--accent-gold))]" />
                  </div>
                  <p className="text-sm font-display font-bold text-foreground">Analyzing your features...</p>
                  <p className="text-xs text-muted-foreground mt-1">Measuring symmetry, proportions & harmony</p>
                </div>
              ) : faceResult ? (
                <div className="space-y-4">
                  <div className="glass-card-strong rounded-2xl p-6 text-center">
                    <p className="text-xs text-muted-foreground mb-2">FACE SCORE</p>
                    <div className="flex items-center justify-center gap-6">
                      {faceResult.images[0] && (
                        <img src={faceResult.images[0]} alt="Capture" className="h-20 w-20 rounded-xl object-cover border border-border" />
                      )}
                      <div>
                        <span className="text-5xl font-display font-black text-foreground">{faceResult.score}</span>
                        <span className={cn("text-lg font-bold ml-2", getGrade(faceResult.score).color)}>
                          {getGrade(faceResult.score).grade}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setFaceResult(null); setShowCamera(true); }}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    Retake scan →
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCamera(true)}
                  className="w-full glass-card-strong rounded-2xl p-8 text-center hover:border-[hsl(var(--accent-gold)/0.3)] transition-all border border-border group"
                >
                  <div className="h-20 w-20 rounded-full bg-[hsl(var(--accent-gold)/0.1)] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                    <Camera className="h-10 w-10 text-[hsl(var(--accent-gold))]" />
                  </div>
                  <p className="font-display font-bold text-foreground text-lg">Start Face Scan</p>
                  <p className="text-xs text-muted-foreground mt-1">Takes ~30 seconds • Front, left & right angles</p>
                </button>
              )}

              {!faceResult && !isAnalyzing && (
                <button
                  onClick={() => {
                    // Skip face scan with a default score
                    setFaceResult({ images: [], summary: { detectionReady: false, analyzedFrames: 0, avgMetrics: null }, score: 60 });
                  }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-4 py-2"
                >
                  Skip for now (use estimated score)
                </button>
              )}
            </motion.div>
          )}

          {/* STEP 4: Self-Assessment */}
          {step === "body" && (
            <motion.div key="body" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-5">
                <h2 className="text-2xl font-display font-black text-foreground">Rate Yourself</h2>
                <p className="text-sm text-muted-foreground mt-1">Be honest — this helps us build your improvement plan</p>
              </div>

              <div className="space-y-3">
                {assessmentFields.map(field => (
                  <AssessmentSlider
                    key={field.key}
                    field={field}
                    value={assessment[field.key]}
                    onChange={v => setAssessment(prev => ({ ...prev, [field.key]: v }))}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: Results */}
          {step === "results" && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Crown className="h-10 w-10 text-[hsl(var(--accent-gold))] mx-auto mb-2" />
                </motion.div>
                <h2 className="text-2xl font-display font-black text-foreground">Your GlowUp Score</h2>
                <p className="text-sm text-muted-foreground mt-1">Here's where you stand — and where you're going</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-6"
              >
                <ScoreRing score={overallScore} />
              </motion.div>

              {/* Score breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-xl p-4 mb-4"
              >
                <h3 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest mb-3">Breakdown</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ScanFace className="h-4 w-4 text-rose-400" />
                      <span className="text-sm text-foreground">Face Score</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{faceResult?.score || 60}/100</span>
                  </div>
                  {assessmentFields.map(f => {
                    const Icon = f.icon;
                    return (
                      <div key={f.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                          <span className="text-sm text-foreground">{f.label}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground">{assessment[f.key]}/100</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Top improvements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card rounded-xl p-4 mb-6"
              >
                <h3 className="text-xs font-display font-bold text-[hsl(var(--accent-gold))] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Priority Improvements
                </h3>
                <div className="space-y-3">
                  {improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--accent-gold)/0.04)] border border-[hsl(var(--accent-gold)/0.1)]">
                      <div className="h-7 w-7 rounded-full bg-[hsl(var(--accent-gold)/0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[hsl(var(--accent-gold))]">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-display font-bold text-foreground">{imp.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{imp.desc}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-[hsl(var(--accent-gold))]">→ {imp.module}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{imp.score}/100</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={handleFinish}
                className="w-full btn-premium justify-center flex items-center gap-2 !py-4 text-base"
              >
                <Sparkles className="h-5 w-5" />
                Start My Transformation
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button (not on results) */}
        {step !== "results" && (
          <div className="mt-6">
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className={cn(
                "w-full btn-premium justify-center flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed",
                "!py-3.5 text-sm"
              )}
            >
              {step === "body" ? "See My Score" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlowPage;
