// app/api/admin-upload-truth/route.ts
// Uses the SERVICE ROLE key → bypasses RLS → can write to ground_truth

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // ← service role, not anon
)

export async function POST(req: Request) {
  try {
    const { competition_id, rows } = await req.json()

    if (!competition_id || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Missing competition_id or rows' }, { status: 400 })
    }

    // Delete old truth rows for this competition
    const { error: delErr } = await adminSupabase
      .from('ground_truth')
      .delete()
      .eq('competition_id', competition_id)

    if (delErr) {
      return NextResponse.json({ error: `Delete failed: ${delErr.message}` }, { status: 500 })
    }

    // Insert fresh rows
    const { error: insErr } = await adminSupabase
      .from('ground_truth')
      .insert(rows)

    if (insErr) {
      return NextResponse.json({ error: `Insert failed: ${insErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, inserted: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}