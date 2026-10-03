import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Base for every GlowMax diagram: one line weight (1.75), round caps and joins, neutral line colour
 * and ONE accent colour for the thing that matters. No gradients, no 3D, no anatomy.
 */
export const Figure = ({
  w,
  h,
  label,
  accent = "#e5e7eb",
  className,
  children,
}: {
  w: number;
  h: number;
  label: string;
  accent?: string;
  className?: string;
  children: ReactNode;
}) => (
  <svg
    viewBox={`0 0 ${w} ${h}`}
    role="img"
    aria-label={label}
    className={cn("text-white/55", className)}
    style={{ "--accent": accent } as CSSProperties}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <title>{label}</title>
    {children}
  </svg>
);

export const ACCENT = "var(--accent)";

/** Small label inside a diagram. */
export const Tag = ({ x, y, children, anchor = "start" }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={7.5} fill="currentColor" stroke="none" fontFamily="Inter, system-ui, sans-serif">
    {children}
  </text>
);

/** Dashed guide line. */
export const Guide = ({ d }: { d: string }) => <path d={d} strokeDasharray="2 3" strokeWidth={1} />;

/** Tick marker used to show "this is the right spot". */
export const Mark = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={3} fill={ACCENT} stroke="none" />;
