import type { Formula } from "../../engine/kb/guides";

/**
 * A flat-lay sketch of an outfit formula in its real colours: silhouette + colour combination +
 * footwear at a glance. Garment shapes are generic on purpose; it's a GlowMax board, not a collage
 * of other people's photos.
 */
type Kind = "tee" | "shirt" | "knit" | "polo" | "hoodie" | "jacket" | "blazer" | "trousers" | "jeans" | "shorts" | "skirt" | "joggers" | "dress" | "sneaker" | "loafer" | "boot" | "flat" | "bag" | "cap";

const kindOf = (piece: string): Kind | null => {
  const p = piece.toLowerCase();
  if (/sneaker|trainer/.test(p)) return "sneaker";
  if (/loafer|derb|slingback|heel/.test(p)) return "loafer";
  if (/boot/.test(p)) return "boot";
  if (/flat/.test(p)) return "flat";
  if (/tote|bag/.test(p)) return "bag";
  if (/cap|beanie/.test(p)) return "cap";
  if (/blazer|trench/.test(p)) return "blazer";
  if (/jacket|overshirt|bomber|chore/.test(p)) return "jacket";
  if (/hoodie|sweatshirt|zip/.test(p)) return "hoodie";
  if (/polo/.test(p)) return "polo";
  if (/knit|sweater|cardigan|crew|cable|merino|henley/.test(p)) return "knit";
  if (/shirt|oxford|blouse|flannel/.test(p)) return "shirt";
  if (/tee|t-shirt|set/.test(p)) return "tee";
  if (/skirt/.test(p)) return "skirt";
  if (/short/.test(p)) return "shorts";
  if (/jogger/.test(p)) return "joggers";
  if (/jean|denim/.test(p)) return "jeans";
  if (/trouser|chino|pant|cargo/.test(p)) return "trousers";
  return null;
};

const TOPS = new Set<Kind>(["tee", "shirt", "knit", "polo", "hoodie"]);
const LAYERS = new Set<Kind>(["jacket", "blazer"]);
const BOTTOMS = new Set<Kind>(["trousers", "jeans", "shorts", "skirt", "joggers"]);
const SHOES = new Set<Kind>(["sneaker", "loafer", "boot", "flat"]);

const SHAPE: Partial<Record<Kind, string>> = {
  tee: "M8 6 L22 2 Q30 8 38 2 L52 6 L60 18 L50 24 L46 20 V58 H14 V20 L10 24 L0 18 Z",
  polo: "M8 6 L22 2 L30 12 L38 2 L52 6 L60 18 L50 24 L46 20 V58 H14 V20 L10 24 L0 18 Z",
  shirt: "M8 6 L22 2 L30 10 L38 2 L52 6 L58 56 L48 58 L46 26 V60 H14 V26 L12 58 L2 56 Z",
  knit: "M8 6 L22 2 Q30 7 38 2 L52 6 L58 56 L48 58 L46 26 V60 H14 V26 L12 58 L2 56 Z",
  hoodie: "M8 8 L20 2 Q30 -2 40 2 L52 8 L58 56 L48 58 L46 26 V60 H14 V26 L12 58 L2 56 Z",
  jacket: "M6 6 L22 0 L30 10 L38 0 L54 6 L60 60 L50 62 L48 28 V64 H12 V28 L10 62 L0 60 Z",
  blazer: "M6 6 L22 0 L30 22 L38 0 L54 6 L60 60 L50 62 L48 28 V66 H12 V28 L10 62 L0 60 Z",
  trousers: "M4 0 H40 L44 70 H28 L22 20 L16 70 H0 Z",
  jeans: "M4 0 H40 L42 70 H27 L22 22 L17 70 H2 Z",
  joggers: "M4 0 H40 L40 66 Q34 70 28 66 L22 22 L16 66 Q10 70 4 66 Z",
  shorts: "M4 0 H40 L44 32 H26 L22 14 L18 32 H0 Z",
  skirt: "M8 0 H36 L46 58 H-2 Z",
  sneaker: "M0 10 Q2 2 12 2 L20 6 Q30 8 34 12 V16 H0 Z",
  loafer: "M0 12 Q4 4 14 4 Q26 4 34 12 V16 H0 Z",
  boot: "M4 0 H16 V8 Q28 8 34 12 V16 H2 Z",
  flat: "M0 12 Q6 6 16 6 Q28 6 34 12 V15 H0 Z",
};

const Piece = ({ kind, color, x, y, scale = 1 }: { kind: Kind; color: string; x: number; y: number; scale?: number }) =>
  SHAPE[kind] ? (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={SHAPE[kind]} fill={color} stroke="rgba(255,255,255,0.35)" strokeWidth={1 / scale} strokeLinejoin="round" />
      {(kind === "shirt" || kind === "blazer" || kind === "jacket") && <path d="M30 12 V58" stroke="rgba(0,0,0,0.25)" strokeWidth={1 / scale} />}
      {kind === "knit" && <path d="M14 54 H46" stroke="rgba(0,0,0,0.25)" strokeWidth={2 / scale} />}
    </g>
  ) : null;

export const OutfitFigure = ({ formula, className }: { formula: Formula; className?: string }) => {
  const items = formula.pieces.map((p, i) => ({ kind: kindOf(p), color: formula.colors[i]?.hex ?? formula.colors[formula.colors.length - 1].hex, name: p }));
  const top = items.find((i) => i.kind && TOPS.has(i.kind));
  const layer = items.find((i) => i.kind && LAYERS.has(i.kind));
  const bottom = items.find((i) => i.kind && BOTTOMS.has(i.kind));
  const shoe = items.find((i) => i.kind && SHOES.has(i.kind));
  return (
    <svg viewBox="0 0 150 120" role="img" aria-label={`Outfit: ${formula.pieces.join(", ")}`} className={className}>
      <title>{formula.pieces.join(" + ")}</title>
      {layer && <Piece kind={layer.kind!} color={layer.color} x={6} y={6} scale={0.95} />}
      {top && <Piece kind={top.kind!} color={top.color} x={layer ? 26 : 12} y={layer ? 14 : 8} scale={layer ? 0.8 : 0.95} />}
      {bottom && <Piece kind={bottom.kind!} color={bottom.color} x={92} y={6} scale={bottom.kind === "shorts" ? 1 : 1.2} />}
      {shoe && (
        <>
          <Piece kind={shoe.kind!} color={shoe.color} x={62} y={96} scale={1} />
          <Piece kind={shoe.kind!} color={shoe.color} x={98} y={100} scale={1} />
        </>
      )}
    </svg>
  );
};
