import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { setSessionCookie } from '@/lib/admin-session'

export const runtime = 'nodejs'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function POST(req: Request) {
  let password = ''
  try {
    const body = await req.json()
    password = String(body?.password ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD is not configured on the server' },
      { status: 500 },
    )
  }

  if (!safeEqual(password, adminPassword)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  await setSessionCookie()
  return NextResponse.json({ ok: true })
}
