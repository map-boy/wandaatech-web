// app/api/ping/route.ts
import { adminDb as supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'


export async function GET() {
  const { error } = await supabase
    .from('competitions')
    .select('id')
    .limit(1)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() })
}