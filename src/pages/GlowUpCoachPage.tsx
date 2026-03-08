import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Sparkles, CheckCircle, Clock, ChevronDown,
  Flame, Star, Zap, Brain, Dumbbell, Eye, Shirt,
  MessageSquare, CalendarDays, ListChecks, Bell,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────

const dailySuggestions = [
  { id: "s1", icon: Sparkles, title: "Apply vitamin C serum", detail: "Morning application boosts collagen synthesis by 40%. Apply before sunscreen on clean skin.", category: "Skin", priority: "high" },
  { id: "s2", icon: Dumbbell, title: "Hit upper body today", detail: "Your shoulders-to-waist ratio improves fastest with overhead press and lateral raises. Aim for 4×12.", category: "Body", priority: "high" },
  { id: "s3", icon: Eye, title: "Practice 3-second eye contact", detail: "During conversations today, hold eye contact for 3 seconds before looking away. Builds presence naturally.", category: "Social", priority: "medium" },
  { id: "s4", icon: Shirt, title: "Wear your navy fitted shirt", detail: "Navy complements your skin tone best. Pair with dark jeans and white sneakers for a clean casual look.", category: "Style", priority: "medium" },
  { id: "s5", icon: Brain, title: "Read 20 pages before bed", detail: "Consistent reading habit compounds into sharper thinking and better conversation material.", category: "Mind", priority: "low" },
];

const weeklyPlan = [
  { day: "Mon", tasks: ["Morning skincare routine", "Upper body workout", "Read 20 pages"], focus: "Body & Skin", completed: true },
  { day: "Tue", tasks: ["Style audit — try 2 new outfits", "Posture check-ins (3×)", "Evening facial mask"], focus: "Style & Grooming", completed: true },
  { day: "Wed", tasks: ["Lower body workout", "Practice vocal exercises", "Journal 10 min"], focus: "Body & Mind", completed: true },
  { day: "Thu", tasks: ["Haircare treatment", "Social practice — start 2 conversations", "Cold shower"], focus: "Grooming & Social", completed: false },
  { day: "Fri", tasks: ["Full body workout", "Update profile photos", "Meditate 15 min"], focus: "Body & Photo", completed: false },
  { day: "Sat", tasks: ["Wardrobe organization", "Teeth whitening session", "Skill practice 1hr"], focus: "Style & Growth", completed: false },
  { day: "Sun", tasks: ["Rest & recovery", "Weekly review & planning", "Meal prep"], focus: "Recovery", completed: false },
];

const improvementChecklist = [
  { id: "c1", text: "Establish AM/PM skincare routine", category: "Skin", done: true },
  { id: "c2", text: "Work out 4× per week consistently", category: "Body", done: true },
  { id: "c3", text: "Get a haircut every 3-4 weeks", category: "Grooming", done: true },
  { id: "c4", text: "Build a capsule wardrobe (15 pieces)", category: "Style", done: false },
  { id: "c5", text: "Practice public speaking weekly", category: "Social", done: false },
  { id: "c6", text: "Drink 3L water daily", category: "Health", done: true },
  { id: "c7", text: "Sleep 7-8 hours consistently", category: "Health", done: false },
  { id: "c8", text: "Learn a high-income skill", category: "Money", done: false },
  { id: "c9", text: "Take quality photos monthly", category: "Photo", done: false },
  { id: "c10", text: "Journal & reflect weekly", category: "Mind", done: true },
];

const progressReminders = [
  { id: "r1", time: "8:00 AM", message: "Morning skincare + sunscreen — your skin improved 22% since you started", type: "routine" },
  { id: "r2", time: "10:00 AM", message: "Posture check! Stand tall — remember your posture score jumped 15 pts last month", type: "nudge" },
  { id: "r3", time: "1:00 PM", message: "Drink water — you're at 1.2L, target is 3L today", type: "health" },
  { id: "r4", time: "5:30 PM", message: "Gym time! Upper body day — you've hit 3/4 sessions this week", type: "workout" },
  { id: "r5", time: "9:00 PM", message: "Evening routine: cleanser → retinol → moisturizer. Consistency > intensity", type: "routine" },
  { id: "r6", time: "10:00 PM", message: "Read before sleep — 14 pages left to hit your weekly goal", type: "growth" },
];

