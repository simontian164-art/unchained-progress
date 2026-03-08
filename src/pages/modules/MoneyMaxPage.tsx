import ModulePageLayout from "@/components/ModulePageLayout";

const sections = [
  {
    title: "Skill Development",
    content: [
      { point: "Learn one high-value skill", detail: "Sales, coding, writing, design. Pick one. Go deep for 6-12 months." },
      { point: "Skills compound", detail: "A skill learned at 20 pays dividends for 40+ years. Front-load the work." },
      { point: "Teach as you learn", detail: "Creates accountability, deepens understanding, builds reputation." },
      { point: "Overlap skills for leverage", detail: "Design + coding = better products. Sales + writing = better marketing." },
    ],
  },
  {
    title: "Income Habits",
    content: [
      { point: "Track every dollar (briefly)", detail: "1 month of tracking shows where money actually goes. Then systemize." },
      { point: "50/30/20 rule", detail: "50% needs, 30% wants, 20% savings. Adjust percentages, not the system." },
      { point: "Automate savings", detail: "Move money before you see it. Willpower is unreliable." },
      { point: "Increase income > cut spending", detail: "Cutting has limits. Earning doesn't. Focus proportionally." },
    ],
  },
  {
    title: "Leverage",
    content: [
      { point: "Time vs. output", detail: "Hourly work = linear. Products/assets = exponential. Build things once." },
      { point: "Audience is leverage", detail: "1000 true fans > 100k casual followers. Depth > breadth." },
      { point: "Systemize repeatable tasks", detail: "If you do it 3+ times, create a process. Then delegate or automate." },
      { point: "Say no more", detail: "Every yes to something mediocre is a no to something great." },
    ],
  },
  {
    title: "Long-term Thinking",
    content: [
      { point: "Compounding takes time", detail: "Year 1-2: small gains. Year 5-10: acceleration. Year 20+: escape velocity." },
      { point: "Protect your reputation", detail: "Reputation is leverage. One breach can erase years of building." },
      { point: "Health = wealth", detail: "Money without health is useless. Invest in your body like an asset." },
      { point: "Relationships compound too", detail: "Network isn't about numbers. 10 strong relationships > 1000 connections." },
    ],
  },
];

const MoneyMaxPage = () => {
  return (
    <ModulePageLayout title="MONEY MAX" subtitle="Skills, leverage, and long-term thinking.">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 glass-card rounded-xl p-5 text-sm text-muted-foreground">
          No get-rich-quick schemes. No hype. This is about controllable behaviors that build optionality over time.
        </div>

        {sections.map((section) => (
          <div key={section.title} className="mb-12">
            <h2 className="text-lg font-display font-bold text-silver uppercase mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.content.map((item) => (
                <div key={item.point} className="glass-card rounded-xl p-5 hover-glow">
                  <h3 className="font-display font-medium text-foreground mb-1">{item.point}</h3>
                  <p className="text-muted-foreground text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="glass-card-strong rounded-2xl p-6 ring-1 ring-silver/20">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">High leverage skills (2024)</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-silver font-display">TECHNICAL</span>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li>→ Software development</li>
                <li>→ Data analysis</li>
                <li>→ AI/ML applications</li>
              </ul>
            </div>
            <div>
              <span className="text-silver font-display">CREATIVE</span>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li>→ Copywriting</li>
                <li>→ Video production</li>
                <li>→ Design</li>
              </ul>
            </div>
            <div>
              <span className="text-silver font-display">BUSINESS</span>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li>→ Sales</li>
                <li>→ Negotiation</li>
                <li>→ Project management</li>
              </ul>
            </div>
            <div>
              <span className="text-silver font-display">META</span>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li>→ Public speaking</li>
                <li>→ Clear writing</li>
                <li>→ Decision-making</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default MoneyMaxPage;
