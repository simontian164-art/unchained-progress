import ModulePageLayout from "@/components/ModulePageLayout";

const sections = [
  {
    title: "Body Composition",
    content: [
      { point: "Target 12-18% body fat", detail: "This is where face structure shows. Lower isn't always better for appearance." },
      { point: "Prioritize protein", detail: "0.8-1g per lb of bodyweight. Non-negotiable for any goal." },
      { point: "Track calories briefly", detail: "2 weeks of tracking teaches portion intuition. Then stop obsessing." },
      { point: "Rate of change matters", detail: "Lose 0.5-1lb/week max. Faster = muscle loss + rebound." },
    ],
  },
  {
    title: "Training Structure",
    content: [
      { point: "Push/Pull/Legs or Upper/Lower", detail: "Simple splits work. Don't overthink." },
      { point: "3-4x per week minimum", detail: "Consistency > intensity. Missing days kills progress." },
      { point: "Progressive overload", detail: "Add weight or reps each week. If you're not progressing, nothing happens." },
      { point: "Compound focus", detail: "Squat, deadlift, bench, row, overhead press. Everything else is secondary." },
    ],
  },
  {
    title: "Posture",
    content: [
      { point: "Forward head = instant -1", detail: "Ears should align with shoulders. Check yourself in mirrors." },
      { point: "Rounded shoulders fix", detail: "Face pulls, external rotations, chest stretches. Daily." },
      { point: "Anterior pelvic tilt", detail: "Stretch hip flexors, strengthen glutes + abs. Very common issue." },
      { point: "Stand like you matter", detail: "Shoulders back, chin neutral, weight even. Practice constantly." },
    ],
  },
  {
    title: "Visual Priorities",
    content: [
      { point: "Shoulders > everything else", detail: "Wide shoulders create the V-taper. Lateral raises, OHP, lots of volume." },
      { point: "Neck training", detail: "Often ignored. Thick neck = more masculine appearance. Simple exercises work." },
      { point: "Don't neglect traps", detail: "Visible from front. Shrugs and deadlifts." },
      { point: "Forearms show", detail: "Most visible muscle in casual clothes. Hammer curls, wrist work." },
    ],
  },
];

const BodyMaxPage = () => {
  return (
    <ModulePageLayout title="BODY MAX" subtitle="Training, composition, and posture.">
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
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Starter routine (3x/week)</h2>
          <div className="space-y-3 text-sm font-display">
            <div className="text-foreground">DAY A: Push</div>
            <div className="text-muted-foreground pl-4">Bench 3x8, OHP 3x8, Lateral Raise 3x15, Tricep Pushdown 3x12</div>
            <div className="text-foreground">DAY B: Pull</div>
            <div className="text-muted-foreground pl-4">Deadlift 3x5, Row 3x8, Face Pull 3x15, Bicep Curl 3x12</div>
            <div className="text-foreground">DAY C: Legs</div>
            <div className="text-muted-foreground pl-4">Squat 3x8, RDL 3x10, Leg Press 3x12, Calf Raise 3x15</div>
          </div>
        </div>
      </div>
    </ModulePageLayout>
  );
};

export default BodyMaxPage;
