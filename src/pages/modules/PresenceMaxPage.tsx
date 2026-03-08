import ModulePageLayout from "@/components/ModulePageLayout";

const sections = [
  {
    title: "Posture",
    content: [
      { point: "Stand with intention", detail: "Weight balanced, shoulders back, spine neutral. Not rigid—relaxed but alert." },
      { point: "Take up space", detail: "Confident people don't shrink. Open chest, relaxed arms, feet shoulder-width." },
      { point: "Seated posture matters", detail: "Don't slouch in chairs. Sit back, shoulders open, feet flat." },
      { point: "Check constantly", detail: "Set hourly reminders. Posture is a habit, not a one-time fix." },
    ],
  },
  {
    title: "Eye Contact",
    content: [
      { point: "3-5 second holds", detail: "Look, then break naturally. Don't stare. Don't dart away." },
      { point: "Triangle technique", detail: "Alternate between eyes and mouth. Creates natural movement." },
      { point: "When listening > when speaking", detail: "Hold eye contact more when they talk. Shows engagement." },
      { point: "Breaking downward", detail: "When you break, look down or to the side. Up = disinterest." },
    ],
  },
  {
    title: "Movement",
    content: [
      { point: "Slow, deliberate movements", detail: "Rushed movement = nervous energy. Take your time." },
      { point: "Don't fidget", detail: "Hands still when not gesturing. No touching face, hair, phone." },
      { point: "Walk with purpose", detail: "Slightly slower than you think. Head up. Destination clear." },
      { point: "Gestures are intentional", detail: "Use hands to emphasize. Don't wave randomly." },
    ],
  },
  {
    title: "Voice",
    content: [
      { point: "Speak from diaphragm", detail: "Deeper resonance, more authority. Practice projecting without yelling." },
      { point: "Slower = more commanding", detail: "Fast talking = nervousness. Pause. Let words land." },
      { point: "Downward inflection", detail: "Statements should end down, not up. Questions go up. Know the difference." },
      { point: "Eliminate filler words", detail: "'Um', 'like', 'you know' — pause instead. Silence is better." },
    ],
  },
  {
    title: "Stillness",
    content: [
      { point: "Comfort with silence", detail: "Don't rush to fill pauses. Let moments breathe." },
      { point: "React slowly", detail: "Don't jump at every stimulus. Take a beat before responding." },
      { point: "Emotional steadiness", detail: "Don't show everything on your face. Maintain composure." },
      { point: "Be the calmest in the room", detail: "Others mirror your energy. Calm spreads." },
    ],
  },
];

const PresenceMaxPage = () => {
  return (
    <ModulePageLayout title="PRESENCE MAX" subtitle="How you're perceived before you speak.">
      <div className="max-w-3xl mx-auto">
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
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Daily practice</h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Record yourself speaking for 2 minutes. Watch it. Note filler words, posture.</li>
            <li>Practice walking slowly in public. Time yourself — probably faster than you think.</li>
            <li>In next conversation, count how long you hold eye contact. Aim for 50%+ while listening.</li>
            <li>One meeting/call: eliminate all filler words. Replace with pauses.</li>
          </ol>
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default PresenceMaxPage;
