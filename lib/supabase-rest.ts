// ===========================================================================
// Read-only Supabase REST helper for React Server Components.
//
// Why not supabase-js here? Server components need Next's fetch cache so a
// page render does not hit the database on every request. Going through
// fetch() directly lets us pass `next: { revalidate }` and, just as
// importantly, fail soft: if the env vars are missing (local checkout, CI
// build) or the network is down, callers get null and fall back to the
// bundled defaults instead of crashing the page.
// ===========================================================================

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY_ = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(URL_ && KEY_)

/** Seconds before a cached read is refetched. Content edits appear within this window. */
export const CONTENT_REVALIDATE = 60

export async function restSelect<T = any>(
  table: string,
  query = 'select=*',
  revalidate: number = CONTENT_REVALIDATE,
): Promise<T[] | null> {
  if (!URL_ || !KEY_) return null

  try {
    const res = await fetch(`${URL_}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: KEY_,
        Authorization: `Bearer ${KEY_}`,
        Accept: 'application/json',
      },
      next: { revalidate },
    })
    if (!res.ok) return null
    return (await res.json()) as T[]
  } catch {
    // Network failure, DNS, timeout — the caller falls back to defaults.
    return null
  }
}
