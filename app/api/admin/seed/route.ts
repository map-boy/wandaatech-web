import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminRequest } from '@/lib/admin-session'
import { getAdminClient } from '@/lib/supabase-admin'
import { SITE_CONTENT_DEFAULTS } from '@/lib/site-defaults'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Populates `site_content` with every key the site knows how to render.
 *
 * Existing rows are never touched — this only inserts keys that are missing,
 * so pressing it after a deploy that added new editable fields brings them
 * into the panel without overwriting anything an admin already wrote.
 */
export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getAdminClient()
  if (!db) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' },
      { status: 500 },
    )
  }

  const { data: existing, error: readError } = await db.from('site_content').select('key')
  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 })
  }

  const have = new Set((existing ?? []).map((r: any) => r.key))
  const missing = SITE_CONTENT_DEFAULTS.filter((d) => !have.has(d.key)).map((d, i) => ({
    key: d.key,
    type: d.type,
    value: d.value,
    section: d.section,
    label: d.label,
    sort_order: i,
  }))

  if (missing.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0, message: 'Every content key is already present.' })
  }

  const { error: insertError } = await db.from('site_content').insert(missing)
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  try {
    revalidatePath('/', 'layout')
  } catch {
    // Non-fatal.
  }

  return NextResponse.json({ ok: true, inserted: missing.length })
}
