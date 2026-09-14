import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { isAdminRequest } from '@/lib/admin-session'
import { getAdminClient, MEDIA_BUCKET } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

/**
 * Image upload for the admin panel.
 *
 * Uploads land in the public `site-media` bucket and the returned URL can be
 * pasted into any image field — team photos, project covers, gallery items,
 * hero backgrounds. Type and size are checked server-side, because the file
 * picker's `accept` attribute is only a suggestion.
 */
export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getAdminClient()
  if (!db) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' },
      { status: 500 },
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const extension = ALLOWED_TYPES[file.type]
  if (!extension) {
    return NextResponse.json(
      { error: `Unsupported file type "${file.type}". Use JPG, PNG, WebP, AVIF, GIF or SVG.` },
      { status: 400 },
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB.` },
      { status: 400 },
    )
  }

  const folder = String(form.get('folder') ?? 'uploads').replace(/[^a-z0-9-]/gi, '') || 'uploads'
  const label = String(form.get('key') ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  const path = `${folder}/${Date.now()}-${randomBytes(4).toString('hex')}${label ? `-${label}` : ''}.${extension}`

  const bytes = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await db.storage
    .from(MEDIA_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json(
      {
        error: `Upload failed: ${uploadError.message}. Check that the "${MEDIA_BUCKET}" storage bucket exists and is public.`,
      },
      { status: 500 },
    )
  }

  const { data: pub } = db.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  const publicUrl = pub?.publicUrl ?? ''

  // Keep a catalogue row so uploads are browsable and reusable in the panel.
  await db.from('site_images').insert({
    key: label || folder,
    storage_path: path,
    public_url: publicUrl,
    alt_text: String(form.get('alt') ?? ''),
  })

  try {
    revalidatePath('/', 'layout')
  } catch {
    // Non-fatal: the timed revalidate window still picks the change up.
  }

  return NextResponse.json({ ok: true, url: publicUrl, path })
}
