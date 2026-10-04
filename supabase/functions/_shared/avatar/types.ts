// Provider-neutral types for digital model ("primary avatar") generation.
// Runtime-agnostic: no Deno or Node globals, so the same code runs in the Edge Function and in tests.

/** What the provider says about a job, in neutral terms. */
export type ProviderPhase = "queued" | "running" | "completed" | "failed";

/** Why a generation failed. Stored in avatar_generations.failure_code; the UI maps it to guidance. */
export type FailureCode = "photo_unusable" | "content_blocked" | "provider_busy" | "provider_unavailable" | "timed_out" | "unknown";

/** avatar_generations.generation_status */
export type GenerationStatus = "queued" | "processing" | "finalizing" | "ready" | "failed" | "discarded";

/**
 * What the user sees. Each stage is a real backend state, never a timer:
 *   preparing   our function is checking the profile and sending the photo
 *   building    the provider accepted the job and is starting it / it's queued
 *   preserving  the provider is generating
 *   finalizing  the provider finished; we're saving the image to the user's private storage
 */
export type AvatarStage = "preparing" | "building" | "preserving" | "finalizing" | "ready" | "failed" | "discarded";

export interface GenerationRow {
  id: string;
  user_id: string;
  profile_id: string;
  source_image_id: string | null;
  provider: string;
  provider_model: string;
  provider_job_id: string | null;
  provider_status: string | null;
  provider_checked_at: string | null;
  attempts: number;
  seed: number | null;
  generation_status: GenerationStatus;
  failure_code: FailureCode | null;
  result_path: string | null;
  result_mime: string | null;
  approved_by_user: boolean;
  approved_at: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

/** The only shape that leaves the server. No provider job ids, no raw provider errors. */
export interface AvatarView {
  id: string;
  stage: AvatarStage;
  failure?: FailureCode;
  approved: boolean;
  sourceImageId?: string;
  createdAt: string;
  generatedAt?: string;
  /** Short-lived signed URL, only when ready. */
  resultUrl?: string;
}

/** Returned by the `info` action: whether generation is available and who would process the photo. */
export interface AvatarInfo {
  available: boolean;
  processor: { name: string; summary: string } | null;
  dailyLimit: number;
}

export type ApiErrorCode =
  | "bad_request"
  | "consent_required"
  | "no_profile"
  | "no_face_photo"
  | "daily_limit"
  | "not_found"
  | "not_ready"
  | "unavailable";

export type ApiResult =
  | { ok: true; generation: AvatarView | null }
  | { ok: true; info: AvatarInfo }
  | { ok: false; status: number; error: { code: ApiErrorCode; message: string; limit?: number } };
