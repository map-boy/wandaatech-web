// app/api/admin-auth/route.ts
// ============================================================
// VAF UBWENGE TECH -- Admin Password Verification
// Password is stored in ADMIN_PASSWORD env variable
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}