import type { SupabaseClient } from "@supabase/supabase-js";

// Accounts are optional: without these env values the app keeps everything on the device.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const isSupabaseConfigured = Boolean(url && key);

let client: Promise<SupabaseClient> | null = null;

/** Loads the Supabase client on demand so device-only users never download it. */
export function getSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) return Promise.reject(new Error("Accounts aren't set up yet."));
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } }),
  );
  return client;
}
