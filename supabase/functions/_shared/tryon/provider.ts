// Provider seam for virtual try-on. The app never talks to a vendor directly; swap vendors here.
export type TryOnCategory = "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";
export type TryOnPhase = "queued" | "processing" | "complete" | "failed";

export interface TryOnInput {
  modelImage: string; // data URI or https URL
  garmentImage: string; // data URI or https URL
  category: TryOnCategory;
}
export interface TryOnStatus {
  phase: TryOnPhase;
  resultImage?: string;
  error?: string;
}
export interface TryOnProvider {
  id: string;
  model: string;
  start(input: TryOnInput): Promise<{ jobId: string }>;
  status(jobId: string): Promise<TryOnStatus>;
}
export class TryOnError extends Error {
  constructor(public code: "not_configured" | "bad_input" | "provider_failed", message: string) {
    super(message);
  }
}
