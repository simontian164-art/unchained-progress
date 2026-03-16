import ModulePageLayout from "@/components/ModulePageLayout";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { fragranceByEthnicity } from "@/lib/ethnicityData";
import { Wind, Sparkles, Sun, Snowflake } from "lucide-react";

const seasonIcon = (season: string) => {
  if (season.toLowerCase().includes("summer") || season.toLowerCase().includes("spring")) return <Sun className="w-3 h-3" />;
  if (season.toLowerCase().includes("winter") || season.toLowerCase().includes("fall")) return <Snowflake className="w-3 h-3" />;
  return <Sparkles className="w-3 h-3" />;
};

const FragranceMaxPage = () => {
  const { profile } = useUserProfile();
  const ethnicity = profile?.ethnicity || "caucasian";
  const data = fragranceByEthnicity[ethnicity];

  return (
    <ModulePageLayout title="FRAGRANCE MAX" subtitle="Scent profiles matched to your vibe.">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Scent Profile */}
        <div className="glass-card rounded-2xl p-6 shine-line">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Your Scent Profile</h2>
              <p className="text-xs text-muted-foreground capitalize">{ethnicity.replace("-", " ")}</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{data.profile}</p>
        </div>

        {/* Fragrance Picks */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[hsl(var(--silver))]" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Top Picks</h3>
          </div>
          <div className="space-y-3">
            {data.scents.map((s) => (
              <div key={s.name} className="glass-card rounded-xl p-5 hover-glow transition-all">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h4 className="font-display font-semibold text-foreground text-sm">{s.name}</h4>
                  <span className="text-[hsl(var(--silver))] font-display text-sm font-semibold">{s.price}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{s.type}</p>
                <div className="flex items-center gap-1.5 text-muted-foreground/60 text-xs">
                  {seasonIcon(s.season)}
                  <span>{s.season}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Guide */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-display font-bold text-foreground mb-4">Application Tips</h3>
          <ul className="space-y-2">
            {[
              "Pulse points: wrists, neck, behind ears",
              "Don't rub wrists together — it breaks molecules",
              "2-3 sprays max. Scent should be discovered, not announced",
              "Layer with matching body lotion for longer wear",
              "Store in cool, dark place — heat degrades fragrance",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="text-[hsl(var(--accent-gold))] font-display">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-xl p-4 text-muted-foreground text-xs">
          Fragrance is personal — these are starting points based on your profile.
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default FragranceMaxPage;
