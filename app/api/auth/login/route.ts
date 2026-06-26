// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const { data: reg } = await supabase
      .from('registrations')
      .select('display_name, type, team_name, token, team_token, password_hash')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (!reg || !reg.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, reg.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    return NextResponse.json({
      token: reg.token,
      teamToken: reg.team_token,
      displayName: reg.display_name,
      type: reg.type,
      teamName: reg.team_name,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}