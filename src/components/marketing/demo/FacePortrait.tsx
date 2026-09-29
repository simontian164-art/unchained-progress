import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Abstract, illustrated "uploaded photo" with face landmarks.
 * Deliberately not a real person — used only in example UI.
 */
export const FacePortrait = ({
  className,
  scanning = false,
  showMesh = true,
  label = "Illustration of an uploaded front-facing photo with analysis landmarks",
  variant = "before",
}: {
  variant?: "before" | "after";
  className?: string;
  scanning?: boolean;
  showMesh?: boolean;
  label?: string;
}) => {
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const pts: [number, number][] = [
    [128, 150], [172, 150], // eyes
    [150, 186], // nose tip
    [133, 214], [167, 214], // mouth corners
    [104, 170], [196, 170], // cheeks
    [112, 222], [188, 222], // jaw
    [150, 252], // chin
    [118, 128], [182, 128], // brows
  ];
  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)} role="img" aria-label={label}>
      <svg viewBox="0 0 300 340" className="block h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={id("fp-bg")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="hsl(30 8% 20%)" />
            <stop offset="1" stopColor="hsl(30 6% 10%)" />
          </linearGradient>
          <linearGradient id={id("fp-skin")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="hsl(28 22% 52%)" />
            <stop offset="1" stopColor="hsl(26 20% 40%)" />
          </linearGradient>
          <linearGradient id={id("fp-shirt")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="hsl(215 16% 26%)" />
            <stop offset="1" stopColor="hsl(215 16% 18%)" />
          </linearGradient>
        </defs>
        <rect width="300" height="340" fill={`url(#${id("fp-bg")})`} />
        {/* shoulders */}
        <path d={variant === "after" ? "M40 340 C48 294 96 278 150 278 C204 278 252 294 260 340 Z" : "M30 340 C40 292 90 276 150 276 C210 276 260 292 270 340 Z"} fill={`url(#${id("fp-shirt")})`} />
        {/* neck */}
        <path d="M128 244 L128 284 Q150 294 172 284 L172 244 Z" fill="hsl(26 20% 38%)" />
        {/* head */}
        <path
          d="M150 70 C203 70 214 112 212 160 C210 206 190 246 150 258 C110 246 90 206 88 160 C86 112 97 70 150 70 Z"
          fill={`url(#${id("fp-skin")})`}
        />
        {/* hair */}
        {variant === "before" ? (
          <path
            d="M88 150 C80 96 108 58 152 58 C198 58 222 92 212 150 C206 118 196 104 182 98 C160 110 124 108 104 98 C94 108 90 124 88 150 Z"
            fill="hsl(25 18% 14%)"
          />
        ) : (
          <>
            {/* shorter, tapered sides with volume on top */}
            <path
              d="M94 124 C92 80 116 46 152 46 C190 46 212 78 206 124 C200 106 192 98 182 94 C160 104 126 104 110 94 C102 100 96 110 94 124 Z"
              fill="hsl(25 18% 14%)"
            />
            {/* short stubble with a defined line */}
            <path
              d="M100 196 C104 232 124 252 150 258 C176 252 196 232 200 196 C192 222 176 238 150 242 C124 238 108 222 100 196 Z"
              fill="hsl(25 18% 14% / 0.35)"
            />
          </>
        )}
        {/* brows / eyes / mouth, very simplified */}
        <path d="M112 132 Q124 124 138 130" stroke="hsl(25 18% 16%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M162 130 Q176 124 188 132" stroke="hsl(25 18% 16%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="128" cy="151" rx="9" ry="4.5" fill="hsl(25 18% 14%)" opacity="0.85" />
        <ellipse cx="172" cy="151" rx="9" ry="4.5" fill="hsl(25 18% 14%)" opacity="0.85" />
        <path d="M150 158 L145 184 Q150 188 156 184" stroke="hsl(24 20% 30%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M134 213 Q150 222 166 213" stroke="hsl(10 25% 30%)" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {showMesh && (
          <g stroke="hsl(0 0% 100% / 0.35)" strokeWidth="0.8" fill="none">
            <path d="M104 170 L128 150 L150 186 L172 150 L196 170" />
            <path d="M104 170 L112 222 L150 252 L188 222 L196 170" />
            <path d="M133 214 L150 186 L167 214 Z" />
            <path d="M118 128 L128 150 M182 128 L172 150 M128 150 L172 150" />
          </g>
        )}
        {showMesh &&
          pts.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill="hsl(42 70% 63% / 0.18)" />
              <circle cx={x} cy={y} r="2" fill="hsl(42 70% 70%)" />
            </g>
          ))}
      </svg>
      {scanning && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-white/15 to-transparent"
            style={{ animation: "scan-sweep 2.8s ease-in-out infinite" }}
          />
        </div>
      )}
    </div>
  );
};
