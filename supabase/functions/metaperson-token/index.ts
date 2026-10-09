// metaperson-token: gives the /digital-twin-test page a MetaPerson access token for the creator iframe.
// The client secret stays in server secrets; the browser only ever sees the time-limited token.
//
// Secrets (Lovable Cloud → Secrets, or `supabase secrets set`):
//   METAPERSON_CLIENT_ID, METAPERSON_CLIENT_SECRET   from accounts.avatarsdk.com → Developer → Web API
//   TWIN_TEST_PASSCODE                               12+ characters; only people who know it get a token
//
// supabase/config.toml sets verify_jwt = false for this function: callers without an account send the
// passcode instead of a user JWT. Who gets a token is decided in ../_shared/metaperson/handler.ts.
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleTokenRequest } from "../_shared/metaperson/handler.ts";
import { createTokenProvider } from "../_shared/metaperson/token.ts";

const clientId = Deno.env.get("METAPERSON_CLIENT_ID");
const clientSecret = Deno.env.get("METAPERSON_CLIENT_SECRET");
const tokens = createTokenProvider({ clientId, clientSecret });

const url = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
const auth = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } }).auth : null;

const log = (event: string, fields: Record<string, unknown> = {}) =>
  console.log(JSON.stringify({ fn: "metaperson-token", event, ...fields }));

Deno.serve((req) =>
  handleTokenRequest(req, {
    configured: Boolean(clientId && clientSecret),
    tokens,
    passcode: Deno.env.get("TWIN_TEST_PASSCODE") ?? undefined,
    verifyUser: async (jwt) => {
      if (!auth) return null;
      const { data, error } = await auth.getUser(jwt);
      const user = data?.user;
      return !error && user && !user.is_anonymous ? { id: user.id } : null;
    },
    log,
  }),
);
