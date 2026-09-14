import { createHmac, timingSafeEqual, randomBytes } from 'crypto'
import { cookies } from 'next/headers'

// ===========================================================================
// Admin session.
//
// Previously the panel authenticated purely in the browser: /api/admin-auth
// returned ok and React flipped a boolean. Anyone could set that boolean, and
// every write went straight from the browser to Supabase with the anon key.
// Now the password buys a signed, httpOnly cookie, and every write goes
// through a server route that checks it.
// ===========================================================================

export const ADMIN_COOKIE = 'vaf_admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

function signingSecret(): string {
  // ADMIN_SESSION_SECRET is preferred; falling back to the password means an
  // existing deployment keeps working with no new env var, and rotating the
  // password invalidates every outstanding session.
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    ''
  )
}

function sign(payload: string): string {
  return createHmac('sha256', signingSecret()).update(payload).digest('hex')
}

/** `<issuedAt>.<nonce>.<hmac>` — stateless, so no session table is needed. */
export function createSessionToken(): string {
  const payload = `${Date.now()}.${randomBytes(12).toString('hex')}`
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !signingSecret()) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [issuedAt, nonce, mac] = parts
  const expected = sign(`${issuedAt}.${nonce}`)

  // Compare in constant time so a wrong token cannot be brute-forced byte by byte.
  const a = Buffer.from(mac, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  const age = Date.now() - Number(issuedAt)
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_SECONDS * 1000
}

export async function setSessionCookie() {
  const store = await cookies()
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

/** True when the current request carries a valid admin session. */
export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies()
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value)
}
