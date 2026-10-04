import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. Only the PUBLISHABLE key belongs here: it's safe in the browser because
 * every table and the storage bucket are protected by Row Level Security. Secret / service-role keys
 * live only in Edge Functions (Deno.env), never in this app.
 *
 * Set in Lovable (or a local .env):
 *   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
 *   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
 * Until both are set the app runs in on-device mode, never contacts Supabase, and never downloads
 * the Supabase library (it's loaded on demand).
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && key);

let client: Promise<SupabaseClient> | null = null;
export function getSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) return Promise.reject(new Error("Supabase isn't configured."));
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }),
  );
  return client;
}
