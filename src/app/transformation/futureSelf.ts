import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

export type ProjectionStage = 0 | 30 | 60 | 90;
export type HaircutChoice = "keep" | "clean" | "textured" | "short";
export interface ProjectionSettings {
  eyebrows: boolean;
  haircut: HaircutChoice;
  skin: boolean;
  weightDeltaKg: number;
}
export interface ProjectionRecord {
  stage: Exclude<ProjectionStage, 0>;
  settings: ProjectionSettings;
  image: string;
  generatedAt: string;
}

type ImagePayload = { type?: string; b64_json?: string; error?: { message?: string } };
const STORE_KEY = "glowmax_future_self_v1";

export function loadProjections(): ProjectionRecord[] {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as ProjectionRecord[]; }
  catch { return []; }
}
export function saveProjection(record: ProjectionRecord) {
  const others = loadProjections().filter((x) => x.stage !== record.stage);
  try { localStorage.setItem(STORE_KEY, JSON.stringify([record, ...others])); } catch { /* result remains visible this session */ }
}

async function sourceFile(src: string) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  const scale = Math.min(1, 1536 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the photo.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const dataUri = canvas.toDataURL("image/jpeg", 0.9);
  const blob = await (await fetch(dataUri)).blob();
  return new File([blob], "digital-you.jpg", { type: "image/jpeg" });
}

function endpoint() {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) throw new Error("Future projections are not available in this preview.");
  return `${base}/functions/v1/future-self`;
}

export async function generateProjection(
  source: string,
  stage: Exclude<ProjectionStage, 0>,
  settings: ProjectionSettings,
  onFrame: (src: string, final: boolean) => void,
) {
  const input = new FormData();
  input.append("image", await sourceFile(source));
  input.set("settings", JSON.stringify({ ...settings, stage }));
  const headers = new Headers();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (key) headers.set("apikey", key);

  const send = async (stream: boolean) => {
    const form = new FormData();
    input.forEach((value, name) => form.append(name, value));
    form.set("stream", String(stream));
    return fetch(endpoint(), { method: "POST", headers, body: form });
  };

  const response = await send(true);
  if (!response.ok || !response.body) {
    const detail = await response.json().catch(() => ({})) as { error?: string; message?: string };
    throw new Error(detail.message ?? detail.error ?? "The projection could not be generated.");
  }

  let sawAny = false;
  let completed = false;
  let failure: string | undefined;
  const parser = createParser({ onEvent(event) {
    let payload: ImagePayload | undefined;
    try { payload = JSON.parse(event.data) as ImagePayload; } catch { payload = undefined; }
    if (event.event === "error" || payload?.type === "error") {
      sawAny = true;
      failure = payload?.error?.message ?? "The projection could not be generated.";
      return;
    }
    const type = event.event || payload?.type;
    if (!["image_edit.partial_image", "image_edit.completed", "image_generation.partial_image", "image_generation.completed"].includes(type ?? "")) return;
    sawAny = true;
    if (!payload?.b64_json) { failure = "The image service returned an empty result."; return; }
    const final = type?.endsWith(".completed") ?? false;
    flushSync(() => onFrame(`data:image/png;base64,${payload?.b64_json}`, final));
    if (final) completed = true;
  }});
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      const chunk = await reader.read().catch((error) => { if (sawAny) throw error; return { done: true, value: undefined }; });
      if (chunk.done) break;
      parser.feed(chunk.value);
    }
  } finally { await reader.cancel().catch(() => undefined); }
  if (failure) throw new Error(failure);
  if (!sawAny) {
    const fallback = await send(false);
    const json = await fallback.json().catch(() => ({})) as { data?: { b64_json?: string }[]; error?: { message?: string } };
    if (!fallback.ok || !json.data?.[0]?.b64_json) throw new Error(json.error?.message ?? "The projection could not be generated.");
    onFrame(`data:image/png;base64,${json.data[0].b64_json}`, true);
    return;
  }
  if (!completed) throw new Error("The projection stopped before it finished. Please try again.");
}
