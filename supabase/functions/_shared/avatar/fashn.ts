// FashnAvatarProvider: FASHN "Face to Model" (https://docs.fashn.ai/api-reference/face-to-model).
// Everything below was checked against the FASHN docs on 2026-10-05:
//   auth      Authorization: Bearer <key>                         (api-overview/api-fundamentals)
//   submit    POST https://api.fashn.ai/v1/run
//             { model_name: "face-to-model", inputs: { face_image, aspect_ratio, resolution,
//               generation_mode, seed, num_images, output_format, return_base64 } }  →  { id, error }
//   poll      GET  https://api.fashn.ai/v1/status/{id}
//             status: starting | in_queue | processing | completed | failed
//             output: the docs show both ["…"] and { images: ["…"] }, so both are accepted
//   errors    HTTP: 400 BadRequest, 401 UnauthorizedAccess, 404 NotFound, 429 RateLimitExceeded /
//             ConcurrencyLimitExceeded / OutOfCredits, 500 InternalServerError
//             runtime (status "failed"): ImageLoadError, ContentModerationError, InputValidationError,
//             ThirdPartyError, UnavailableError, PipelineError. Failed predictions use no credits.
//   privacy   base64 in → FASHN deletes its processing copy when the job ends (1-day backstop);
//             return_base64 → the output is kept for 60 minutes instead of 3 days on their CDN.
//             (api-overview/data-retention-privacy). FASHN doesn't train on customer content.
//   inputs    face_image: URL or data URI, ≤ 30 MiB, ≥ 15×15 px. Default seed is 42, so we always
//             send our own seed or "Regenerate" would return the same image.
import type { AvatarGenerationProvider, AvatarJobInput, AvatarJobStatus, ImageBytes } from "./provider.ts";
import { ProviderError } from "./provider.ts";
import type { FailureCode } from "./types.ts";
import { base64ToBytes, bytesToBase64, safeDetail, sniffImage } from "./bytes.ts";

export interface FashnConfig {
  apiKey: string;
  fetch?: typeof fetch;
  baseUrl?: string;
  resolution?: "1k" | "2k" | "4k";
  generationMode?: "fast" | "balanced" | "quality";
}

const MAX_RESULT_BYTES = 15 * 1024 * 1024;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;

/** Runtime error name → neutral failure. Exported for tests. */
export function mapRuntimeError(name: string | undefined): { code: FailureCode; retryable: boolean } {
  switch (name) {
    case "ContentModerationError":
      return { code: "content_blocked", retryable: false };
    case "ImageLoadError":
      return { code: "photo_unusable", retryable: false };
    case "InputValidationError":
      // our parameters were rejected: a GlowMax bug, not the user's photo
      return { code: "provider_unavailable", retryable: false };
    case "ThirdPartyError":
    case "UnavailableError":
    case "PipelineError":
      return { code: "provider_busy", retryable: true };
    default:
      // model-specific errors aren't listed in the docs; face/pose detection problems are about the photo
      if (name && /face|pose|person|detect|landmark/i.test(name)) return { code: "photo_unusable", retryable: false };
      return { code: "unknown", retryable: false };
  }
}

/** HTTP-level error (before a job exists) → neutral failure. Exported for tests. */
export function mapHttpError(status: number, name: string | undefined): { code: FailureCode; retryable: boolean } {
  if (status === 429) {
    if (name === "OutOfCredits") return { code: "provider_unavailable", retryable: false };
    return { code: "provider_busy", retryable: true }; // RateLimitExceeded, ConcurrencyLimitExceeded
  }
  if (status >= 500) return { code: "provider_busy", retryable: true };
  // 400 BadRequest, 401 UnauthorizedAccess, 404 NotFound: our configuration, not the user
  return { code: "provider_unavailable", retryable: false };
}

export class FashnAvatarProvider implements AvatarGenerationProvider {
  readonly id = "fashn";
  readonly model = "face-to-model";
  readonly disclosure = { name: "FASHN", summary: "They delete it after processing and don't use it to train AI." };
  private base: string;
  private f: typeof fetch;

  constructor(private cfg: FashnConfig) {
    this.base = (cfg.baseUrl ?? "https://api.fashn.ai").replace(/\/+$/, "");
    this.f = cfg.fetch ?? fetch;
  }

  private headers() {
    return { Authorization: `Bearer ${this.cfg.apiKey}`, "Content-Type": "application/json" };
  }

