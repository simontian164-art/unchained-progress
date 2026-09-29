import { cn } from "@/lib/utils";
import type { Priority } from "@/data/exampleAnalysis";

const STYLES: Record<Priority, string> = {
  "High impact": "text-[hsl(42_75%_72%)] bg-[hsl(42_70%_50%/0.1)] border-[hsl(42_70%_50%/0.25)]",
  "Medium impact": "text-silver-bright bg-white/[0.05] border-white/10",
  "Quick win": "text-[hsl(150_45%_65%)] bg-[hsl(150_45%_45%/0.1)] border-[hsl(150_45%_45%/0.25)]",
};

export const PriorityChip = ({ priority }: { priority: Priority }) => (
  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", STYLES[priority])}>
    {priority}
  </span>
);
