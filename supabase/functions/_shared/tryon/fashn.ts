import { TryOnError, type TryOnInput, type TryOnProvider, type TryOnStatus } from "./provider.ts";

// FASHN Try-On Max: https://docs.fashn.ai/api-reference/tryon-max
// POST /v1/run → { id }, GET /v1/status/{id} → { status, output, error }
const BASE = "https://api.fashn.ai/v1";

export class FashnTryOnProvider implements TryOnProvider {
  id = "fashn";
  model = "tryon-max";
  constructor(private key: string, private fetchImpl: typeof fetch = fetch) {}

  async start(input: TryOnInput) {
    const res = await this.fetchImpl(`${BASE}/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model_name: this.model,
        inputs: {
          model_image: input.modelImage,
          product_image: input.garmentImage,
          // Identity guard: clothing changes, the person does not.
          prompt: `Wear this ${input.category} item. Keep the person's face, hair, skin tone, body shape and pose exactly the same. Do not retouch or beautify.`,
          output_format: "jpeg",
          return_base64: true,
        },
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.id) throw new TryOnError("provider_failed", body?.error?.message ?? body?.message ?? `FASHN ${res.status}`);
    return { jobId: String(body.id) };
  }

  async status(jobId: string): Promise<TryOnStatus> {
    const res = await this.fetchImpl(`${BASE}/status/${encodeURIComponent(jobId)}`, { headers: { Authorization: `Bearer ${this.key}` } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new TryOnError("provider_failed", `FASHN ${res.status}`);
    const s = body.status as string;
    if (s === "completed") return { phase: "complete", resultImage: body.output?.[0] };
    if (s === "failed") return { phase: "failed", error: body.error?.message ?? body.error?.name ?? "Try-on failed" };
    if (s === "processing") return { phase: "processing" };
    return { phase: "queued" };
  }
}
