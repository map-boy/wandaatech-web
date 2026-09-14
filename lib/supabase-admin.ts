import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ===========================================================================
// Service-role Supabase client. SERVER ONLY — never import this from a file
// that carries 'use client'. The service role key bypasses Row Level
// Security, so every caller must have already checked the admin session.
// ===========================================================================

let cached: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null
  if (cached) return cached

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

/**
 * Tables the admin panel is allowed to write through the generic CRUD route.
 *
 * This is an allowlist rather than a denylist on purpose: the route takes a
 * table name from the browser, and without it a crafted request could reach
 * anything in the database — including Supabase's own auth schema.
 */
export const WRITABLE_TABLES = [
  'site_content',
  'site_sections',
  'site_images',
  'team',
  'projects',
  'gallery',
  'articles',
  'ad_slots',
  'admin_settings',
  'competitions',
  'registrations',
  'submissions',
  'contact_messages',
] as const

export type WritableTable = (typeof WRITABLE_TABLES)[number]

export function isWritableTable(name: string): name is WritableTable {
  return (WRITABLE_TABLES as readonly string[]).includes(name)
}

/** The storage bucket that admin image uploads land in. */
export const MEDIA_BUCKET = 'site-media'

/**
 * A lazily-resolved stand-in for the service-role client.
 *
 * Route handlers used to build their client at module scope with `!`
 * assertions, which made `next build` crash on any checkout without env vars —
 * the client is constructed while the module is merely being imported for page
 * data collection. This proxy defers construction to the first property
 * access, i.e. to an actual request, and fails with a clear message instead of
 * "supabaseUrl is required".
 */
export const adminDb: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getAdminClient()
    if (!client) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL must be set for this route to work.',
      )
    }
    return Reflect.get(client as object, prop, receiver)
  },
})
