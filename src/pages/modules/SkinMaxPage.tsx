import ModulePageLayout from "@/components/ModulePageLayout";
import { ExternalLink, Droplets, Sun, Sparkles as SparklesIcon, FlaskConical, Shield } from "lucide-react";

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
  return (
    <ModulePageLayout title="SKIN MAX" subtitle="Products that work. No BS.">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 glass-card rounded-2xl p-6 shine-line">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">The basics</h2>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li className="flex items-start gap-3"><span className="text-silver font-display">→</span> Cleanse AM/PM. Don't over-wash.</li>
            <li className="flex items-start gap-3"><span className="text-silver font-display">→</span> Moisturize after cleansing. Every time.</li>
            <li className="flex items-start gap-3"><span className="text-silver font-display">→</span> Sunscreen every morning. Non-negotiable.</li>
            <li className="flex items-start gap-3"><span className="text-silver font-display">→</span> Exfoliate 2-3x/week max. More is not better.</li>
            <li className="flex items-start gap-3"><span className="text-silver font-display">→</span> Retinoids at night only. Start 1x/week.</li>
          </ul>
        </div>

        {categories.map(({ key, label, icon: Icon }) => (
          <div key={key} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                <Icon className="w-4 h-4 text-silver" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">{label}</h3>
            </div>
            <div className="space-y-3">
              {products[key]?.map((product) => (
                <div key={product.name} className="glass-card rounded-xl p-5 hover-glow transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h4 className="font-display font-semibold text-foreground text-sm">{product.name}</h4>
                    <span className="text-silver font-display text-sm font-semibold">{product.price}</span>
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
