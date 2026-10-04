import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Mints a short-lived MetaPerson access token so the browser never sees CLIENT_ID/SECRET.
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const id = Deno.env.get("METAPERSON_CLIENT_ID");
  const secret = Deno.env.get("METAPERSON_CLIENT_SECRET");
  if (!id || !secret) return json({ error: "not_configured" }, 503);

  const form = new FormData();
  form.set("grant_type", "client_credentials");
  const res = await fetch("https://api.avatarsdk.com/o/token/", {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${id}:${secret}`)}` },
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    console.error("metaperson token", res.status, body);
    return json({ error: "auth_failed", message: `MetaPerson rejected the credentials (${res.status}).` }, 502);
  }
  return json({ accessToken: body.access_token, expiresIn: body.expires_in });
});
