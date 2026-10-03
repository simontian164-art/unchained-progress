import type { HairlineAngle } from "../../types";
import { ACCENT, Figure } from "./Figure";

const LABEL: Record<HairlineAngle, string> = {
  front: "Front hairline: face the camera with hair pushed back off the forehead",
  "left-temple": "Left temple: turn your head about 45 degrees to the right",
  "right-temple": "Right temple: turn your head about 45 degrees to the left",
  top: "Top: head tilted down, phone held directly above, hair parted in the middle",
  crown: "Crown: the back of the top of your head, photographed from behind and above",
};

/** Phone glyph showing where the camera goes. */
const Phone = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-4} y={-6.5} width={8} height={13} rx={2} />
    <circle cx={0} cy={-3.5} r={0.6} fill="currentColor" stroke="none" />
  </g>
);

/**
 * How to take each hairline photo, drawn the same way for all five angles so the set reads as one
 * instruction sheet. The accent marks the area the photo must show.
 */
export const HairlineAngleDiagram = ({ angle, className }: { angle: HairlineAngle; className?: string }) => (
  <Figure w={72} h={72} label={LABEL[angle]} accent="#facc15" className={className}>
    {angle === "front" && (
      <>
        <ellipse cx={36} cy={40} rx={17} ry={21} />
        <path d="M21 32 Q36 20 51 32" stroke={ACCENT} strokeWidth={2.5} />
        <path d="M36 24 v-8 M32 19 l4 -4 4 4" stroke={ACCENT} strokeWidth={1.25} />
        <circle cx={30} cy={40} r={1} fill="currentColor" stroke="none" />
        <circle cx={42} cy={40} r={1} fill="currentColor" stroke="none" />
        <path d="M33 51 q3 2 6 0" />
        <Phone x={62} y={40} />
      </>
    )}
    {(angle === "left-temple" || angle === "right-temple") && (
      <g transform={angle === "right-temple" ? "translate(72 0) scale(-1 1)" : undefined}>
        <path d="M24 60 C14 52 16 26 32 21 C46 17 56 26 54 40 C53 50 50 57 44 61" />
        <path d="M23 31 Q27 22 36 21" stroke={ACCENT} strokeWidth={2.5} />
        <circle cx={44} cy={39} r={1} fill="currentColor" stroke="none" />
        <path d="M54 42 l3 2 -3 1" />
        <path d="M10 18 a14 14 0 0 1 16 -6" strokeWidth={1.25} />
        <path d="M23 9 l3 3 -4 2" strokeWidth={1.25} />
        <Phone x={10} y={40} />
      </g>
    )}
    {angle === "top" && (
      <>
        <circle cx={36} cy={40} r={20} />
        <path d="M36 21 v38" stroke={ACCENT} strokeWidth={2.5} />
        <path d="M33 60 l3 4 3 -4" />
        <Phone x={36} y={10} rot={90} />
      </>
    )}
    {angle === "crown" && (
      <>
        <circle cx={36} cy={42} r={20} />
        <path d="M36 36 a3 3 0 1 1 -3 3 a6 6 0 1 1 6 6 a9 9 0 1 1 -10 -8" stroke={ACCENT} strokeWidth={2} />
        <path d="M28 62 q8 5 16 0" />
        <Phone x={62} y={14} rot={35} />
      </>
    )}
  </Figure>
);
