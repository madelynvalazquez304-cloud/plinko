// Supabase client for the app.
// Uses Vite environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// If those are not provided (e.g. in a preview/dev environment before setup),
// a lightweight mock is exported so the app can still render without crashing.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;

if (url && anonKey) {
  supabase = createClient(url, anonKey);
}

export { supabase };

export const mockSupabase = {
  auth: {
    signIn: async () => ({ data: { user: { id: '1' } }, error: null }),
    signOut: async () => ({ data: null, error: null }),
  },
  from: (table: string) => ({
    select: async () => ({ data: [], error: null }),
    insert: async (rows: any) => ({ data: rows, error: null }),
  })
};

// Export a small helper that returns the real client when available, otherwise the mock.
export function getSupabase() {
  if (!supabase) {
    console.warn('⚠️ USING MOCK SUPABASE CLIENT. Database and Edge Functions will NOT work.');
    console.warn('Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  }
  return supabase ?? (mockSupabase as unknown as SupabaseClient);
}