  async start(input: AvatarJobInput): Promise<{ jobId: string }> {
    if (input.faceImage.bytes.length > MAX_INPUT_BYTES) throw new ProviderError("photo_unusable", false, "face image over 30 MiB");
    const body = {
      model_name: "face-to-model",
      inputs: {
        face_image: `data:${input.faceImage.mime};base64,${bytesToBase64(input.faceImage.bytes)}`,
        aspect_ratio: "3:4", // matches the portrait frame on the You screen
        resolution: this.cfg.resolution ?? "2k",
        generation_mode: this.cfg.generationMode ?? "balanced",
        seed: input.seed,
        num_images: 1,
        output_format: "jpeg",
        return_base64: true,
        // no prompt: body shape is inferred from the face; clothing is out of scope for now
      },
    };
    let res: Response;
    try {
      res = await this.f(`${this.base}/v1/run`, { method: "POST", headers: this.headers(), body: JSON.stringify(body), signal: AbortSignal.timeout(30_000) });
    } catch (e) {
      throw new ProviderError("provider_busy", true, `run network error: ${safeDetail(e)}`);
    }
    // deno-lint-ignore no-explicit-any
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      const m = mapHttpError(res.status, json?.error);
      throw new ProviderError(m.code, m.retryable, `run HTTP ${res.status} ${safeDetail(json?.error ?? "")}: ${safeDetail(json?.message ?? "")}`, res.status);
    }
    if (json?.error || typeof json?.id !== "string" || !json.id) {
      const name = typeof json?.error === "object" ? json.error?.name : json?.error;
      const m = mapHttpError(400, name);
      throw new ProviderError(m.code, m.retryable, `run returned no id: ${safeDetail(name ?? "")}`);
    }
    return { jobId: json.id };
  }

  async status(jobId: string): Promise<AvatarJobStatus> {
    let res: Response;
    try {
      res = await this.f(`${this.base}/v1/status/${encodeURIComponent(jobId)}`, { headers: this.headers(), signal: AbortSignal.timeout(20_000) });
    } catch (e) {
      throw new ProviderError("provider_busy", true, `status network error: ${safeDetail(e)}`);
    }
    // deno-lint-ignore no-explicit-any
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) return { phase: "failed", rawStatus: "not_found", failure: { code: "unknown", retryable: false, detail: "job not found" } };
      const m = mapHttpError(res.status, json?.error);
      throw new ProviderError(m.code, m.retryable, `status HTTP ${res.status} ${safeDetail(json?.error ?? "")}`, res.status);
    }
    const raw = String(json?.status ?? "");
    switch (raw) {
      case "starting":
      case "in_queue":
        return { phase: "queued", rawStatus: raw };
      case "processing":
        return { phase: "running", rawStatus: raw };
      case "failed": {
        const m = mapRuntimeError(json?.error?.name);
        return { phase: "failed", rawStatus: raw, failure: { ...m, detail: `${json?.error?.name ?? "?"}: ${safeDetail(json?.error?.message ?? "")}` } };
      }
      case "completed": {
        const first = firstOutput(json?.output);
        if (!first) return { phase: "failed", rawStatus: raw, failure: { code: "unknown", retryable: false, detail: "completed without output" } };
        try {
          return { phase: "completed", rawStatus: raw, image: await this.readOutput(first) };
        } catch (e) {
          if (e instanceof ProviderError) return { phase: "failed", rawStatus: raw, failure: { code: e.code, retryable: e.retryable, detail: e.detail } };
          throw e;
        }
      }
      default:
        // unknown status word: treat as still running rather than failing a paid job
        return { phase: "running", rawStatus: raw.slice(0, 40) || "unknown" };
    }
  }

  private async readOutput(out: string): Promise<ImageBytes> {
    if (out.endsWith("_expired")) throw new ProviderError("timed_out", false, "base64 output expired before it was saved");
    let bytes: Uint8Array;
    if (out.startsWith("data:")) {
      const comma = out.indexOf(",");
      if (comma < 0 || !out.slice(0, comma).includes(";base64")) throw new ProviderError("unknown", false, "unexpected data URI");
      bytes = base64ToBytes(out.slice(comma + 1));
    } else if (/^https:\/\//.test(out)) {
      // Only ever fetch from FASHN's own hosts (cdn.fashn.ai / media.fashn.ai).
      const host = new URL(out).hostname;
      if (!(host === "fashn.ai" || host.endsWith(".fashn.ai"))) throw new ProviderError("unknown", false, `output host not allowed: ${host}`);
      let r: Response;
      try {
        r = await this.f(out, { signal: AbortSignal.timeout(30_000) });
      } catch (e) {
        throw new ProviderError("provider_busy", true, `output download failed: ${safeDetail(e)}`);
      }
      if (!r.ok) throw new ProviderError("provider_busy", true, `output download HTTP ${r.status}`);
      const len = Number(r.headers.get("content-length") ?? 0);
      if (len > MAX_RESULT_BYTES) throw new ProviderError("unknown", false, "output too large");
      bytes = new Uint8Array(await r.arrayBuffer());
    } else {
      try {
        bytes = base64ToBytes(out);
      } catch {
        throw new ProviderError("unknown", false, "unreadable output");
      }
    }
    if (bytes.length > MAX_RESULT_BYTES) throw new ProviderError("unknown", false, "output too large");
    const mime = sniffImage(bytes);
    if (!mime) throw new ProviderError("unknown", false, "output is not a JPEG or PNG");
    return { bytes, mime };
  }
}

// deno-lint-ignore no-explicit-any
function firstOutput(output: any): string | null {
  const list = Array.isArray(output) ? output : Array.isArray(output?.images) ? output.images : typeof output === "string" ? [output] : [];
  const first = list[0];
  return typeof first === "string" && first.length > 0 ? first : null;
}
