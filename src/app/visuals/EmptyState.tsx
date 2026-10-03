import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Every empty state says what this space is for and what to do next — never just "nothing here". */
export const EmptyState = ({ icon: Icon, title, body, action, visual }: { icon?: LucideIcon; title: string; body: string; action?: ReactNode; visual?: ReactNode }) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/12 px-5 py-8 text-center">
    {visual ?? (Icon && (
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-silver-bright" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
    ))}
    <p className="mt-3 text-[15px] font-medium text-foreground">{title}</p>
    <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
