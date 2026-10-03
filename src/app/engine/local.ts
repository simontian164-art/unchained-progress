/**
 * Localization: currency, units, and search links.
 * We never show distances, opening hours, stock or ratings we can't verify. Links open a map or a
 * shopping search so the user sees live results from the source.
 */
import type { Country, Profile } from "../types";

export const COUNTRIES: { value: Country; label: string }[] = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "IE", label: "Ireland" },
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "New Zealand" },
  { value: "OTHER", label: "Somewhere else" },
];

const CFG: Record<Country, { currency: string; symbol: string; factor: number; metric: boolean; gl: string; amazon?: string }> = {
  CA: { currency: "CAD", symbol: "$", factor: 1.35, metric: true, gl: "ca", amazon: "amazon.ca" },
  US: { currency: "USD", symbol: "$", factor: 1, metric: false, gl: "us", amazon: "amazon.com" },
  UK: { currency: "GBP", symbol: "£", factor: 0.8, metric: true, gl: "uk", amazon: "amazon.co.uk" },
  IE: { currency: "EUR", symbol: "€", factor: 0.93, metric: true, gl: "ie" },
  AU: { currency: "AUD", symbol: "$", factor: 1.5, metric: true, gl: "au", amazon: "amazon.com.au" },
  NZ: { currency: "NZD", symbol: "$", factor: 1.65, metric: true, gl: "nz" },
  OTHER: { currency: "USD", symbol: "$", factor: 1, metric: true, gl: "us" },
};

export const localCfg = (c: Country) => CFG[c];

/** Price estimates are authored in USD and converted with a rough, fixed factor. Always labelled "estimate". */
export const localPrice = (usd: [number, number], c: Country): [number, number] => {
  const f = CFG[c].factor;
  const r = (n: number) => (n < 20 ? Math.round(n) : Math.round(n / 5) * 5);
  return [r(usd[0] * f), r(usd[1] * f)];
};

export const fmtRange = ([a, b]: [number, number], c: Country) => {
  const { symbol, currency } = CFG[c];
  if (a === 0 && b === 0) return "Free";
  return `${symbol}${a}–${symbol}${b} ${currency}`;
};

/** "2.5 cm (1 in)" or "1 in (2.5 cm)" depending on country. */
export const len = (cm: number, c: Country) => {
  const inStr = `${+(Math.round((cm / 2.54) * 4) / 4).toFixed(2)} in`;
  const cmStr = `${+cm.toFixed(1)} cm`;
  return CFG[c].metric ? `${cmStr} (${inStr})` : `${inStr} (${cmStr})`;
};

export type Coords = { lat: number; lng: number };

/** Google Maps search. Uses coordinates if the user shared them this session, else their area, else "near me". */
export const mapsUrl = (query: string, p?: Pick<Profile, "area">, coords?: Coords | null) => {
  if (coords) return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${coords.lat.toFixed(3)},${coords.lng.toFixed(3)},13z`;
  const where = p?.area?.trim() ? ` near ${p.area.trim()}` : " near me";
  return `https://www.google.com/maps/search/${encodeURIComponent(query + where)}`;
};

export const shoppingUrl = (query: string, c: Country) =>
  `https://www.google.com/search?tbm=shop&gl=${CFG[c].gl}&q=${encodeURIComponent(query)}`;

export const amazonUrl = (query: string, c: Country) =>
  CFG[c].amazon ? `https://www.${CFG[c].amazon}/s?k=${encodeURIComponent(query)}` : null;

/** Adds the user's product preferences to a search as search terms (not as claims about any product). */
export const withPrefs = (query: string, p: Profile) => {
  const extra: string[] = [];
  if (p.fragranceFree || p.sensitive || p.allergies.includes("fragrance") || p.allergies.includes("essential-oils")) extra.push("fragrance free");
  if (p.vegan) extra.push("vegan");
  if (p.crueltyFree) extra.push("cruelty free");
  return [query, ...extra].join(" ");
};

export const naturalQuery = (query: string) => `certified organic ${query}`;
