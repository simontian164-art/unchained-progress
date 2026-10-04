import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";
import { editImage } from "../_shared/image/gateway.ts";

const Settings = z.object({
  stage: z.union([z.literal(0), z.literal(30), z.literal(60), z.literal(90)]),
  eyebrows: z.boolean(),
  haircut: z.enum(["keep", "clean", "textured", "short"]),
  skin: z.boolean(),
  weightDeltaKg: z.number().min(-18).max(18),
});

const stageCopy = {
  0: "the person exactly as they look today, with no grooming, skin or body changes",
  30: "early, subtle changes after 30 days: a fresh haircut and eyebrow grooming can be visible; skin and body changes remain minimal",
  60: "moderate, realistic changes after 60 days of consistent grooming, skincare, nutrition and training",
  90: "clear but believable changes after 90 days of consistent habits, without exaggeration",
} as const;

const json = (data: unknown, status: number) => new Response(JSON.stringify(data), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI image generation is not configured." }, 500);

  const incoming = await req.formData().catch(() => null);
  if (!incoming) return json({ error: "A source image is required." }, 400);
  const image = incoming.get("image");
  const raw = incoming.get("settings");
  if (!(image instanceof File) || image.size < 1000 || image.size > 8_000_000) return json({ error: "Use a clear image under 8 MB." }, 400);
  if (typeof raw !== "string") return json({ error: "Projection settings are required." }, 400);

  let parsedJson: unknown;
  try { parsedJson = JSON.parse(raw); } catch { return json({ error: "Projection settings are invalid." }, 400); }
  const parsed = Settings.safeParse(parsedJson);
  if (!parsed.success) return json({ error: "Projection settings are invalid." }, 400);
  const s = parsed.data;

  const changes = s.stage === 0 ? ["no changes to appearance"] : [
    s.eyebrows ? "neatly groom and subtly define the existing eyebrows; do not change their natural placement" : "leave the eyebrows unchanged",
    s.haircut === "keep" ? "leave the haircut unchanged" : `give a realistic ${s.haircut} haircut suited to the person's existing hairline and hair texture`,
    s.skin ? "show modestly clearer, more even-looking skin while retaining pores, texture, freckles, skin tone and ethnicity" : "leave skin texture and tone unchanged",
    s.weightDeltaKg === 0 ? "leave body composition unchanged" : `show a medically plausible ${Math.abs(s.weightDeltaKg)} kg ${s.weightDeltaKg > 0 ? "gain" : "loss"} progressing only as far as is realistic by this stage`,
  ];
  const prompt = [
    "Create a realistic FULL-BODY, head-to-toe standing portrait of this exact person for a grooming and wellbeing app: the whole body and face visible, front-facing, relaxed natural pose, plain neutral studio background. If the photo only shows the face or upper body, extend it to a plausible full body consistent with their build, wearing simple fitted neutral clothing.",
    stageCopy[s.stage],
    `Requested changes: ${changes.join("; ")}.`,
    "CRITICAL PRESERVATION: Keep exactly the same adult person's identity, facial structure, eyes, nose, lips, ears, hairline, skin tone, ethnicity and expression. Keep clothing if visible.",
    "Do not beautify, reshape the face, whiten or recolor skin, add makeup, change age, or create a different person. Do not add text or labels.",
    "The result is an honest visualization, not an idealized makeover.",
  ].join(" ");

  const outbound = new FormData();
  outbound.append("image", image, image.name || "digital-you.jpg");
  outbound.set("prompt", prompt);
  outbound.set("stream", incoming.get("stream") === "false" ? "false" : "true");

  const upstream = await editImage({
    baseURL: "https://ai.gateway.lovable.dev",
    apiKey,
    model: "openai/gpt-image-2.5-sunburst",
  }, outbound);
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      "Cache-Control": "no-cache",
    },
  });
});
