// app/api/auth/set-password/route.ts
// Lets someone who still has their original `vaf_token` (in localStorage)
// set or change their password. Covers rows created before password auth
// existed, and doubles as a simple "change password" endpoint.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing access token.' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const { data: reg } = await supabase
      .from('registrations')
      .select('id')
      .eq('token', token)
      .maybeSingle()

    if (!reg) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ password_hash: passwordHash })
      .eq('id', reg.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}