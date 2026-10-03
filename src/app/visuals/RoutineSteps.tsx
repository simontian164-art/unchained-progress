import { Droplets, FlaskConical, Hand, Sun, Waves } from "lucide-react";
import type { RoutineStep } from "../types";

/** How much to use: the one thing people get wrong most, shown as a plain chip. */
const AMOUNT: Record<string, string> = {
  "am-spf": "2 finger-lengths",
  "am-moist": "Almond-size",
  "pm-moist": "Almond-size",
  "am-cleanse": "Coin-size",
  "pm-cleanse": "Coin-size",
};

const iconFor = (s: RoutineStep) =>
  s.id.includes("spf") ? Sun : s.id.includes("active") ? FlaskConical : s.id.includes("moist") ? Hand : s.label.startsWith("Rinse") ? Waves : Droplets;

/**
 * AM / PM routine as an ordered rail: order, product type and amount at a glance. Skin colour
 * accent, no product photos, no close-ups of skin.
 */
export const RoutineSteps = ({ am, pm }: { am: RoutineStep[]; pm: RoutineStep[] }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {([["Morning", am, Sun], ["Evening", pm, Waves]] as const).map(([title, steps]) => (
      <div key={title} className="surface-inset rounded-xl p-4">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">{title}</h3>
        <ol className="relative mt-3 space-y-3">
          <span aria-hidden="true" className="absolute bottom-3 left-[13px] top-3 w-px bg-[#f472b6]/30" />
          {steps.map((s, i) => {
            const Icon = iconFor(s);
            const amount = s.label.startsWith("Rinse") ? undefined : AMOUNT[s.id] ?? (s.id.includes("active") ? (s.label.toLowerCase().includes("retin") ? "Pea-size" : "A few drops") : undefined);
            return (
              <li key={s.id} className="relative flex gap-3">
                <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#f472b6]/40 bg-background text-[#f472b6]">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm text-foreground"><span className="sr-only">Step {i + 1}: </span>{s.label}</p>
                  {s.detail && <p className="text-xs leading-5 text-muted-foreground">{s.detail}</p>}
                  {amount && <span className="mt-1 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{amount}</span>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    ))}
  </div>
);
