import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { referencesFor } from "./references";

/**
 * One slot for reference imagery. Shows a licensed photo when one exists for the key, otherwise the
 * GlowMax diagram passed as `fallback`. Pages never import photos directly, so swapping in a
 * commissioned library later is a data change, not a redesign.
 */
export const ReferenceImage = ({ refKey, fallbackKey, fallback, className, aspect = "aspect-[4/5]" }: { refKey: string; fallbackKey?: string; fallback: ReactNode; className?: string; aspect?: string }) => {
  const img = referencesFor(refKey, fallbackKey)[0];
  if (!img) return <div className={cn("flex items-center justify-center", className)}>{fallback}</div>;
  return (
    <figure className={className}>
      <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 640px) 320px, 80vw" alt={img.alt} loading="lazy" decoding="async" className={cn("w-full rounded-xl object-cover", aspect)} />
      <figcaption className="mt-1 text-[10px] text-muted-foreground">{img.credit}</figcaption>
    </figure>
  );
};
