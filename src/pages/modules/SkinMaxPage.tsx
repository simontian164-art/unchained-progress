import ModulePageLayout from "@/components/ModulePageLayout";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { skincareTipsByEthnicity, skincareProductsByEthnicity } from "@/lib/ethnicityData";
import { ExternalLink, Droplets, Sun, Sparkles as SparklesIcon, FlaskConical, Shield, User } from "lucide-react";

const categories = [
  { key: "cleanser", label: "Cleanser", icon: Droplets },
  { key: "moisturizer", label: "Moisturizer", icon: Shield },
  { key: "sunscreen", label: "Sunscreen", icon: Sun },
  { key: "exfoliant", label: "Exfoliant", icon: FlaskConical },
  { key: "acne", label: "Acne Control", icon: SparklesIcon },
];

const products: Record<string, Array<{ name: string; price: string; where: string; note: string }>> = {
  cleanser: [
    { name: "CeraVe Foaming Facial Cleanser", price: "$16", where: "Sephora / Target", note: "For oily/normal skin" },
    { name: "La Roche-Posay Toleriane", price: "$15", where: "Sephora / Amazon", note: "For sensitive skin" },
    { name: "Vanicream Gentle Cleanser", price: "$9", where: "Amazon / CVS", note: "Ultra gentle option" },
  ],
  moisturizer: [
    { name: "CeraVe PM Facial Moisturizing Lotion", price: "$16", where: "Sephora / Target", note: "Lightweight, niacinamide" },
    { name: "La Roche-Posay Toleriane Double Repair", price: "$20", where: "Sephora / Ulta", note: "Good for dry skin" },
    { name: "Neutrogena Hydro Boost", price: "$18", where: "Target / CVS", note: "Hyaluronic acid, gel texture" },
  ],
  sunscreen: [
    { name: "La Roche-Posay Anthelios Melt-In SPF 100", price: "$35", where: "Sephora", note: "Best protection, some white cast" },
    { name: "EltaMD UV Clear SPF 46", price: "$39", where: "Dermstore / Amazon", note: "Minimal white cast" },
    { name: "Black Girl Sunscreen SPF 30", price: "$16", where: "Target / Ulta", note: "No white cast" },
  ],
  exfoliant: [
    { name: "Paula's Choice 2% BHA Liquid", price: "$32", where: "Sephora / Paula's Choice", note: "For blackheads, use 2-3x/week" },
    { name: "The Ordinary Glycolic Acid 7% Toner", price: "$9", where: "Sephora / Ulta", note: "AHA, use at night only" },
  ],
  acne: [
    { name: "Differin Gel (Adapalene 0.1%)", price: "$15", where: "Target / CVS", note: "OTC retinoid, start slow" },
    { name: "Benzoyl Peroxide 2.5%", price: "$10", where: "Any drugstore", note: "Spot treatment" },
  ],
};

const SkinMaxPage = () => {
  const { profile } = useUserProfile();
  const ethnicity = profile?.ethnicity || "caucasian";
  const ethTips = skincareTipsByEthnicity[ethnicity];
  const ethProducts = skincareProductsByEthnicity[ethnicity];

  return (
    <ModulePageLayout title="SKIN MAX" subtitle="Products that work. No BS.">
      <div className="max-w-3xl mx-auto">

        {/* Ethnicity-Specific Section */}
        <div className="mb-12 glass-card rounded-2xl p-6 border border-[hsl(var(--accent-gold)/0.15)] bg-gradient-to-br from-[hsl(var(--accent-gold)/0.05)] to-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--accent-gold))] to-[hsl(var(--accent-warm))] flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-gold)/0.2)]">
              <User className="w-5 h-5 text-background" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Personalized for You</h2>
              <p className="text-xs text-muted-foreground capitalize">{ethTips.visual} · {ethnicity.replace("-", " ")} skin</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4">{ethTips.routine}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-xs font-display font-bold text-[hsl(var(--accent-gold))] uppercase tracking-wider mb-2">Key Tips</h4>
              <ul className="space-y-1.5">
                {ethTips.tips.map((t, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-[hsl(var(--accent-gold))]">→</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-display font-bold text-destructive uppercase tracking-wider mb-2">Watch Out For</h4>
              <ul className="space-y-1.5">
                {ethTips.concerns.map((c, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive">!</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ethnicity-specific products */}
          <h4 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-3 mt-4">Recommended for your skin</h4>
          <div className="space-y-2">
            {ethProducts.map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-background/50 border border-border">
                <div>
                  <span className="text-sm font-semibold text-foreground">{p.name}</span>
                  <p className="text-xs text-muted-foreground">{p.note}</p>
                </div>
                <span className="text-[hsl(var(--accent-gold))] font-display text-sm font-bold shrink-0">{p.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The basics */}
        <div className="mb-12 glass-card rounded-2xl p-6 shine-line">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">The basics</h2>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li className="flex items-start gap-3"><span className="text-[hsl(var(--silver))] font-display">→</span> Cleanse AM/PM. Don't over-wash.</li>
            <li className="flex items-start gap-3"><span className="text-[hsl(var(--silver))] font-display">→</span> Moisturize after cleansing. Every time.</li>
            <li className="flex items-start gap-3"><span className="text-[hsl(var(--silver))] font-display">→</span> Sunscreen every morning. Non-negotiable.</li>
            <li className="flex items-start gap-3"><span className="text-[hsl(var(--silver))] font-display">→</span> Exfoliate 2-3x/week max. More is not better.</li>
            <li className="flex items-start gap-3"><span className="text-[hsl(var(--silver))] font-display">→</span> Retinoids at night only. Start 1x/week.</li>
          </ul>
        </div>

        {categories.map(({ key, label, icon: Icon }) => (
          <div key={key} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                <Icon className="w-4 h-4 text-[hsl(var(--silver))]" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">{label}</h3>
            </div>
            <div className="space-y-3">
              {products[key]?.map((product) => (
                <div key={product.name} className="glass-card rounded-xl p-5 hover-glow transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h4 className="font-display font-semibold text-foreground text-sm">{product.name}</h4>
                    <span className="text-[hsl(var(--silver))] font-display text-sm font-semibold">{product.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{product.note}</p>
                  <p className="text-muted-foreground/50 text-xs flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {product.where}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="glass-card rounded-xl p-4 text-muted-foreground text-xs">
          Not medical advice. Consult a dermatologist for specific conditions.
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default SkinMaxPage;
