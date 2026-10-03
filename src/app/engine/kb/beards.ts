/** Facial-hair options. Several can work for one person; the engine ranks them, it doesn't pick "the" beard. */
import type { FaceShape } from "../../types";

export interface BeardStyle {
  id: string;
  name: string;
  lengthMm: [number, number];
  needsFullGrowth: boolean;
  good: FaceShape[];
  careful: FaceShape[];
  why: Partial<Record<FaceShape, string>>;
  general: string;
}

export const BEARDS: BeardStyle[] = [
  {
    id: "clean",
    name: "Clean-shaven",
    lengthMm: [0, 0],
    needsFullGrowth: false,
    good: ["oval", "square", "heart", "diamond", "round", "oblong"],
    careful: [],
    why: { square: "Shows off a defined jaw.", oval: "Clean and versatile." },
    general: "Always an option. Needs a close shave every 1–2 days to stay sharp.",
  },
  {
    id: "light-stubble",
    name: "Light stubble",
    lengthMm: [1, 2],
    needsFullGrowth: false,
    good: ["oval", "square", "oblong", "heart", "diamond"],
    careful: [],
    why: { oblong: "Adds a bit of texture without lengthening the face." },
    general: "Low effort and forgiving of patchy growth.",
  },
  {
    id: "heavy-stubble",
    name: "Heavy stubble",
    lengthMm: [3, 5],
    needsFullGrowth: false,
    good: ["oval", "round", "square", "heart", "diamond"],
    careful: [],
    why: {
      round: "Adds shadow along the jaw, which reads as more definition.",
      heart: "Adds some weight to a narrower chin.",
      diamond: "Adds width at the chin.",
    },
    general: "Frames the jaw with little maintenance.",
  },
  {
    id: "short-boxed",
    name: "Short boxed beard",
    lengthMm: [6, 12],
    needsFullGrowth: true,
    good: ["round", "oval", "heart", "diamond", "oblong"],
    careful: [],
    why: {
      round: "Keep the sides shorter and the chin a little longer to lengthen the face.",
      heart: "Adds width below a narrow chin.",
      diamond: "Adds fullness at the chin to balance the cheekbones.",
      oblong: "Keep the sides fuller and the chin short so the face doesn't look longer.",
    },
    general: "A polished beard that needs full, even growth.",
  },
  {
    id: "full",
    name: "Full beard (rounded)",
    lengthMm: [15, 30],
    needsFullGrowth: true,
    good: ["square", "heart", "oval", "diamond"],
    careful: ["oblong", "round"],
    why: {
      square: "Rounded corners soften a strong jaw.",
      heart: "Fullness at the chin balances a wider forehead.",
    },
    general: "Needs weekly shaping and daily care (wash, condition, brush).",
  },
];
