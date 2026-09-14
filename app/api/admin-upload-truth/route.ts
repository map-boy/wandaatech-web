// app/api/admin-upload-truth/route.ts
// Replaces a competition's ground-truth rows. Uses the service-role key, so
// the admin session is checked first.

import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-session'
import { getAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const adminSupabase = getAdminClient()
  if (!adminSupabase) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' },
      { status: 500 },
    )
  }

  try {
    const { competition_id, rows } = await req.json()

    if (!competition_id || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Missing competition_id or rows' }, { status: 400 })
    }

    const { error: delErr } = await adminSupabase
      .from('ground_truth')
      .delete()
      .eq('competition_id', competition_id)

    if (delErr) {
      return NextResponse.json({ error: `Delete failed: ${delErr.message}` }, { status: 500 })
    }

    const { error: insErr } = await adminSupabase.from('ground_truth').insert(rows)

    if (insErr) {
      return NextResponse.json({ error: `Insert failed: ${insErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, inserted: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
