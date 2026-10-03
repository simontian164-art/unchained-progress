import { ACCENT, Figure } from "./Figure";

/**
 * Instructional line figures for the posture routine. Deliberately simple: body position and the
 * direction of movement (accent arrow). No muscles, no anatomy claims.
 */
export type Exercise = "Chin tucks" | "Wall slides" | "Band pull-aparts or rows" | "Upper-back extension" | "Hip-flexor stretch" | "Glute bridges";

const LABEL: Record<Exercise, string> = {
  "Chin tucks": "Chin tuck: glide the head straight back, chin level",
  "Wall slides": "Wall slide: back and forearms on the wall, slide the arms up and down",
  "Band pull-aparts or rows": "Row: pull the elbows back and squeeze the shoulder blades",
  "Upper-back extension": "Upper-back extension: lie over a rolled towel at mid-back and let the chest open",
  "Hip-flexor stretch": "Hip-flexor stretch: half-kneeling, shift forward gently",
  "Glute bridges": "Glute bridge: lying on your back, lift the hips",
};

const Arrow = ({ d }: { d: string }) => <path d={d} stroke={ACCENT} strokeWidth={2} />;

export const PostureDiagram = ({ exercise, className }: { exercise: Exercise; className?: string }) => (
  <Figure w={120} h={80} label={LABEL[exercise]} accent="#f87171" className={className}>
    {exercise === "Chin tucks" && (
      <>
        <circle cx={62} cy={26} r={11} />
        <circle cx={70} cy={26} r={11} strokeDasharray="2 3" strokeWidth={1} />
        <path d="M58 37 L58 50 L40 70 M58 50 L78 70" />
        <Arrow d="M86 20 H74 M78 16 l-4 4 4 4" />
      </>
    )}
    {exercise === "Wall slides" && (
      <>
        <path d="M16 4 V76" strokeWidth={2.5} />
        <circle cx={26} cy={16} r={7} />
        <path d="M24 23 V58 L22 76 M24 58 L30 76" />
        <path d="M24 30 L38 30 L38 16" />
        <path d="M24 30 L40 22 L46 6" strokeDasharray="2 3" strokeWidth={1} />
        <Arrow d="M56 30 V10 M52 14 l4 -4 4 4 M56 34 V54 M52 50 l4 4 4 -4" />
      </>
    )}
    {exercise === "Band pull-aparts or rows" && (
      <>
        <circle cx={50} cy={16} r={7} />
        <path d="M50 23 V56 L42 76 M50 56 L58 76" />
        <path d="M50 32 L40 40 L30 32 M50 32 L60 40 L70 32" />
        <path d="M30 32 Q50 26 70 32" stroke={ACCENT} strokeDasharray="3 2" />
        <Arrow d="M24 46 H10 M14 42 l-4 4 4 4 M76 46 H90 M86 42 l4 4 -4 4" />
      </>
    )}
    {exercise === "Upper-back extension" && (
      <>
        <path d="M10 70 H110" strokeWidth={1} />
        <circle cx={58} cy={64} r={6} fill={ACCENT} fillOpacity={0.3} stroke={ACCENT} />
        <path d="M22 60 Q40 52 58 58 Q76 62 92 66 L104 70" />
        <circle cx={16} cy={62} r={7} />
        <path d="M30 56 L22 42 M34 56 L28 40" />
        <Arrow d="M40 44 Q46 36 54 40" />
      </>
    )}
    {exercise === "Hip-flexor stretch" && (
      <>
        <path d="M10 76 H110" strokeWidth={1} />
        <circle cx={58} cy={10} r={7} />
        <path d="M58 17 V46 L78 48 L80 76 M58 46 L42 74 L26 76" />
        <path d="M58 26 L66 40" />
        <Arrow d="M64 58 H84 M80 54 l4 4 -4 4" />
      </>
    )}
    {exercise === "Glute bridges" && (
      <>
        <path d="M6 72 H114" strokeWidth={1} />
        <circle cx={16} cy={64} r={7} />
        <path d="M24 66 L60 46 L78 50 L84 72 M60 46 L70 60" />
        <path d="M26 70 L44 70" />
        <Arrow d="M60 38 V24 M56 28 l4 -4 4 4" />
      </>
    )}
  </Figure>
);
