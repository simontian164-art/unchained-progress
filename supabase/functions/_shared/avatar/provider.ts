// avatarGenerationProvider: the seam between GlowMax and any image-generation vendor.
// The Edge Function only talks to this interface; swapping FASHN for another provider means adding a
// class here and changing AVATAR_PROVIDER, with no change to the function, the database or the UI.
import type { FailureCode, ProviderPhase } from "./types.ts";

export interface ImageBytes {
  bytes: Uint8Array;
  mime: "image/jpeg" | "image/png";
}

export interface AvatarJobInput {
  /** The user's front face photo, read from their private storage. */
  faceImage: { bytes: Uint8Array; mime: string };
  /** Different per attempt, so "Regenerate" gives a different result. */
  seed: number;
}

export interface AvatarJobStatus {
  phase: ProviderPhase;
  /** The provider's own status word, stored for support (e.g. "in_queue"). */
  rawStatus: string;
  /** Present when phase is "completed": the image, already fetched/decoded and verified. */
  image?: ImageBytes;
  /** Present when phase is "failed" (or completed but unusable). */
  failure?: { code: FailureCode; retryable: boolean; detail: string };
}

export interface AvatarGenerationProvider {
  /** Stored as avatar_generations.provider. */
  readonly id: string;
  /** Stored as avatar_generations.provider_model. */
  readonly model: string;
  /**
   * Shown to the user before they consent, so the app never hard-codes who processes the photo.
   * `summary` must match the provider's actual data terms.
   */
  readonly disclosure: { name: string; summary: string };
  start(input: AvatarJobInput): Promise<{ jobId: string }>;
  status(jobId: string): Promise<AvatarJobStatus>;
}

/**
 * Thrown for request-level problems (auth, rate limits, network). `retryable` means "the same call may
 * work later"; the job itself is unaffected. `detail` is for server logs only and must never contain
 * image data or signed URLs.
 */
export class ProviderError extends Error {
  constructor(
    public code: FailureCode,
    public retryable: boolean,
    public detail: string,
    public httpStatus?: number,
  ) {
    super(detail);
    this.name = "ProviderError";
  }
}
