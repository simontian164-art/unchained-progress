import { supabase } from "@/integrations/supabase/client";

// Accounts/photo storage tables aren't set up yet, so keep data on-device.
export const isSupabaseConfigured = false;
export async function getSupabase() {
  return supabase;
}
