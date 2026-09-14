'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, X, ImageIcon } from 'lucide-react'
import { adminApi } from '@/lib/admin-api'

interface ImageFieldProps {
  label?: string
  value: string
  onChange: (url: string) => void
  /** Storage sub-folder, e.g. "team" or "gallery". */
  folder?: string
  hint?: string
}

/**
 * An image input that accepts either an upload or a pasted URL.
 *
 * Uploading is the point: before this, every image in the panel had to be a
 * URL the admin had already hosted somewhere else, which is why team photos
 * could not actually be changed from the panel.
 */
export function ImageField({
  label = 'Image',
  value,
  onChange,
  folder = 'uploads',
  hint,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setError('')

    const res = await adminApi.upload(file, { folder })
    setUploading(false)

    if (res.error || !res.data?.url) {
      setError(res.error ?? 'Upload failed')
      return
    }
    onChange(res.data.url)
  }

  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        {label}
      </label>

      <div className="flex items-start gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
          {value ? (
            // A plain <img>: the URL can point anywhere, including hosts that
            // are not in next.config's image allowlist.
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-700">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Remove image"
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-neutral-300 hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…  or upload a file →"
            className="w-full rounded-xl border border-neutral-800 bg-black/60 px-3 py-2.5 text-xs text-neutral-200 outline-none placeholder:text-neutral-600"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:text-[hsl(var(--skeuo-accent))] disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" /> Upload image
                </>
              )}
            </button>

            {hint && <span className="text-[10px] text-neutral-600">{hint}</span>}
          </div>

          {error && <p className="font-mono text-[10px] text-red-400">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          // Allow re-selecting the same file after a failed upload.
          e.target.value = ''
        }}
      />
    </div>
  )
}
