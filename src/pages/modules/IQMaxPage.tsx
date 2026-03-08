import { useState } from "react";
import ModulePageLayout from "@/components/ModulePageLayout";
import { cn } from "@/lib/utils";
import {
  Brain, Zap, BookOpen, Lightbulb, Target, TrendingUp,
  ChevronDown, ChevronUp, CheckCircle, RotateCcw,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const cognitiveMetrics = [
  { label: "Focus Duration", score: 72, icon: Target, detail: "Avg 47 min deep focus sessions" },
  { label: "Learning Speed", score: 68, icon: BookOpen, detail: "Above average retention rate" },
  { label: "Problem Solving", score: 81, icon: Lightbulb, detail: "Strong first-principles reasoning" },
  { label: "Mental Clarity", score: 65, icon: Brain, detail: "Room for improvement in decision fatigue" },
  { label: "Habit Consistency", score: 74, icon: RotateCcw, detail: "Good streak maintenance" },
];

const weeklyFocus = [45, 62, 55, 78, 60, 85, 72];

const sections = [
  {
    title: "Focus", icon: Target,
    content: [
      { point: "Remove, don't add", detail: "Phone in another room > willpower. Environment beats motivation." },
      { point: "Time blocks work", detail: "90 min focused sessions. Then real break. Repeat max 3x/day." },
      { point: "Single-tasking only", detail: "Multitasking is a myth. It's just rapid context-switching with overhead." },
      { point: "Morning = peak hours", detail: "Most people have highest focus 2-4 hours after waking. Don't waste it." },
    ],
  },
  {
    title: "Learning", icon: BookOpen,
    content: [
      { point: "Active recall > passive review", detail: "Testing yourself is 3x more effective than re-reading." },
      { point: "Spaced repetition", detail: "Review at increasing intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month." },
      { point: "Teach to learn", detail: "Explain concepts to others (or pretend to). Exposes gaps immediately." },
      { point: "Learn in context", detail: "Apply immediately. Abstract knowledge fades fast." },
    ],
  },
  {
    title: "Clarity", icon: Lightbulb,
    content: [
      { point: "Writing is thinking", detail: "If you can't write it clearly, you don't understand it." },
      { point: "Define terms first", detail: "Most arguments are semantic. Agree on definitions before debating." },
      { point: "First principles", detail: "Break problems down to fundamental truths. Rebuild from there." },
      { point: "Steelman, don't strawman", detail: "Argue against the best version of opposing views." },
    ],
  },
  {
    title: "Habits", icon: RotateCcw,
    content: [
      { point: "2-minute rule", detail: "New habits should take less than 2 minutes to start. Scale later." },
      { point: "Habit stacking", detail: "Attach new habits to existing ones. 'After X, I do Y.'" },
      { point: "Environment design", detail: "Make good choices obvious, bad choices invisible." },
      { point: "Identity > outcomes", detail: "Be the type of person who... vs. achieve X goal." },
    ],
  },
];

const dailyHabits = [
  "Morning journaling (5 min)",
  "Deep work block (90 min)",
  "Anki review session",
  "Read 20 pages",
  "No phone first hour",
  "Evening reflection",
];

// ─── Sub-components ──────────────────────────────────────────────────

const ScoreRing = ({ score, size = 110 }: { score: number; size?: number }) => {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-foreground">{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};

const MetricBar = ({ label, score, detail, icon: Icon, delay }: { label: string; score: number; detail: string; icon: typeof Brain; delay: string }) => {
  const color = score >= 80 ? "hsl(142 50% 45%)" : score >= 60 ? "hsl(35 60% 50%)" : "hsl(0 0% 55%)";
  return (
    <div className="glass-card rounded-xl p-4 group hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift opacity-0 animate-fade-in" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg glass-card-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-4 h-4 text-silver group-hover:text-foreground transition-colors" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-display font-bold text-foreground">{label}</span>
            <span className="text-xs font-display font-bold text-foreground">{score}</span>
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, background: color }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{detail}</p>
    </div>
  );
};

const ExpandableSection = ({ title, icon: Icon, children, defaultOpen = false, delay = "0s" }: {
  title: string; icon: typeof Brain; children: React.ReactNode; defaultOpen?: boolean; delay?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-2xl overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: delay }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl glass-card-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-4.5 h-4.5 text-silver group-hover:text-foreground transition-colors" />
          </div>
          <h2 className="font-display font-bold text-foreground text-sm tracking-wide">{title}</h2>
        </div>
        <div className={cn("transition-transform duration-300", open && "rotate-180")}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
      <div className={cn(
        "grid transition-all duration-500 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────

const IQMaxPage = () => {
  const [focusSlider, setFocusSlider] = useState(72);
  const [claritySlider, setClaritySlider] = useState(65);
  const [deepWorkToggle, setDeepWorkToggle] = useState(true);
  const [pomodoroToggle, setPomodoroToggle] = useState(false);
  const [checkedHabits, setCheckedHabits] = useState<Set<string>>(new Set(["Morning journaling (5 min)", "No phone first hour"]));

  const toggleHabit = (item: string) => {
    const next = new Set(checkedHabits);
    next.has(item) ? next.delete(item) : next.add(item);
    setCheckedHabits(next);
  };

  const overallIQ = Math.round((focusSlider + claritySlider + 81 + 68 + 74) / 5);
  const habitProgress = Math.round((checkedHabits.size / dailyHabits.length) * 100);

  return (
    <ModulePageLayout title="IQ MAX" subtitle="Focus, learning systems, and mental clarity.">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Dashboard Top Row */}
        <div className="grid sm:grid-cols-3 gap-4 opacity-0 animate-fade-in">
          {/* Overall Score */}
          <div className="glass-card-strong rounded-2xl p-6 flex flex-col items-center shine-line">
            <ScoreRing score={overallIQ} />
            <h3 className="font-display font-bold text-foreground text-xs mt-3 tracking-wide">COGNITIVE SCORE</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Combined mental performance</p>
          </div>

          {/* Weekly Focus Chart */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-status-success" /> WEEKLY FOCUS
            </h3>
            <div className="flex items-end gap-1.5 h-20">
              {weeklyFocus.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm hover:opacity-80 transition-opacity cursor-default" style={{
                    height: `${val}%`,
                    background: i === weeklyFocus.length - 1 ? "hsl(142 50% 45%)" : "hsl(0 0% 22%)",
                    transition: "height 0.8s ease-out",
                    transitionDelay: `${i * 0.08}s`,
                  }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className={cn("text-[9px] font-display flex-1 text-center", i === 6 ? "text-foreground" : "text-muted-foreground/60")}>{d}</span>
              ))}
            </div>
          </div>

          {/* Quick toggles & habit progress */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-foreground text-xs tracking-wide">MODE TOGGLES</h3>
            {/* Deep Work Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-status-warning" />
                <span className="text-xs font-display text-foreground">Deep Work Mode</span>
              </div>
              <button onClick={() => setDeepWorkToggle(!deepWorkToggle)}
                className={cn("w-10 h-5 rounded-full transition-all duration-300 relative", deepWorkToggle ? "bg-status-success" : "bg-muted")}>
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-all duration-300", deepWorkToggle ? "left-5.5" : "left-0.5")} />
              </button>
            </div>
            {/* Pomodoro Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-silver" />
                <span className="text-xs font-display text-foreground">Pomodoro Timer</span>
              </div>
              <button onClick={() => setPomodoroToggle(!pomodoroToggle)}
                className={cn("w-10 h-5 rounded-full transition-all duration-300 relative", pomodoroToggle ? "bg-status-success" : "bg-muted")}>
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-all duration-300", pomodoroToggle ? "left-5.5" : "left-0.5")} />
              </button>
            </div>
            {/* Habit Progress */}
            <div className="pt-1">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-display text-muted-foreground">Daily Habits</span>
                <span className="text-[10px] font-display font-bold text-foreground">{checkedHabits.size}/{dailyHabits.length}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${habitProgress}%`,
                  background: habitProgress >= 80 ? "hsl(142 50% 45%)" : "linear-gradient(90deg, hsl(35 60% 40%), hsl(35 60% 55%))",
                  transition: "width 0.8s ease-out",
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid sm:grid-cols-2 gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display text-foreground flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-status-warning" /> Focus Capacity
              </span>
              <span className="text-xs font-display font-bold text-foreground">{focusSlider}%</span>
            </div>
            <input type="range" min={0} max={100} value={focusSlider} onChange={(e) => setFocusSlider(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
            <p className="text-[10px] text-muted-foreground">Adjust based on today's self-assessment</p>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display text-foreground flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-silver" /> Mental Clarity
              </span>
              <span className="text-xs font-display font-bold text-foreground">{claritySlider}%</span>
            </div>
            <input type="range" min={0} max={100} value={claritySlider} onChange={(e) => setClaritySlider(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
            <p className="text-[10px] text-muted-foreground">Rate your current mental clarity level</p>
          </div>
        </div>

        {/* Cognitive Metrics */}
        <div className="grid sm:grid-cols-2 gap-4">
          {cognitiveMetrics.map((m, i) => (
            <MetricBar key={m.label} {...m} delay={`${0.15 + i * 0.06}s`} />
          ))}
        </div>

        {/* Daily Habits Checklist */}
        <div className="glass-card rounded-2xl p-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="font-display font-bold text-foreground text-xs tracking-wide mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-status-success" /> DAILY COGNITIVE HABITS
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {dailyHabits.map((item) => (
              <button key={item} onClick={() => toggleHabit(item)}
                className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-muted/20 transition-colors group">
                <div className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-300",
                  checkedHabits.has(item) ? "bg-status-success/20 border-status-success scale-110" : "border-muted-foreground/30 group-hover:border-muted-foreground/60"
                )}>
                  {checkedHabits.has(item) && <CheckCircle className="w-3.5 h-3.5 text-status-success" />}
                </div>
                <span className={cn("text-xs transition-all duration-300", checkedHabits.has(item) ? "text-muted-foreground line-through" : "text-foreground")}>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Knowledge Sections */}
        {sections.map((section, si) => (
          <ExpandableSection key={section.title} title={section.title.toUpperCase()} icon={section.icon} defaultOpen={si === 0} delay={`${0.35 + si * 0.05}s`}>
            <div className="space-y-3">
              {section.content.map((item) => (
                <div key={item.point} className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift group">
                  <h3 className="font-display font-medium text-foreground mb-1 group-hover:text-silver transition-colors">{item.point}</h3>
                  <p className="text-muted-foreground text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </ExpandableSection>
        ))}

        {/* Resources */}
        <div className="glass-card-strong rounded-2xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.55s" }}>
          <h2 className="text-sm font-display font-bold text-foreground mb-4 tracking-wide">RECOMMENDED RESOURCES</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              "Anki (spaced repetition app)",
              '"Thinking, Fast and Slow" – Kahneman',
              '"Make It Stick" – Brown, Roediger, McDaniel',
              '"Deep Work" – Cal Newport',
            ].map((r) => (
              <div key={r} className="flex items-center gap-2 glass-card rounded-lg px-3 py-2 hover:bg-muted/20 transition-colors group">
                <BookOpen className="w-3.5 h-3.5 text-silver group-hover:text-foreground transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{r}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ModulePageLayout>
  );
};

export default IQMaxPage;
