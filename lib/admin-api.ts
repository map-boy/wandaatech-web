'use client'

// ===========================================================================
// Client-side wrapper around the /api/admin/* routes.
//
// The panel no longer writes to Supabase directly — the anon key has no write
// permission any more. Everything goes through these calls, which carry the
// admin session cookie and are executed server-side with the service role.
// ===========================================================================

export interface AdminResult<T = any> {
  data?: T
  error?: string
}

async function post<T = any>(url: string, body?: unknown): Promise<AdminResult<T>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { error: json?.error ?? `Request failed (${res.status})` }
    return { data: json?.data ?? json }
  } catch (e: any) {
    return { error: e?.message ?? 'Network error' }
  }
}

export const adminApi = {
  login: (password: string) => post('/api/admin/login', { password }),

  logout: () => post('/api/admin/logout'),

  async session(): Promise<{ authed: boolean; serviceRoleConfigured: boolean }> {
    try {
      const res = await fetch('/api/admin/session', { cache: 'no-store' })
      if (!res.ok) return { authed: false, serviceRoleConfigured: false }
      return await res.json()
    } catch {
      return { authed: false, serviceRoleConfigured: false }
    }
  },

  insert: (table: string, payload: Record<string, any> | Record<string, any>[]) =>
    post(`/api/admin/data`, { table, op: 'insert', payload }),

  update: (table: string, id: string, payload: Record<string, any>) =>
    post(`/api/admin/data`, { table, op: 'update', id, payload }),

  upsert: (table: string, payload: Record<string, any>, onConflict = 'id') =>
    post(`/api/admin/data`, { table, op: 'upsert', payload, onConflict }),

  remove: (table: string, id: string) => post(`/api/admin/data`, { table, op: 'delete', id }),

  select: (table: string, options: { columns?: string; order?: { column: string; ascending?: boolean }; limit?: number } = {}) =>
    post(`/api/admin/data`, { table, op: 'select', ...options }),

  /** Inserts any content keys the code knows about but the database lacks. */
  seedContent: () => post<{ inserted: number; message?: string }>('/api/admin/seed'),

  async upload(
    file: File,
    options: { folder?: string; key?: string; alt?: string } = {},
  ): Promise<AdminResult<{ url: string; path: string }>> {
    const form = new FormData()
    form.append('file', file)
    if (options.folder) form.append('folder', options.folder)
    if (options.key) form.append('key', options.key)
    if (options.alt) form.append('alt', options.alt)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) return { error: json?.error ?? `Upload failed (${res.status})` }
      return { data: { url: json.url, path: json.path } }
    } catch (e: any) {
      return { error: e?.message ?? 'Network error during upload' }
    }
  },
}
