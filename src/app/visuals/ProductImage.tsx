import { Brush, Droplet, Droplets, FlaskConical, Hand, Scissors, Shirt, Smile, Sparkles, Sun, Zap, type LucideIcon } from "lucide-react";
import { referencesFor } from "./references";
import { AREA } from "./areas";
import type { ModuleId } from "../types";

/** Product type → icon. Used until verified product photos exist (they never outweigh the advice). */
const TYPE_ICON: Record<string, LucideIcon> = {
  "cleanser-gel": Droplets, "cleanser-cream": Droplets, "moist-light": Hand, "moist-rich": Hand, sunscreen: Sun,
  bha: FlaskConical, azelaic: FlaskConical, retinoid: FlaskConical, niacinamide: FlaskConical, hyaluronic: Droplet,
  "lip-balm": Smile, "anti-dandruff": Droplets, "hair-product": Sparkles, "haircut-service": Scissors, trimmer: Zap,
  "brow-kit": Brush, floss: Smile, "whitening-paste": Smile, capsule: Shirt, tailoring: Shirt,
};

/**
 * Square product tile. Shows a licensed product image when one is registered under
 * `product:<id>` in references.ts; otherwise a calm icon tile in the area's colour.
 */
export const ProductImage = ({ id, module }: { id: string; module: ModuleId }) => {
  const img = referencesFor(`product:${id}`)[0];
  const A = AREA[module];
  const Icon = TYPE_ICON[id] ?? A.icon;
  if (img) return <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1" />;
  return (
    <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl" style={{ background: `${A.color}14`, color: A.color }}>
      <Icon className="h-6 w-6" />
    </span>
  );
};
