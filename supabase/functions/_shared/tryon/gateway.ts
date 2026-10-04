import { TryOnError, type TryOnInput } from "./provider.ts";
import { editImage } from "../image/gateway.ts";

// Free try-on through the built-in AI image editor. Runs in one request and returns the finished image.
async function toFile(src: string, name: string): Promise<File> {
  let bytes: Uint8Array; let mime = "image/jpeg";
  if (src.startsWith("data:")) {
    const [head, b64] = src.split(",", 2);
    mime = head.slice(5).split(";")[0] || mime;
    bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } else {
    const r = await fetch(src);
    if (!r.ok) throw new TryOnError("bad_input", "Couldn't load the garment image.");
    mime = r.headers.get("content-type") ?? mime;
    bytes = new Uint8Array(await r.arrayBuffer());
  }
  return new File([bytes], name, { type: mime });
}

export const gatewayModel = "openai/gpt-image-2.5-sunburst";

export async function gatewayTryOn(apiKey: string, input: TryOnInput): Promise<string> {
  const form = new FormData();
  form.append("image[]", await toFile(input.modelImage, "person.jpg"));
  form.append("image[]", await toFile(input.garmentImage, "garment.jpg"));
  form.set("prompt", `Virtual try-on. Image 1 is the person, image 2 is a ${input.category} item. Dress the person in image 1 in the clothing item from image 2, with realistic fit, folds and lighting. Keep the person's face, hair, skin tone, ethnicity, body shape, pose and background exactly the same. Keep their other clothing unless it is replaced by the new item. Do not retouch, beautify or add text.`);
  form.set("stream", "false");
  const res = await editImage({ baseURL: "https://ai.gateway.lovable.dev", apiKey, model: gatewayModel }, form);
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) throw new TryOnError("provider_failed", "AI credits are used up. Add credits to keep trying on looks.");
  if (res.status === 429) throw new TryOnError("provider_failed", "Too many try-ons right now. Wait a moment and try again.");
  const b64 = body?.data?.[0]?.b64_json;
  if (!res.ok || !b64) throw new TryOnError("provider_failed", body?.error?.message ?? body?.message ?? `Try-on failed (${res.status})`);
  return `data:image/png;base64,${b64}`;
}
