import { ACCENT, Figure, Guide, Mark, Tag } from "./Figure";

/** Fit rules as simple garment sketches: the accent dot is where to check. */
export type FitPart = "Shoulders" | "Sleeves" | "T-shirts" | "Shirts" | "Trousers" | "Jackets";

const LABEL: Record<FitPart, string> = {
  Shoulders: "The shoulder seam sits at the edge of the shoulder bone",
  Sleeves: "Shirt cuff at the wrist bone; jacket sleeve shows about 1 cm of shirt cuff",
  "T-shirts": "T-shirt hem around mid-fly; sleeves end mid-bicep",
  Shirts: "Buttons lie flat with no X-shaped pulling",
  Trousers: "A slight or no break where the trouser meets the shoe",
  Jackets: "Jacket roughly covers the seat",
};

export const FitDiagram = ({ part, className }: { part: FitPart; className?: string }) => (
  <Figure w={120} h={96} label={LABEL[part]} accent="#a78bfa" className={className}>
    {part === "Shoulders" && (
      <>
        <path d="M30 88 V40 Q30 30 44 26 L52 22 Q60 30 68 22 L76 26 Q90 30 90 40 V88" />
        <path d="M44 26 Q42 34 42 40 M76 26 Q78 34 78 40" stroke={ACCENT} />
        <Mark x={44} y={26} />
        <Mark x={76} y={26} />
        <Guide d="M44 10 V26 M76 10 V26" />
        <Tag x={60} y={9} anchor="middle">seam = shoulder edge</Tag>
      </>
    )}
    {part === "Sleeves" && (
      <>
        <path d="M14 30 L80 30 L80 50 L14 50" />
        <path d="M80 32 L92 32 L92 48 L80 48" stroke={ACCENT} />
        <path d="M92 34 Q104 36 106 40 Q104 46 92 46" />
        <Mark x={92} y={40} />
        <Tag x={86} y={62} anchor="middle">~1 cm cuff</Tag>
        <Tag x={100} y={24} anchor="middle">wrist bone</Tag>
        <Guide d="M100 27 V36" />
      </>
    )}
    {part === "T-shirts" && (
      <>
        <path d="M36 20 L50 16 Q60 24 70 16 L84 20 L100 36 L90 44 L84 40 V78 H36 V40 L30 44 L20 36 Z" />
        <path d="M20 36 L30 44 M100 36 L90 44" stroke={ACCENT} />
        <path d="M36 78 H84" stroke={ACCENT} />
        <Mark x={60} y={78} />
        <Tag x={60} y={91} anchor="middle">hem at mid-fly</Tag>
        <Tag x={104} y={50} anchor="end">mid-bicep</Tag>
      </>
    )}
    {part === "Shirts" && (
      <>
        <path d="M34 16 L50 12 L60 22 L70 12 L86 16 L90 86 H30 Z" />
        <path d="M60 22 V86" />
        {[34, 46, 58, 70, 82].map((y) => <circle key={y} cx={60} cy={y} r={1.4} fill="currentColor" stroke="none" />)}
        <path d="M46 40 Q60 42 74 40 M46 64 Q60 66 74 64" stroke={ACCENT} strokeDasharray="2 3" />
        <Tag x={60} y={94} anchor="middle">no pulling at the buttons</Tag>
      </>
    )}
    {part === "Trousers" && (
      <>
        <path d="M40 4 L38 70 M62 4 L64 70" />
        <path d="M38 70 Q51 74 64 70" stroke={ACCENT} />
        <path d="M34 72 H72 Q78 72 80 80 H30 Q30 74 34 72 Z" />
        <Mark x={51} y={72} />
        <Tag x={82} y={62} anchor="start">slight or</Tag>
        <Tag x={82} y={71} anchor="start">no break</Tag>
      </>
    )}
    {part === "Jackets" && (
      <>
        <path d="M40 10 L52 6 L60 22 L68 6 L80 10 L86 70 H34 Z" />
        <path d="M52 6 L56 40 L60 22 L64 40 L68 6" />
        <path d="M44 68 Q60 84 76 68" strokeDasharray="2 3" strokeWidth={1} />
        <path d="M34 70 H86" stroke={ACCENT} />
        <Mark x={60} y={70} />
        <Tag x={60} y={92} anchor="middle">covers the seat</Tag>
      </>
    )}
  </Figure>
);
