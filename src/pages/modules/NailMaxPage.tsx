import ModulePageLayout from "@/components/ModulePageLayout";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { nailsByEthnicity } from "@/lib/ethnicityData";
import { Sparkles, Palette } from "lucide-react";

const NailMaxPage = () => {
  const { profile } = useUserProfile();
  const ethnicity = profile?.ethnicity || "caucasian";
  const data = nailsByEthnicity[ethnicity];

  return (
    <ModulePageLayout title="NAIL MAX" subtitle="Shapes, shades & care — personalized.">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Care Tips */}
        <div className="glass-card rounded-2xl p-6 shine-line">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-display font-bold text-foreground">Nail Care Tips</h2>
          </div>
          <ul className="space-y-2">
            {data.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="text-[hsl(var(--accent-gold))] font-display">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Shapes */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[hsl(var(--silver))]" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Recommended Shapes</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {data.shapes.map((shape) => (
              <div key={shape} className="glass-card rounded-xl p-4 text-center hover-glow transition-all">
                <p className="font-display font-semibold text-foreground text-sm">{shape}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
              <Palette className="w-4 h-4 text-[hsl(var(--silver))]" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Colors That Pop</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.colors.map((color) => (
              <span key={color} className="px-4 py-2 rounded-full text-sm font-medium bg-accent text-accent-foreground border border-border">
                {color}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 text-muted-foreground text-xs">
          Colors and shapes curated for your profile. Enjoy experimenting!
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default NailMaxPage;
