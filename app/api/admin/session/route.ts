import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-session'
import { getAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Lets the panel restore a session after a refresh without re-prompting. */
export async function GET() {
  const authed = await isAdminRequest()
  return NextResponse.json({
    authed,
    // Surfaced in the panel so a misconfigured deployment is obvious
    // instead of failing silently on the first save.
    serviceRoleConfigured: Boolean(getAdminClient()),
  })
}
