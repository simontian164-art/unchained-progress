import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { FashnTryOnProvider } from "../_shared/tryon/fashn.ts";
import { TryOnError, type TryOnProvider } from "../_shared/tryon/provider.ts";

// The only place a try-on vendor is called. Keys stay server-side.
function createProvider(): TryOnProvider | null {
  const which = Deno.env.get("TRYON_PROVIDER") ?? "fashn";
  if (which === "fashn") {
    const key = Deno.env.get("FASHN_API_KEY");
    return key ? new FashnTryOnProvider(key) : null;
  }
  return null;
}

const MAX = 8_000_000; // ~6 MB image as base64
const img = z.string().min(10).max(MAX).refine((s) => s.startsWith("data:image/") || s.startsWith("https://"), "Must be an image data URI or https URL");
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), modelImage: img, garmentImage: img, category: z.enum(["tops", "bottoms", "outerwear", "shoes", "accessories"]) }),
  z.object({ action: z.literal("status"), jobId: z.string().min(1).max(200) }),
]);

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "bad_input", details: parsed.error.flatten().fieldErrors }, 400);

  const provider = createProvider();
  if (!provider) return json({ error: "not_configured" }, 503);
  try {
    if (parsed.data.action === "start") {
      const { jobId } = await provider.start(parsed.data);
      return json({ jobId, provider: provider.id, providerModel: provider.model });
    }
    return json(await provider.status(parsed.data.jobId));
  } catch (e) {
    const code = e instanceof TryOnError ? e.code : "provider_failed";
    console.error("try-on error", e);
    return json({ error: code, message: e instanceof Error ? e.message : "Unknown error" }, 502);
  }
});
