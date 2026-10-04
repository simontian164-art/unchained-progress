/**
 * avatarClient: how the UI asks for a digital model. The UI never knows which AI provider is used.
 *
 *   SupabaseAvatarClient → `digital-model` Edge Function → avatarGenerationProvider (FASHN today)
 *   DemoAvatarClient     → preview builds only (VITE_AVATAR_DEMO=1): a clearly labelled stand-in,
 *                          no AI, nothing leaves the device
 *
 * Stages and failure codes mirror supabase/functions/_shared/avatar/types.ts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type AvatarStage = "preparing" | "building" | "preserving" | "finalizing" | "ready" | "failed" | "discarded";
export type AvatarFailure = "photo_unusable" | "content_blocked" | "provider_busy" | "provider_unavailable" | "timed_out" | "unknown";

export interface AvatarGeneration {
  id: string;
  stage: AvatarStage;
  failure?: AvatarFailure;
  approved: boolean;
  sourceImageId?: string;
  createdAt: string;
  generatedAt?: string;
  resultUrl?: string;
}

export type AvatarErrorCode = "consent_required" | "no_profile" | "no_face_photo" | "daily_limit" | "not_found" | "not_ready" | "unavailable" | "offline" | "signed_out" | "bad_request";

export class AvatarRequestError extends Error {
  constructor(public code: AvatarErrorCode, message: string, public limit?: number) {
    super(message);
    this.name = "AvatarRequestError";
  }
}

/** Who would process the photo, from the server, so the UI never hard-codes a provider. */
export interface AvatarInfo {
  available: boolean;
  processor: { name: string; summary: string } | null;
  dailyLimit: number;
}

export interface AvatarClient {
  readonly kind: "server" | "demo";
  info(): Promise<AvatarInfo>;
  start(opts: { consent: true }): Promise<AvatarGeneration>;
  /** The given generation, or the latest one if no id. */
  status(id?: string): Promise<AvatarGeneration | null>;
  approve(id: string): Promise<AvatarGeneration>;
  discard(id: string): Promise<void>;
}

export const ACTIVE_STAGES: AvatarStage[] = ["preparing", "building", "preserving", "finalizing"];
export const isWorking = (g: AvatarGeneration | null | undefined) => !!g && ACTIVE_STAGES.includes(g.stage);

/** The four statuses the user sees, in order. Each maps to a real backend state (see types.ts on the server). */
export const STAGE_STEPS: { stage: AvatarStage; label: string }[] = [
  { stage: "preparing", label: "Preparing profile" },
  { stage: "building", label: "Building model" },
  { stage: "preserving", label: "Preserving identity" },
  { stage: "finalizing", label: "Finalizing" },
];

/** What to tell the user when a generation fails. Never the provider's raw message. */
export const FAILURE_COPY: Record<AvatarFailure, { title: string; body: string; tips?: boolean; retry: boolean; changePhoto: boolean }> = {
  photo_unusable: { title: "We couldn't build a clean model from this photo.", body: "Try a photo with:", tips: true, retry: true, changePhoto: true },
  unknown: { title: "We couldn't build a clean model this time.", body: "Try again. If it happens again, use a photo with:", tips: true, retry: true, changePhoto: true },
  content_blocked: { title: "This photo couldn't be used.", body: "Use an everyday headshot of just you, facing the camera.", retry: false, changePhoto: true },
  provider_busy: { title: "Our image service is busy right now.", body: "Try again in a minute.", retry: true, changePhoto: false },
  timed_out: { title: "This took too long and was stopped.", body: "Try again. It usually takes under a minute.", retry: true, changePhoto: false },
  provider_unavailable: { title: "Model generation isn't available right now.", body: "This is on our side, not your photo. Try again later.", retry: false, changePhoto: false },
};
export const PHOTO_TIPS = ["Your full face visible", "Even, neutral lighting", "No sunglasses", "Nothing covering your face, like hair, hands or a mask"];

// ─── server ───────────────────────────────────────────────────────────────
const FN = "digital-model";

export class SupabaseAvatarClient implements AvatarClient {
  readonly kind = "server" as const;
  constructor(private sb: Pick<SupabaseClient, "functions">) {}

  private async call<T>(body: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.sb.functions.invoke(FN, { body });
    if (!error) return data as T;
    // FunctionsHttpError carries the Response; the function only ever returns { error: { code, message } }
    if (error.name === "FunctionsHttpError" && error.context && typeof error.context.json === "function") {
      const payload = await error.context.json().catch(() => null);
      const status: number = error.context.status ?? 0;
      const e = payload?.error;
      if (status === 401) throw new AvatarRequestError("signed_out", "Sign in again to continue.");
      if (e?.code) throw new AvatarRequestError(e.code, String(e.message ?? "Something went wrong."), e.limit);
      throw new AvatarRequestError("unavailable", "Something went wrong on our side. Try again in a moment.");
    }
    if (error.name === "FunctionsFetchError") throw new AvatarRequestError("offline", "You're offline or the connection dropped. Check it and try again.");
    throw new AvatarRequestError("unavailable", "Model generation isn't available right now. Try again later.");
  }

  async info() {
    return (await this.call<{ info: AvatarInfo }>({ action: "info" })).info;
  }
  async start(opts: { consent: true }) {
    return (await this.call<{ generation: AvatarGeneration }>({ action: "start", consent: opts.consent })).generation;
  }
  async status(id?: string) {
    return (await this.call<{ generation: AvatarGeneration | null }>({ action: "status", ...(id ? { id } : {}) })).generation;
  }
  async approve(id: string) {
    return (await this.call<{ generation: AvatarGeneration }>({ action: "approve", id })).generation;
  }
  async discard(id: string) {
    await this.call({ action: "discard", id });
  }
}