const coachMessages = [
  "You're in the top 20% of users for consistency this week. Keep pushing — the compound effect is real.",
  "Your skin score jumped 8 points since last month. The vitamin C + sunscreen combo is clearly working.",
  "Style tip: try rolling your sleeves to the mid-forearm. It's a subtle signal of confidence and activity.",
  "Your body composition is shifting. The V-taper is starting to show — stay on the shoulder work.",
  "Social challenge: give 3 genuine compliments today. It rewires your brain for positive interactions.",
];

// ─── Sub-components ──────────────────────────────────────────────────

const SectionWrapper = ({ title, icon, children, delay = "0s" }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: string }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card rounded-2xl overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: delay }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
        <h3 className="font-display font-bold text-foreground text-xs tracking-wide flex items-center gap-2">
          {icon} {title}
        </h3>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-1 items-center px-4 py-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────

const GlowUpCoachPage = () => {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Set<string>>(new Set(improvementChecklist.filter((c) => c.done).map((c) => c.id)));
  const [coachMsg, setCoachMsg] = useState("");
  const [typing, setTyping] = useState(true);

  const checklistProgress = Math.round((checklist.size / improvementChecklist.length) * 100);
  const todayIndex = 3; // Thu

  useEffect(() => {
    const msg = coachMessages[Math.floor(Math.random() * coachMessages.length)];
    const timer = setTimeout(() => { setTyping(false); setCoachMsg(msg); }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const toggleCheck = (id: string) => {
    setChecklist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const priorityColor = (p: string) => p === "high" ? "text-status-warning" : p === "medium" ? "text-silver" : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh" />

      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate("/hub")} className="glass-card rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">AI GlowUp Coach</h1>
            <p className="text-muted-foreground text-[11px] font-display">Your personalised improvement engine</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* AI Coach Message */}
          <div className="glass-card-strong rounded-2xl p-5 shine-line opacity-0 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-status-warning/15 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-status-warning" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-display font-bold text-foreground">Coach</span>
                  <span className="text-[9px] text-muted-foreground">just now</span>
                </div>
                {typing ? <TypingIndicator /> : (
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{coachMsg}</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            {[
              { label: "Today's Tasks", value: `${dailySuggestions.length}`, icon: <Zap className="w-4 h-4 text-status-warning" />, sub: "personalized" },
              { label: "Week Progress", value: `${Math.round((weeklyPlan.filter((d) => d.completed).length / 7) * 100)}%`, icon: <CalendarDays className="w-4 h-4 text-silver" />, sub: `${weeklyPlan.filter((d) => d.completed).length}/7 days` },
              { label: "Checklist", value: `${checklistProgress}%`, icon: <ListChecks className="w-4 h-4 text-status-success" />, sub: `${checklist.size}/${improvementChecklist.length}` },
              { label: "Reminders", value: `${progressReminders.length}`, icon: <Bell className="w-4 h-4 text-rose-400" />, sub: "active today" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-[10px] font-display text-muted-foreground">{s.label}</span></div>
                <span className="text-lg font-display font-bold text-foreground">{s.value}</span>
                <span className="text-[9px] text-muted-foreground ml-2">{s.sub}</span>
              </div>
            ))}
          </div>

          {/* Daily Suggestions */}
          <SectionWrapper title="TODAY'S SUGGESTIONS" icon={<Sparkles className="w-4 h-4 text-status-warning" />} delay="0.1s">
            <div className="space-y-3">
              {dailySuggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="glass-card rounded-xl p-4 hover:ring-1 hover:ring-silver/15 transition-all duration-300 hover-lift group opacity-0 animate-fade-in" style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-silver" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-display font-bold text-foreground group-hover:text-silver transition-colors">{s.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-display text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{s.category}</span>
                            <Star className={cn("w-3 h-3", priorityColor(s.priority))} />
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{s.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionWrapper>

          {/* Weekly Plan */}
          <SectionWrapper title="WEEKLY GLOW UP PLAN" icon={<CalendarDays className="w-4 h-4 text-silver" />} delay="0.2s">
            <div className="space-y-2">
              {weeklyPlan.map((day, i) => (
                <div key={day.day} className={cn(
                  "glass-card rounded-xl p-4 transition-all duration-300",
                  i === todayIndex && "ring-1 ring-status-warning/30",
                  day.completed && "opacity-70"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-display font-bold", i === todayIndex ? "text-status-warning" : "text-foreground")}>{day.day}</span>
                      {i === todayIndex && <span className="text-[8px] font-display text-status-warning bg-status-warning/10 px-2 py-0.5 rounded-full">TODAY</span>}
                      {day.completed && <CheckCircle className="w-3.5 h-3.5 text-status-success" />}
                    </div>
                    <span className="text-[9px] font-display text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{day.focus}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {day.tasks.map((t) => (
                      <span key={t} className="text-[10px] font-display text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* Improvement Checklist */}
          <SectionWrapper title="IMPROVEMENT CHECKLIST" icon={<ListChecks className="w-4 h-4 text-status-success" />} delay="0.3s">
            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-display text-muted-foreground mb-1">
                <span>{checklist.size} of {improvementChecklist.length} complete</span>
                <span>{checklistProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${checklistProgress}%`,
                  background: checklistProgress >= 80 ? "hsl(142 50% 45%)" : checklistProgress >= 50 ? "hsl(35 60% 50%)" : "hsl(0 0% 45%)",
                }} />
              </div>
            </div>
            <div className="space-y-1.5">
              {improvementChecklist.map((item) => (
                <button key={item.id} onClick={() => toggleCheck(item.id)}
                  className={cn("w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 hover:bg-muted/30",
                    checklist.has(item.id) && "opacity-60"
                  )}>
                  <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                    checklist.has(item.id) ? "bg-status-success/20 border-status-success/40" : "border-muted-foreground/30"
                  )}>
                    {checklist.has(item.id) && <CheckCircle className="w-3 h-3 text-status-success" />}
                  </div>
                  <span className={cn("text-[11px] font-display flex-1", checklist.has(item.id) ? "text-muted-foreground line-through" : "text-foreground")}>{item.text}</span>
                  <span className="text-[9px] font-display text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{item.category}</span>
                </button>
              ))}
            </div>
          </SectionWrapper>

          {/* Progress Reminders */}
          <SectionWrapper title="PROGRESS REMINDERS" icon={<Bell className="w-4 h-4 text-rose-400" />} delay="0.4s">
            <div className="space-y-2">
              {progressReminders.map((r) => (
                <div key={r.id} className="glass-card rounded-xl p-4 flex items-start gap-3 hover:ring-1 hover:ring-silver/15 transition-all duration-300">
                  <div className="flex flex-col items-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground mb-1" />
                    <span className="text-[9px] font-display font-bold text-foreground">{r.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{r.message}</p>
                  </div>
                  <span className={cn("text-[8px] font-display px-2 py-0.5 rounded-full shrink-0",
                    r.type === "routine" ? "bg-status-success/10 text-status-success" :
                    r.type === "workout" ? "bg-status-warning/10 text-status-warning" :
                    r.type === "health" ? "bg-sky-500/10 text-sky-400" :
                    r.type === "nudge" ? "bg-violet-500/10 text-violet-400" :
                    "bg-muted/50 text-muted-foreground"
                  )}>{r.type}</span>
                </div>
              ))}
            </div>
          </SectionWrapper>

        </div>
      </main>
    </div>
  );
};

export default GlowUpCoachPage;
