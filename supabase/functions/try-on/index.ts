import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { TryOnError } from "../_shared/tryon/provider.ts";
import { gatewayModel, gatewayTryOn } from "../_shared/tryon/gateway.ts";

// The only place try-on images are generated. Uses the built-in AI image editor; no third-party key.
const MAX = 8_000_000;
const img = z.string().min(10).max(MAX).refine((s) => s.startsWith("data:image/") || s.startsWith("https://"), "Must be an image data URI or https URL");
const Body = z.object({ action: z.literal("start"), modelImage: img, garmentImage: img, category: z.enum(["tops", "bottoms", "outerwear", "shoes", "accessories"]) });

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "bad_input", details: parsed.error.flatten().fieldErrors }, 400);
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "not_configured" }, 503);
  try {
    const resultImage = await gatewayTryOn(key, parsed.data);
    return json({ jobId: crypto.randomUUID(), provider: "lovable-ai", providerModel: gatewayModel, resultImage });
  } catch (e) {
    console.error("try-on error", e);
    return json({ error: e instanceof TryOnError ? e.code : "provider_failed", message: e instanceof Error ? e.message : "Unknown error" }, 502);
  }
});
