import ModulePageLayout from "@/components/ModulePageLayout";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { makeupByEthnicity } from "@/lib/ethnicityData";
import { Palette, Sparkles, Eye, Droplets, ExternalLink } from "lucide-react";

const MakeupMaxPage = () => {
  const { profile } = useUserProfile();
  const ethnicity = profile?.ethnicity || "caucasian";
  const data = makeupByEthnicity[ethnicity];

  return (
    <ModulePageLayout title="MAKEUP MAX" subtitle="Foundation, contour & color — matched to you.">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Ethnicity Visual Tip */}
        <div className="glass-card rounded-2xl p-6 shine-line">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Your Color Profile</h2>
              <p className="text-xs text-muted-foreground capitalize">{ethnicity.replace("-", " ")} skin tones</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.colorPalette.map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-accent-foreground border border-border">
                {c}
              </span>
            ))}
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

        {/* Foundation Matches */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
              <Droplets className="w-4 h-4 text-[hsl(var(--silver))]" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Foundation Matches</h3>
          </div>
          <div className="space-y-3">
            {data.foundations.map((f) => (
              <div key={f.name} className="glass-card rounded-xl p-5 hover-glow transition-all">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h4 className="font-display font-semibold text-foreground text-sm">{f.name}</h4>
                  <span className="text-[hsl(var(--silver))] font-display text-sm font-semibold">{f.price}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-1">Shade range: {f.shade}</p>
                <p className="text-muted-foreground/60 text-xs">{f.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technique Guide */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
              <Eye className="w-4 h-4 text-[hsl(var(--silver))]" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Technique Essentials</h3>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <ul className="space-y-4">
              {[
                { step: "1. Prep", desc: "Moisturize, prime, let set 2 min" },
                { step: "2. Base", desc: "Foundation from center outward, blend with sponge" },
                { step: "3. Contour", desc: "Hollows of cheeks, jawline, temples — blend upward" },
                { step: "4. Eyes", desc: "Transition shade first, deepen outer V, highlight inner corner" },
                { step: "5. Lips", desc: "Line slightly outside lip line, fill in, blot" },
                { step: "6. Set", desc: "Translucent powder T-zone, setting spray all over" },
              ].map((s) => (
                <li key={s.step} className="flex gap-4">
                  <span className="text-[hsl(var(--accent-gold))] font-display font-bold text-sm whitespace-nowrap">{s.step}</span>
                  <span className="text-muted-foreground text-sm">{s.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 text-muted-foreground text-xs">
          Products recommended based on your profile. Results may vary.
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default MakeupMaxPage;
