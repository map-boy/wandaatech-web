import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_MESSAGE = 5000

// A small in-memory throttle. It resets on redeploy and is per-instance, so
// it is a speed bump for casual spam rather than real rate limiting — but it
// costs nothing and stops a form being hammered from one browser.
const recent = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 3

function throttled(ip: string): boolean {
  const now = Date.now()
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  recent.set(ip, hits)
  return hits.length > MAX_PER_WINDOW
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Honeypot: a hidden field real people never fill in.
  if (String(body?.website ?? '').trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const subject = String(body?.subject ?? '').trim()
  const message = String(body?.message ?? '').trim()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: 'That message is too long.' }, { status: 400 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (throttled(ip)) {
    return NextResponse.json(
      { error: 'Too many messages from this connection. Try again in a minute.' },
      { status: 429 },
    )
  }

  const db = getAdminClient()
  if (!db) {
    return NextResponse.json(
      { error: 'The contact form is not configured yet. Please email us directly.' },
      { status: 503 },
    )
  }

  const { error } = await db.from('contact_messages').insert({
    name: name.slice(0, 200),
    email: email.slice(0, 320),
    subject: subject.slice(0, 300),
    message,
  })

  if (error) {
    return NextResponse.json({ error: 'We could not save your message. Please email us instead.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
