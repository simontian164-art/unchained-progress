import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Opt<T extends string> = { value: T; label: string; hint?: string };

/** Single-choice cards (radio group). */
export function ChoiceGroup<T extends string>({
  legend,
  help,
  name,
  options,
  value,
  onChange,
  columns = 2,
}: {
  legend: string;
  help?: string;
  name: string;
  options: Opt<T>[];
  value: T | undefined;
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="text-[15px] font-medium text-foreground">{legend}</legend>
      {help && <p className="mt-1 text-sm leading-6 text-muted-foreground">{help}</p>}
      <div className={cn("mt-3 grid gap-2", columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "")}>
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-white/40",
                selected ? "border-white/35 bg-white/[0.08]" : "border-white/10 bg-white/[0.02] hover:border-white/20",
              )}
            >
              <input type="radio" name={name} value={o.value} checked={selected} onChange={() => onChange(o.value)} className="sr-only" />
              <span
                aria-hidden="true"
                className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", selected ? "border-foreground" : "border-white/30")}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-foreground" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{o.label}</span>
                {o.hint && <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{o.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Multi-select chips (checkbox group). An optional "none" value clears the others. */
export function MultiChoice<T extends string>({
  legend,
  help,
  options,
  value,
  onChange,
  noneLabel,
}: {
  legend: string;
  help?: string;
  options: Opt<T>[];
  value: T[];
  onChange: (v: T[]) => void;
  noneLabel?: string;
}) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <fieldset>
      <legend className="text-[15px] font-medium text-foreground">{legend}</legend>
      {help && <p className="mt-1 text-sm leading-6 text-muted-foreground">{help}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <label
              key={o.value}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-white/40",
                on ? "border-white/35 bg-white/[0.1] text-foreground" : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground",
              )}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(o.value)} className="sr-only" />
              {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {o.label}
            </label>
          );
        })}
        {noneLabel && (
          <button
            type="button"
            onClick={() => onChange([])}
            aria-pressed={value.length === 0}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm transition-colors",
              value.length === 0 ? "border-white/35 bg-white/[0.1] text-foreground" : "border-white/10 text-muted-foreground hover:border-white/20",
            )}
          >
            {noneLabel}
          </button>
        )}
      </div>
    </fieldset>
  );
}

export const YesNo = ({ legend, help, value, onChange, name }: { legend: string; help?: string; value: boolean | undefined; onChange: (v: boolean) => void; name: string }) => (
  <ChoiceGroup
    legend={legend}
    help={help}
    name={name}
    value={value === undefined ? undefined : value ? "yes" : "no"}
    onChange={(v) => onChange(v === "yes")}
    options={[
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ]}
  />
);
