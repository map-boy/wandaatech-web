// ===========================================================================
// The bridge between what the admin panel stores and what the site renders.
//
//   const c = await getContent()
//   c.t('hero.subtitle')          → admin value, else bundled default
//   c.list('about.values')        → newline-separated list
//   c.pairs('company.stats')      → "A | B" lines → [{ a, b }]
//   c.triples('company.timeline') → "A | B | C" lines
// ===========================================================================

import { DEFAULT_CONTENT_MAP } from './site-defaults'
import { restSelect } from './supabase-rest'

export type ContentMap = Record<string, string>

export interface Content {
  map: ContentMap
  t: (key: string, fallback?: string) => string
  list: (key: string) => string[]
  pairs: (key: string) => { a: string; b: string }[]
  triples: (key: string) => { a: string; b: string; c: string }[]
}

/** Build the accessor helpers around a plain key/value map. */
export function createContent(map: ContentMap): Content {
  const t = (key: string, fallback = '') => {
    const v = map[key]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
    return DEFAULT_CONTENT_MAP[key] ?? fallback
  }

  const list = (key: string) =>
    t(key)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

  const split = (line: string) => line.split('|').map((p) => p.trim())

  const pairs = (key: string) =>
    list(key).map((line) => {
      const [a = '', b = ''] = split(line)
      return { a, b }
    })

  const triples = (key: string) =>
    list(key).map((line) => {
      const [a = '', b = '', c = ''] = split(line)
      return { a, b, c }
    })

  return { map, t, list, pairs, triples }
}

/**
 * Server-side content fetch. Always resolves — an unreachable or unconfigured
 * database simply means every key falls through to its bundled default.
 */
export async function getContent(): Promise<Content> {
  const rows = await restSelect<{ key: string; value: string }>(
    'site_content',
    'select=key,value',
  )

  const map: ContentMap = { ...DEFAULT_CONTENT_MAP }
  for (const row of rows ?? []) {
    if (row?.key && row.value != null && String(row.value).trim() !== '') {
      map[row.key] = String(row.value)
    }
  }
  return createContent(map)
}

// ── Section visibility ─────────────────────────────────────────────────────

export interface SiteSection {
  slug: string
  title: string
  is_visible: boolean
  sort_order: number
  body?: string
}

/**
 * Returns a predicate for "should this section render?". A section with no row
 * in the database is visible by default, so adding a new section to the page
 * never requires a database edit first.
 */
export async function getSectionVisibility(): Promise<(slug: string) => boolean> {
  const rows = await restSelect<SiteSection>(
    'site_sections',
    'select=slug,is_visible',
  )
  if (!rows) return () => true

  const hidden = new Set(
    rows.filter((r) => r.is_visible === false).map((r) => r.slug),
  )
  return (slug: string) => !hidden.has(slug)
}
