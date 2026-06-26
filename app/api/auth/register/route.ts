// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateToken(): string {
  return Math.random().toString(36).substring(2) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2)
}

export async function POST(req: NextRequest) {
  try {
    const { type, displayName, email, password, university, members, competitionId } = await req.json()

    if (!type || !displayName || !email || !password || !university) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }
    if (type === 'team') {
      const filled = (members || []).filter((m: string) => m.trim().length > 0)
      if (filled.length < 2) {
        return NextResponse.json({ error: 'A team must have at least 2 members.' }, { status: 400 })
      }
    }

    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This email is already registered. Please log in.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const token        = generateToken()
    const teamToken    = type === 'team' ? generateToken() : null
    const teamName     = type === 'team' ? displayName.trim() : null

    const { error: insertError } = await supabase
      .from('registrations')
      .insert({
        type,
        display_name:   displayName.trim(),
        username:       displayName.trim(),
        email:          email.trim().toLowerCase(),
        password_hash:  passwordHash,
        token,
        team_token:     teamToken,
        team_name:      teamName,
        university:     university.trim(),
        members:        type === 'team' ? (members || []).filter((m: string) => m.trim()) : [],
        competition_id: competitionId || null,
      })

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
      token,
      displayName: displayName.trim(),
      type,
      teamName,
      teamToken,
    })

  } catch (err: any) {
    console.error('Register route error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}