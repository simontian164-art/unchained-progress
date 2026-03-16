import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, Globe, Settings } from "lucide-react";
import { Gender, Ethnicity, useUserProfile } from "@/contexts/UserProfileContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const genderOptions: { value: Gender; label: string; icon: string }[] = [
  { value: "male", label: "Male", icon: "♂" },
  { value: "female", label: "Female", icon: "♀" },
];

const ethnicityOptions: { value: Ethnicity; label: string; desc: string }[] = [
  { value: "caucasian", label: "Caucasian", desc: "European descent" },
  { value: "african", label: "African / Black", desc: "African descent" },
  { value: "asian", label: "East Asian", desc: "East/Southeast Asian" },
  { value: "south-asian", label: "South Asian", desc: "Indian subcontinent" },
  { value: "hispanic", label: "Hispanic / Latino", desc: "Latin American" },
  { value: "middle-eastern", label: "Middle Eastern", desc: "MENA region" },
];

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileSettingsModal = ({ open, onOpenChange }: ProfileSettingsModalProps) => {
  const { profile, setProfile } = useUserProfile();
  const [gender, setGender] = useState<Gender>(profile?.gender || "male");
  const [ethnicity, setEthnicity] = useState<Ethnicity>(profile?.ethnicity || "caucasian");

  const handleSave = () => {
    setProfile({ gender, ethnicity });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Settings className="h-4 w-4 text-[hsl(var(--accent-gold))]" />
            Profile Settings
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your gender and ethnicity for personalized recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Gender */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-3.5 w-3.5 text-[hsl(var(--accent-gold))]" />
              <span className="text-[10px] font-display font-bold text-[hsl(var(--accent-gold))] uppercase tracking-widest">Gender</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  className={cn(
                    "relative rounded-xl p-3 text-left transition-all duration-200 border",
                    gender === opt.value
                      ? "border-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold)/0.08)]"
                      : "border-border bg-background hover:border-[hsl(var(--accent-gold)/0.2)]"
                  )}
                >
                  <span className="text-2xl block mb-1">{opt.icon}</span>
                  <span className="font-display font-bold text-foreground text-sm">{opt.label}</span>
                  {gender === opt.value && (
                    <motion.div layoutId="settings-gender" className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[hsl(var(--accent-gold))] flex items-center justify-center">
                      <span className="text-background text-[9px]">✓</span>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ethnicity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-3.5 w-3.5 text-[hsl(var(--accent-gold))]" />
              <span className="text-[10px] font-display font-bold text-[hsl(var(--accent-gold))] uppercase tracking-widest">Ethnicity</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto scrollbar-hide">
              {ethnicityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEthnicity(opt.value)}
                  className={cn(
                    "relative rounded-xl p-2.5 text-left transition-all duration-200 border",
                    ethnicity === opt.value
                      ? "border-[hsl(var(--accent-gold))] bg-[hsl(var(--accent-gold)/0.08)]"
                      : "border-border bg-background hover:border-[hsl(var(--accent-gold)/0.2)]"
                  )}
                >
                  <span className="font-display font-bold text-foreground text-[11px] block">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  {ethnicity === opt.value && (
                    <motion.div layoutId="settings-eth" className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[hsl(var(--accent-gold))] flex items-center justify-center">
                      <span className="text-background text-[9px]">✓</span>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full btn-premium justify-center flex items-center gap-2 !py-3 text-sm mt-2"
        >
          Save Changes
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsModal;
