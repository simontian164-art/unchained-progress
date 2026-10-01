import { useState, type ReactNode } from "react";
import { Check, ChevronDown, HelpCircle, Home, Scissors, ShoppingBag, Zap, Timer, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Action, categoryMeta } from "./planData";
import { toggleDone, useDone } from "./memberStore";

export const Panel = ({ title, aside, children, className }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={cn("rounded-2xl border border-border bg-card/80 p-5 md:p-6", className)}>
    {(title || aside) && (
      <div className="mb-4 flex items-baseline justify-between gap-3">
        {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
        {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
      </div>
    )}
    {children}
  </section>
);

export const PageHeader = ({ eyebrow, title, sub, right }: { eyebrow?: string; title: string; sub?: string; right?: ReactNode }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow && <p className="text-sm text-muted-foreground">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      {sub && <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{sub}</p>}
    </div>
    {right}
  </div>
);

export const Chip = ({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
    active ? "border-foreground/20 bg-accent text-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
    {children}
  </button>
);

const Tag = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground", className)}>{children}</span>
);

export const Tick = ({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) => (
  <button onClick={onClick} aria-label={label} aria-pressed={checked}
    className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
      checked ? "border-status-success bg-status-success text-background" : "border-muted-foreground/50 hover:border-foreground")}>
    {checked && <Check className="h-3 w-3" strokeWidth={3} />}
  </button>
);

export const ActionCard = ({ a }: { a: Action }) => {
  const { isDone } = useDone();
  const [open, setOpen] = useState(false);
  const [why, setWhy] = useState(false);
  const [vote, setVote] = useState<0 | 1 | -1>(0);
  const m = categoryMeta[a.cat];
  const done = isDone(a.id);
  const WhereIcon = a.where === "At home" ? Home : a.where === "Product" ? ShoppingBag : Scissors;
  return (
    <div className={cn("rounded-xl border border-border border-l-[3px] bg-background/40 p-4 transition-opacity", m.border, done && "opacity-60")}>
      <div className="flex gap-3">
        <div className="pt-0.5"><Tick checked={done} onClick={() => toggleDone(a.id)} label={`Mark ${a.title} done`} /></div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-[11px] font-semibold uppercase tracking-wider", m.text)}>{m.label}</p>
          <h3 className={cn("mt-1 font-medium", done && "line-through")}>{a.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{a.desc}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Tag><WhereIcon className="h-3 w-3" />{a.where}</Tag>
            {a.bigImpact && <Tag className="border-gold/40 bg-gold-muted text-gold"><Zap className="h-3 w-3" />Big impact</Tag>}
            <Tag className="border-status-info/40 text-status-info"><Timer className="h-3 w-3" />Quick</Tag>
            {a.cost && <Tag>{a.cost}</Tag>}
            {a.free && <Tag className="border-status-success/40 text-status-success">Free</Tag>}
            <Tag><Clock className="h-3 w-3" />{a.when}</Tag>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-sm">
              How to do it <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </button>
            {a.why && (
              <button onClick={() => setWhy(!why)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-3.5 w-3.5" /> Why this?
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button aria-label="Helpful" onClick={() => setVote(vote === 1 ? 0 : 1)} className={cn("rounded-full border border-border p-2", vote === 1 && "bg-accent")}><ThumbsUp className="h-3.5 w-3.5" /></button>
              <button aria-label="Not for me" onClick={() => setVote(vote === -1 ? 0 : -1)} className={cn("rounded-full border border-border p-2", vote === -1 && "bg-accent")}><ThumbsDown className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {open && (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {a.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          )}
          {why && a.why && <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{a.why}</p>}
        </div>
      </div>
    </div>
  );
};
