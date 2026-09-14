import { createClient } from '@supabase/supabase-js'

// The anon client is read-only in practice: Row Level Security grants SELECT
// on public content and nothing else. All writes go through /api/admin/*.
//
// createClient throws if the URL is empty, which breaks `next build` on a
// checkout with no env file. Falling back to a placeholder keeps the build
// working; requests then fail at runtime, which callers already handle.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-not-configured'

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export const supabase = createClient(url, anonKey)
