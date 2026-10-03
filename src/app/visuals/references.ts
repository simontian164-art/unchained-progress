/**
 * Licensed reference photos. EMPTY on purpose: nothing goes in here unless its licence, model
 * release and source are recorded in docs/ASSET_SOURCES.md. Keys:
 *   haircut:<cutId>[:<hairType>]   e.g. "haircut:crop:curly"
 *   style:<nicheId>:<n>            e.g. "style:old-money:1"
 * Files live in /public/assets/photos/<area>/ and are served at /assets/photos/...
 */
export interface RefImage {
  src: string; // e.g. "/assets/photos/hair/crop-curly-1.webp" (serve 480w and 960w: src + srcSet)
  srcSet?: string;
  alt: string;
  credit: string; // shown under the image
  license: string; // e.g. "Commissioned, model release on file (2026-10)"
  /** Must be false for any photo of a real person unless a release allows showing them as a "customer". */
  showsCustomer: false;
}

export const REFERENCE_IMAGES: Record<string, RefImage[]> = {};

export const referencesFor = (key: string, fallbackKey?: string): RefImage[] =>
  REFERENCE_IMAGES[key] ?? (fallbackKey ? REFERENCE_IMAGES[fallbackKey] : undefined) ?? [];
