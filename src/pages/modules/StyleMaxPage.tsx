import ModulePageLayout from "@/components/ModulePageLayout";

const essentials = [
  { item: "White/black t-shirts (3-5)", budget: "$15-30 each", mid: "Uniqlo, H&M", premium: "Reigning Champ" },
  { item: "Dark slim jeans (2)", budget: "$40-60", mid: "Levi's 511/512", premium: "APC, Acne Studios" },
  { item: "Chinos (khaki, navy)", budget: "$30-50", mid: "Uniqlo, BR", premium: "Incotex" },
  { item: "Oxford shirt (white, blue)", budget: "$30", mid: "Uniqlo, J.Crew", premium: "Kamakura" },
  { item: "Clean white sneakers", budget: "$60", mid: "Stan Smith", premium: "Common Projects" },
  { item: "Chelsea or desert boots", budget: "$80", mid: "Clarks, Thursday", premium: "RM Williams" },
  { item: "Navy/charcoal blazer", budget: "$100", mid: "Suitsupply", premium: "Boglioli" },
  { item: "Basic outerwear (bomber/coach)", budget: "$60", mid: "Alpha Industries", premium: "Acne Studios" },
];

const avoidList = [
  "Graphic tees with loud logos", "Cargo shorts or pants (unless very clean)",
  "Square-toe dress shoes", "Oversized fits (unless intentional)",
  "Shiny/flashy materials", "Too many accessories at once",
  "Clothes that don't fit properly", "Visible brand logos everywhere",
];

const tips = [
  { tip: "Fit is everything", detail: "A $20 shirt that fits beats a $200 shirt that doesn't." },
  { tip: "Stick to neutrals", detail: "Black, white, navy, gray, olive, tan. Easy to mix." },
  { tip: "Quality over quantity", detail: "10 pieces you love > 50 pieces you ignore." },
  { tip: "Shop sales smart", detail: "End of season (Jan, July) for best deals." },
  { tip: "Alterations are cheap", detail: "$15 to taper pants. Worth it." },
];

const StyleMaxPage = () => {
  return (
    <ModulePageLayout title="STYLE MAX" subtitle="What to buy. Where to buy. How to not waste money.">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h2 className="text-lg font-display font-bold text-silver uppercase mb-4">Core principles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tips.map((t) => (
              <div key={t.tip} className="glass-card rounded-xl p-5 hover-glow">
                <h3 className="font-display font-medium text-foreground mb-1">{t.tip}</h3>
                <p className="text-muted-foreground text-sm">{t.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-lg font-display font-bold text-silver uppercase mb-4">Essential wardrobe</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 font-display text-muted-foreground font-normal">ITEM</th>
                  <th className="text-left py-3 font-display text-muted-foreground font-normal">BUDGET</th>
                  <th className="text-left py-3 font-display text-muted-foreground font-normal">MID</th>
                  <th className="text-left py-3 font-display text-muted-foreground font-normal">PREMIUM</th>
                </tr>
              </thead>
              <tbody>
                {essentials.map((e) => (
                  <tr key={e.item} className="border-b border-border/50">
                    <td className="py-3 text-foreground">{e.item}</td>
                    <td className="py-3 text-muted-foreground">{e.budget}</td>
                    <td className="py-3 text-muted-foreground">{e.mid}</td>
                    <td className="py-3 text-muted-foreground">{e.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-lg font-display font-bold text-silver uppercase mb-4">Avoid</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {avoidList.map((item) => (
              <div key={item} className="flex items-center gap-2 p-3 glass-card rounded-lg">
                <span className="text-destructive">✕</span>
                <span className="text-muted-foreground text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-strong rounded-2xl p-6">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Where to shop</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-silver font-display">BUDGET:</span> <span className="text-muted-foreground">Uniqlo, H&M, Zara (basics only), ASOS</span></div>
            <div><span className="text-silver font-display">MID:</span> <span className="text-muted-foreground">J.Crew, Banana Republic, COS, Everlane</span></div>
            <div><span className="text-silver font-display">PREMIUM:</span> <span className="text-muted-foreground">Mr Porter, Ssense, END Clothing</span></div>
            <div><span className="text-silver font-display">SALES:</span> <span className="text-muted-foreground">Grailed, Poshmark, TheRealReal (secondhand)</span></div>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default StyleMaxPage;
