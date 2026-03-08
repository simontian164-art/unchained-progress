import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Flame } from "lucide-react";

const defaultHabits = [
  { id: "skincare", label: "Skincare routine", category: "Skin" },
  { id: "workout", label: "Workout", category: "Body" },
  { id: "reading", label: "30 min reading", category: "IQ" },
  { id: "style", label: "Outfit planned", category: "Style" },
  { id: "posture", label: "Posture check", category: "Presence" },
  { id: "budget", label: "Budget review", category: "Money" },
];

const DailyTracker = () => {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = checked.size;
  const totalCount = defaultHabits.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="glass-card-strong rounded-2xl p-6 shine-line">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-foreground text-sm tracking-wide">DAILY PROTOCOL</h3>
          <p className="text-muted-foreground text-xs mt-0.5">{completedCount}/{totalCount} completed</p>
        </div>
        <div className="flex items-center gap-2">
          <Flame className={cn("w-4 h-4 transition-colors", completedCount === totalCount ? "text-status-warning" : "text-muted-foreground")} />
          <span className="text-xs font-display text-muted-foreground">{percentage}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: percentage === 100
              ? "hsl(142 50% 45%)"
              : "linear-gradient(90deg, hsl(0 0% 50%), hsl(0 0% 75%))",
          }}
        />
      </div>

      <div className="space-y-2">
        {defaultHabits.map((habit) => {
          const done = checked.has(habit.id);
          return (
            <button
              key={habit.id}
              onClick={() => toggle(habit.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left",
                done ? "glass-card-strong" : "glass-card hover:ring-1 hover:ring-silver/10"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 border",
                done
                  ? "bg-status-success/20 border-status-success/50"
                  : "border-border"
              )}>
                {done && <Check className="w-3 h-3 text-status-success" />}
              </div>
              <span className={cn(
                "text-sm font-display transition-colors flex-1",
                done ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {habit.label}
              </span>
              <span className="text-[10px] font-display text-muted-foreground/60 uppercase tracking-wider">
                {habit.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyTracker;
