/** Style guidance: common stylist heuristics, framed as options, not rules. */
import type { Budget, Build, Contrast, FaceShape, Height, StyleVibe, Undertone } from "../../types";

export const NECKLINES: Record<FaceShape, string> = {
  oval: "Most necklines and collars work.",
  round: "V-necks, open collars and pointed collars add length.",
  square: "Crew and V-necks both work; softer, rounded collars balance angles.",
  oblong: "Crew necks and spread collars add width; skip very deep V-necks.",
  heart: "V-necks and scoop necks balance a narrower chin.",
  diamond: "Crew necks and button-down collars add width at the neck.",
};

export const FRAMES: Record<FaceShape, string> = {
  oval: "Most frames, about as wide as your face.",
  round: "Rectangular or angular frames.",
  square: "Round or oval frames.",
  oblong: "Deeper frames with a strong top line.",
  heart: "Bottom-heavy, rimless or light round frames.",
  diamond: "Oval or browline frames.",
};

export const PALETTE: Record<Contrast, { colors: string; tip: string }> = {
  high: { colors: "navy, black, white, charcoal, deep burgundy", tip: "Strong contrast works on you, like a white tee under a navy jacket." },
  medium: { colors: "navy, olive, grey, rust, cream", tip: "Pair one mid tone with one lighter or darker piece." },
  low: { colors: "stone, sage, camel, soft grey, muted blue", tip: "Tonal outfits in similar shades look more expensive than stark black and white." },
};

export const UNDERTONE: Record<Undertone, string> = {
  cool: "Silver-tone metals and blue-based colors (navy, cool grey, burgundy) tend to sit well near your face.",
  warm: "Gold-tone metals and earthy colors (olive, camel, rust, cream) tend to sit well near your face.",
  neutral: "Both silver and gold work, so you can wear most colors.",
  unsure: "Try a silver and a gold item next to your face in daylight; whichever looks brighter is a good guide.",
};

export const BUILD: Record<Exclude<Build, "skip">, string[]> = {
  slim: ["Layers (overshirt over a tee) add width.", "Heavier fabrics drape better than thin, clingy ones.", "Horizontal details like a textured knit add breadth."],
  average: ["Fit at the shoulders and waist is what makes it look sharp.", "Most cuts work; avoid oversized unless it's a deliberate look."],
  broad: ["Simple, structured pieces; avoid tops that pull across the chest.", "Size for the shoulders, then have the waist taken in if needed.", "V-necks and open collars balance broad shoulders."],
  heavier: ["Structured shoulders and mid-weight fabrics hold their shape.", "Tonal or darker outfits create a longer line.", "Avoid clingy fabrics and very tight fits; slightly relaxed looks sharper."],
};

export const HEIGHT: Record<Exclude<Height, "skip">, string> = {
  shorter: "One-color outfits, shorter jackets and trousers with no break create a longer line.",
  average: "Most proportions work; keep jackets ending around mid-seat.",
  taller: "Layers, cuffed trousers and horizontal elements break up height if you want to.",
};

export const CAPSULE: Record<Budget, { items: string[]; note: string }> = {
  low: {
    items: ["3 plain tees that fit at the shoulder", "1 overshirt or light jacket", "1 pair of dark tapered jeans or chinos", "1 pair of clean white sneakers"],
    note: "Basics-focused shops are fine. Spend what's left on tailoring.",
  },
  mid: {
    items: ["3 heavyweight tees", "1 oxford shirt", "1 overshirt or chore jacket", "Dark tapered jeans + chinos", "Minimal leather sneakers"],
    note: "Prioritize fabric weight: heavier cotton drapes better.",
  },
  high: {
    items: ["Heavyweight tees and 1 knit", "1 tailored jacket or overshirt", "2 pairs of trousers hemmed to your length", "Leather sneakers + 1 smarter shoe"],
    note: "Budget for a tailor. It changes everything.",
  },
};

export const VIBE: Record<StyleVibe, string> = {
  "clean-casual": "Plain, well-fitting basics in your best colors; no big logos.",
  classic: "Understated classics in natural fabrics: knitwear, oxford shirts, tailored trousers, loafers. No logos.",
  athletic: "Clean performance pieces that look put-together outside the gym.",
  rugged: "Denim, canvas, flannel and boots that wear in well.",
  smart: "Collared shirts, knitwear, trousers with a clean break.",
  street: "Relaxed fits are fine; keep one element structured, like shoulders or shoes.",
  minimal: "3–4 colors, good fabrics, no logos.",
  unsure: "Start with clean casual. It's the easiest to get right.",
};

export const MEASUREMENTS = [
  "Chest (around the fullest part, under the arms)",
  "Waist (where your trousers sit)",
  "Shoulder width (seam to seam across the back)",
  "Sleeve (shoulder seam to wrist bone)",
  "Inseam (crotch to where you want the hem)",
];
