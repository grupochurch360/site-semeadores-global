import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return supabaseAdmin;
}
