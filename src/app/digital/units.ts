/** Unit conversion and the accepted ranges (kept identical to the database check constraints). */
export const RANGES = {
  heightCm: [120, 230],
  weightKg: [35, 300],
  waistCm: [40, 200],
  chestCm: [50, 200],
  shoulderCm: [25, 80],
} as const;
export type MeasureKey = keyof typeof RANGES;

export const cmToIn = (cm: number) => cm / 2.54;
export const inToCm = (inch: number) => inch * 2.54;
export const kgToLb = (kg: number) => kg * 2.2046226218;
export const lbToKg = (lb: number) => lb / 2.2046226218;
export const round1 = (n: number) => Math.round(n * 10) / 10;

export const cmToFtIn = (cm: number) => {
  const total = Math.round(cmToIn(cm));
  return { ft: Math.floor(total / 12), inch: total % 12 };
};

export const inRange = (key: MeasureKey, v: number | undefined) => v === undefined || (v >= RANGES[key][0] && v <= RANGES[key][1]);

export const formatHeight = (cm: number | undefined, units: "metric" | "imperial") => {
  if (cm === undefined) return "Not set";
  if (units === "metric") return `${Math.round(cm)} cm`;
  const { ft, inch } = cmToFtIn(cm);
  return `${ft} ft ${inch} in`;
};
export const formatWeight = (kg: number | undefined, units: "metric" | "imperial") =>
  kg === undefined ? "Not set" : units === "metric" ? `${round1(kg)} kg` : `${Math.round(kgToLb(kg))} lb`;
export const formatLength = (cm: number | undefined, units: "metric" | "imperial") =>
  cm === undefined ? "Not set" : units === "metric" ? `${round1(cm)} cm` : `${round1(cmToIn(cm))} in`;
