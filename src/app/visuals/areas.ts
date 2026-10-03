/**
 * The one colour + icon per area used across the member app AND the marketing demo,
 * so the landing page shows exactly what the product looks like.
 */
import { Brush, Droplet, Dumbbell, Eye, ScanFace, Scissors, Shirt, Smile, type LucideIcon } from "lucide-react";
import type { ModuleId } from "../types";

export const AREA: Record<ModuleId, { label: string; icon: LucideIcon; color: string }> = {
  face: { label: "Face", icon: ScanFace, color: "#cbd5e1" },
  hair: { label: "Hair", icon: Scissors, color: "#facc15" },
  beard: { label: "Facial hair", icon: Brush, color: "#fb923c" },
  skin: { label: "Skin", icon: Droplet, color: "#f472b6" },
  eyes: { label: "Eyes & brows", icon: Eye, color: "#38bdf8" },
  smile: { label: "Smile", icon: Smile, color: "#2dd4bf" },
  style: { label: "Style", icon: Shirt, color: "#a78bfa" },
  body: { label: "Body", icon: Dumbbell, color: "#f87171" },
};
