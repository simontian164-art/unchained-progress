import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const Body = z.object({ image: z.string().startsWith("data:image/").max(8_000_000) });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const PROMPT = `You are a kind, practical grooming coach. Look at this face photo and assess ONLY visible grooming details: hair/haircut, eyebrows, facial hair, skin care (clarity, dryness, shine — never skin colour), lips, and overall photo presentation.
Never rate attractiveness, never comment on ethnicity, skin tone, bone structure or body size. If no face is clearly visible, return an empty tips array and explain in "summary".
Reply with ONLY JSON: {"summary": string (1-2 sentences), "tips": [{"area": string, "observation": string, "action": string, "priority": "high"|"medium"|"low"}]} with 4-6 tips.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "AI is not configured." }, 500);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Send a clear photo under 6 MB." }, 400);

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      input: [{ role: "user", content: [{ type: "input_text", text: PROMPT }, { type: "input_image", image_url: parsed.data.image }] }],
    }),
  });
  if (!upstream.ok || !upstream.body) {
    const t = await upstream.text().catch(() => "");
    console.error("face-tips upstream", upstream.status, t);
    const msg = upstream.status === 402 ? "AI credits are used up. Add credits in Settings → Plans & credits." : upstream.status === 429 ? "Too many scans right now — try again in a minute." : "The AI could not analyse this photo.";
    return json({ error: msg }, upstream.status);
  }

  let text = "", buf = "";
  const reader = upstream.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    const lines = buf.split("\n"); buf = lines.pop() ?? "";
    for (const l of lines) {
      if (!l.startsWith("data:")) continue;
      try {
        const e = JSON.parse(l.slice(5).trim());
        if (e.type === "response.output_text.delta") text += e.delta;
        if (e.type === "response.failed" || e.type === "error") return json({ error: "The AI could not analyse this photo." }, 502);
      } catch { /* ignore */ }
    }
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return json({ error: "The AI declined to analyse this photo. Try a clearer, front-facing photo." }, 422);
  try { return json(JSON.parse(match[0])); } catch { return json({ error: "Unexpected AI reply. Try again." }, 502); }
});
