import ModulePageLayout from "@/components/ModulePageLayout";

const sections = [
  {
    title: "Focus",
    content: [
      { point: "Remove, don't add", detail: "Phone in another room > willpower. Environment beats motivation." },
      { point: "Time blocks work", detail: "90 min focused sessions. Then real break. Repeat max 3x/day." },
      { point: "Single-tasking only", detail: "Multitasking is a myth. It's just rapid context-switching with overhead." },
      { point: "Morning = peak hours", detail: "Most people have highest focus 2-4 hours after waking. Don't waste it." },
    ],
  },
  {
    title: "Learning",
    content: [
      { point: "Active recall > passive review", detail: "Testing yourself is 3x more effective than re-reading." },
      { point: "Spaced repetition", detail: "Review at increasing intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month." },
      { point: "Teach to learn", detail: "Explain concepts to others (or pretend to). Exposes gaps immediately." },
      { point: "Learn in context", detail: "Apply immediately. Abstract knowledge fades fast." },
    ],
  },
  {
    title: "Clarity",
    content: [
      { point: "Writing is thinking", detail: "If you can't write it clearly, you don't understand it." },
      { point: "Define terms first", detail: "Most arguments are semantic. Agree on definitions before debating." },
      { point: "First principles", detail: "Break problems down to fundamental truths. Rebuild from there." },
      { point: "Steelman, don't strawman", detail: "Argue against the best version of opposing views." },
    ],
  },
  {
    title: "Habits",
    content: [
      { point: "2-minute rule", detail: "New habits should take less than 2 minutes to start. Scale later." },
      { point: "Habit stacking", detail: "Attach new habits to existing ones. 'After X, I do Y.'" },
      { point: "Environment design", detail: "Make good choices obvious, bad choices invisible." },
      { point: "Identity > outcomes", detail: "Be the type of person who... vs. achieve X goal." },
    ],
  },
];

const IQMaxPage = () => {
  return (
    <ModulePageLayout title="IQ MAX" subtitle="Focus, learning systems, and mental clarity.">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 glass-card rounded-xl p-5 text-sm text-muted-foreground">
          This isn't about IQ scores or being "smart." It's about optimizing how you think, learn, and make decisions. Skills, not innate traits.
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

        <div className="glass-card-strong rounded-2xl p-6">
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Recommended resources</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>→ Anki (spaced repetition app)</li>
            <li>→ "Thinking, Fast and Slow" - Kahneman</li>
            <li>→ "Make It Stick" - Brown, Roediger, McDaniel</li>
            <li>→ "Deep Work" - Cal Newport</li>
          </ul>
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default IQMaxPage;
