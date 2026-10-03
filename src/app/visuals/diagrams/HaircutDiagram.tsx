import { CUTS } from "../../engine/kb/haircuts";
import type { HairType } from "../../types";
import { ACCENT, Figure, Tag } from "./Figure";

/**
 * A proportional front-view sketch of a haircut, drawn from the cut's own data (top length, sides,
 * fringe, overall length). It shows proportions (how much longer the top is than the sides, where
 * the fringe sits), which is what a barber needs. It is NOT a picture of the user and not a preview
 * of how it will look on them. Replace with licensed reference photos via <ReferenceImage> later.
 */
type Fringe = "none" | "forward" | "fringe" | "back" | "side" | "curtain";
const FRINGE: Record<string, Fringe> = {
  buzz: "none", crew: "forward", crop: "fringe", quiff: "back", "side-part": "side", "slick-back": "back", curtains: "curtain",
  "curly-taper": "forward", "coily-top": "none", flow: "back", "long-layers": "curtain", lob: "side", bob: "fringe", "curly-shag": "fringe", pixie: "side",
};
const SIDE = { tight: 1.5, medium: 4.5, full: 8 } as const;
const LONG_BOTTOM: Record<string, number> = { "long-layers": 142, lob: 124, bob: 112, flow: 100, curtains: 92, "curly-shag": 100 };

// Face ellipse: centre (60, 80), radii 27 × 34. Fringe edges start and end on it at x = 36 / 84.
const EDGE_Y = 64.4;
const edge: Record<Fringe, string> = {
  none: "Q 60 38 84 64.4",
  back: "Q 60 44 84 64.4",
  forward: "Q 60 66 84 64.4",
  fringe: "C 48 72 72 72 84 64.4",
  side: "C 48 76 64 48 84 64.4",
  curtain: "Q 48 74 60 52 Q 72 74 84 64.4",
};

export const HaircutDiagram = ({
  cutId,
  hairType = "straight",
  topLabel,
  faceFill = "#161616",
  accent = "#facc15",
  className,
}: {
  cutId: string;
  hairType?: HairType;
  topLabel?: string;
  faceFill?: string;
  accent?: string;
  className?: string;
}) => {
  const cut = CUTS.find((c) => c.id === cutId);
  if (!cut) return null;
  const avgTop = (cut.topCm[0] + cut.topCm[1]) / 2;
  const h = cut.length === "long" ? 10 : Math.min(22, 2 + avgTop * 1.5);
  const s = SIDE[cut.sides];
  const L = 33 - s;
  const R = 87 + s;
  const T = 46 - h;
  const B = LONG_BOTTOM[cutId] ?? (cut.sides === "tight" ? 72 : cut.sides === "medium" ? 80 : 90);
  const outer = `M ${L} ${B} L ${L} 70 C ${L} 52 44 ${T} 60 ${T} C 76 ${T} ${R} 52 ${R} 70 L ${R} ${B} Q 60 ${B + 6} ${L} ${B} Z`;
  const fringe = FRINGE[cutId] ?? "none";
  const curly = hairType === "curly" || hairType === "coily";
  const earsShow = cut.sides !== "full" && !LONG_BOTTOM[cutId];
  return (
    <Figure w={120} h={150} label={`Proportions of a ${cut.name.toLowerCase()}: ${topLabel ?? ""}`} accent={accent} className={className}>
      {/* hair mass */}
      <path d={outer} fill={ACCENT} fillOpacity={0.22} stroke={ACCENT} />
      {curly && <path d={outer} stroke={ACCENT} strokeWidth={hairType === "coily" ? 4 : 3} strokeDasharray="0.01 4.5" />}
      {/* face, ears, neck */}
      {earsShow && (
        <>
          <path d="M33 76 q-5 1 -4 7 q1 5 5 5" fill={faceFill} />
          <path d="M87 76 q5 1 4 7 q-1 5 -5 5" fill={faceFill} />
        </>
      )}
      <path d="M49 110 L49 124 M71 110 L71 124 M49 124 Q30 128 18 140 M71 124 Q90 128 102 140" />
      <ellipse cx={60} cy={80} rx={27} ry={34} fill={faceFill} />
      {/* fringe / hairline over the forehead */}
      <path d={`M 36 ${EDGE_Y} ${edge[fringe]} A 27 34 0 0 0 36 ${EDGE_Y} Z`} fill={ACCENT} fillOpacity={0.35} stroke={ACCENT} />
      {/* minimal features for orientation only */}
      <path d="M49 82 h5 M66 82 h5 M58 96 q2 1.5 4 0" strokeWidth={1.25} />
      {/* measurements */}
      {topLabel && (
        <>
          <path d={`M104 ${T} V 50`} strokeWidth={1} />
          <path d={`M101 ${T} h6 M101 50 h6`} strokeWidth={1} />
          <Tag x={118} y={Math.max(8, T - 4)} anchor="end">{topLabel}</Tag>
        </>
      )}
    </Figure>
  );
};
