import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, Globe, ArrowRight, Sparkles } from "lucide-react";
import { Gender, Ethnicity, UserProfile } from "@/contexts/UserProfileContext";

const genderOptions: { value: Gender; label: string; icon: string; desc: string }[] = [
  { value: "male", label: "Male", icon: "♂", desc: "Beard, jawline, masculine physique optimization" },
  { value: "female", label: "Female", icon: "♀", desc: "Skincare, contouring, feminine glow-up focus" },
];

const ethnicityOptions: { value: Ethnicity; label: string; desc: string }[] = [
  { value: "caucasian", label: "Caucasian", desc: "European descent" },
  { value: "african", label: "African / Black", desc: "African descent" },
  { value: "asian", label: "East Asian", desc: "East/Southeast Asian" },
  { value: "south-asian", label: "South Asian", desc: "Indian subcontinent" },
  { value: "hispanic", label: "Hispanic / Latino", desc: "Latin American" },
  { value: "middle-eastern", label: "Middle Eastern", desc: "MENA region" },
];

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState<"gender" | "ethnicity">("gender");
  const [gender, setGender] = useState<Gender | null>(null);
  const [ethnicity, setEthnicity] = useState<Ethnicity | null>(null);

  const handleNext = () => {
    if (step === "gender" && gender) {
      setStep("ethnicity");
    } else if (step === "ethnicity" && ethnicity && gender) {
      onComplete({ gender, ethnicity });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md glass-card-strong rounded-2xl overflow-hidden"
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--accent-gold))] via-[hsl(var(--accent-glow))] to-[hsl(var(--accent-gold))]" />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--accent-gold))] to-[hsl(var(--accent-warm))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-gold)/0.25)]">
              <Sparkles className="h-5 w-5 text-background" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Personalize Your Journey</h2>
              <p className="text-xs text-muted-foreground">Tailored recommendations just for you</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 my-5">
            <div className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              "bg-[hsl(var(--accent-gold))]"
            )} />
            <div className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              step === "ethnicity" ? "bg-[hsl(var(--accent-gold))]" : "bg-muted"
            )} />
          </div>

          <AnimatePresence mode="wait">
            {step === "gender" && (
              <motion.div
                key="gender"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                  <span className="text-xs font-display font-bold text-[hsl(var(--accent-gold))] uppercase tracking-widest">Gender</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGender(opt.value)}
                      className={cn(
                        "group relative rounded-xl p-4 text-left transition-all duration-200 border",
                        gender === opt.value
                          ? "border-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold)/0.08)] shadow-lg shadow-[hsl(var(--accent-gold)/0.1)]"
                          : "border-border bg-card hover:border-[hsl(var(--accent-gold)/0.2)]"
                      )}
                    >
                      <span className="text-3xl block mb-2">{opt.icon}</span>
                      <span className="font-display font-bold text-foreground text-sm block">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight block mt-1">{opt.desc}</span>
                      {gender === opt.value && (
                        <motion.div
                          layoutId="gender-check"
                          className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[hsl(var(--accent-gold))] flex items-center justify-center"
                        >
                          <span className="text-background text-xs">✓</span>
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "ethnicity" && (
              <motion.div
                key="ethnicity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
                  <span className="text-xs font-display font-bold text-[hsl(var(--accent-gold))] uppercase tracking-widest">Ethnicity</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto scrollbar-hide">
                  {ethnicityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEthnicity(opt.value)}
                      className={cn(
                        "group relative rounded-xl p-3 text-left transition-all duration-200 border",
                        ethnicity === opt.value
                          ? "border-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold)/0.08)] shadow-lg shadow-[hsl(var(--accent-gold)/0.1)]"
                          : "border-border bg-card hover:border-[hsl(var(--accent-gold)/0.2)]"
                      )}
                    >
                      <span className="font-display font-bold text-foreground text-xs block">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">{opt.desc}</span>
                      {ethnicity === opt.value && (
                        <motion.div
                          layoutId="eth-check"
                          className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[hsl(var(--accent-gold))] flex items-center justify-center"
                        >
                          <span className="text-background text-[9px]">✓</span>
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            {step === "ethnicity" && (
              <button
                onClick={() => setStep("gender")}
                className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors font-display text-sm"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={(step === "gender" && !gender) || (step === "ethnicity" && !ethnicity)}
              className={cn(
                "flex-1 btn-premium justify-center flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed",
                "!py-3 !px-6 text-sm"
              )}
            >
              {step === "ethnicity" ? "Start My Journey" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingModal;
