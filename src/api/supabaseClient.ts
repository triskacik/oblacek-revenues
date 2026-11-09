import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase.gen'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Only the public anon / publishable key is ever used here — data access is guarded by RLS.
// Placeholders keep module import safe when env is missing; main.tsx renders a setup notice instead.
export const supabase = createClient<Database>(
  url ?? 'http://localhost:54321',
  anonKey ?? 'missing-anon-key',
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
