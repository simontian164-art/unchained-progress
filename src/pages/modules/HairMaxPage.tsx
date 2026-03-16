import ModulePageLayout from "@/components/ModulePageLayout";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { hairByEthnicity } from "@/lib/ethnicityData";
import { Scissors, Sparkles, Droplets, ExternalLink } from "lucide-react";

const HairMaxPage = () => {
  const { profile } = useUserProfile();
  const ethnicity = profile?.ethnicity || "caucasian";
  const data = hairByEthnicity[ethnicity];

  return (
    <ModulePageLayout title="HAIR MAX" subtitle="Your hair type, your rules.">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Hair Type Card */}
        <div className="glass-card rounded-2xl p-6 shine-line">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Your Hair Type</h2>
              <p className="text-sm text-[hsl(var(--accent-gold))]">{data.hairType}</p>
            </div>
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

        {/* Recommended Styles */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
              <Scissors className="w-4 h-4 text-[hsl(var(--silver))]" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Styles That Work</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.styles.map((style) => (
              <div key={style} className="glass-card rounded-xl p-4 text-center hover-glow transition-all">
                <p className="font-display font-semibold text-foreground text-sm">{style}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
              <Droplets className="w-4 h-4 text-[hsl(var(--silver))]" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Recommended Products</h3>
          </div>
          <div className="space-y-3">
            {data.products.map((p) => (
              <div key={p.name} className="glass-card rounded-xl p-5 hover-glow transition-all">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h4 className="font-display font-semibold text-foreground text-sm">{p.name}</h4>
                  <span className="text-[hsl(var(--silver))] font-display text-sm font-semibold">{p.price}</span>
                </div>
                <p className="text-muted-foreground text-sm">{p.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 text-muted-foreground text-xs">
          Hair recommendations based on your hair type profile. Always patch-test new products.
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default HairMaxPage;
