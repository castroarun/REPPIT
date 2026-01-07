import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if credentials are available
let supabaseClient: SupabaseClient<Database> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
} else if (typeof window !== 'undefined') {
  console.warn('Supabase credentials not configured. Running in offline-only mode.')
}

// Export a proxy that handles null client gracefully
export const supabase = supabaseClient as SupabaseClient<Database>

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return supabaseClient !== null
}
