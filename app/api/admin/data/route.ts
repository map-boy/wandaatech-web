import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminRequest } from '@/lib/admin-session'
import { getAdminClient, isWritableTable } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Op = 'select' | 'insert' | 'update' | 'delete' | 'upsert'

/**
 * Public pages cache their Supabase reads, so a save would otherwise take up
 * to a minute to appear. Purging the route cache makes every edit show up on
 * the next page load instead.
 */
function refreshPublicSite() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // revalidatePath is unavailable in some runtimes; the timed revalidate
    // window still picks the change up.
  }
}

/**
 * One write endpoint for the whole admin panel.
 *
 * The browser never talks to Supabase directly any more: it posts
 * { table, op, payload } here, this route checks the admin session, validates
 * the table against an allowlist, and performs the work with the service-role
 * key. That keeps the anon key read-only in public and means Row Level
 * Security can stay locked down.
 */
export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const table = String(body?.table ?? '')
  const op = String(body?.op ?? '') as Op

  // Validate the target before touching the database, so a request for a
  // table outside the allowlist is rejected on its own terms rather than
  // masked by an unrelated configuration error.
  if (!isWritableTable(table)) {
    return NextResponse.json({ error: `Table "${table}" is not writable` }, { status: 400 })
  }

  const db = getAdminClient()
  if (!db) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' },
      { status: 500 },
    )
  }

  try {
    switch (op) {
      case 'select': {
        let q = db.from(table).select(body.columns ?? '*')
        if (body.order) {
          q = q.order(body.order.column, { ascending: body.order.ascending !== false })
        }
        if (body.limit) q = q.limit(Number(body.limit))
        const { data, error } = await q
        if (error) throw error
        return NextResponse.json({ ok: true, data })
      }

      case 'insert': {
        const { data, error } = await db.from(table).insert(body.payload).select()
        if (error) throw error
        refreshPublicSite()
        return NextResponse.json({ ok: true, data })
      }

      case 'update': {
        if (!body.id) {
          return NextResponse.json({ error: 'id is required for update' }, { status: 400 })
        }
        const { data, error } = await db
          .from(table)
          .update(body.payload)
          .eq('id', body.id)
          .select()
        if (error) throw error
        refreshPublicSite()
        return NextResponse.json({ ok: true, data })
      }

      case 'upsert': {
        const { data, error } = await db
          .from(table)
          .upsert(body.payload, { onConflict: body.onConflict ?? 'id' })
          .select()
        if (error) throw error
        refreshPublicSite()
        return NextResponse.json({ ok: true, data })
      }

      case 'delete': {
        if (!body.id) {
          return NextResponse.json({ error: 'id is required for delete' }, { status: 400 })
        }
        const { error } = await db.from(table).delete().eq('id', body.id)
        if (error) throw error
        refreshPublicSite()
        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: `Unknown op "${op}"` }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Database error' }, { status: 500 })
  }
}
