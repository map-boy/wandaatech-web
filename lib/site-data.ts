// ===========================================================================
// Typed server-side readers for every admin-managed collection.
// Each one fails soft: an empty array, never a thrown page.
// ===========================================================================

import { restSelect } from './supabase-rest'

// ── Shared helpers ─────────────────────────────────────────────────────────

// slugify lives in its own module so client components (the admin panel)
// can use it without pulling these server-side readers into the browser.
export { slugify } from './slug'
import { slugify } from './slug'

function parseJsonArray(value: unknown): any[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// ── Team ───────────────────────────────────────────────────────────────────

export interface MemberProject {
  title: string
  description?: string
  image?: string
  link?: string
  year?: string
  tags?: string
}

export interface SocialLinks {
  whatsapp?: string
  email?: string
  linkedin?: string
  github?: string
  twitter?: string
  website?: string
}

export interface TeamMember {
  id: string
  slug: string
  name: string
  role: string
  headline: string
  photo: string
  bio: string
  location: string
  skills: string[]
  social: SocialLinks
  portfolio_link: string
  projects: MemberProject[]
  sort_order: number
}

export function parseSocialLinks(raw: unknown): SocialLinks {
  if (!raw) return {}
  if (typeof raw === 'object') return raw as SocialLinks
  try {
    const parsed = JSON.parse(String(raw))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function normalizeMember(row: any): TeamMember {
  return {
    id: String(row.id),
    slug: row.slug || slugify(row.name) || String(row.id),
    name: row.name ?? '',
    role: row.role ?? '',
    headline: row.headline ?? '',
    photo: row.photo || '/company-logo.jpg',
    bio: row.bio ?? '',
    location: row.location ?? '',
    skills: String(row.skills ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean),
    social: parseSocialLinks(row.social_links),
    portfolio_link: row.portfolio_link ?? '',
    projects: parseJsonArray(row.projects) as MemberProject[],
    sort_order: Number(row.sort_order ?? 0),
  }
}

export async function getTeam(): Promise<TeamMember[]> {
  const rows = await restSelect<any>('team', 'select=*&order=sort_order.asc,created_at.asc')
  if (!rows) return []
  return rows
    .filter((r) => r.is_visible !== false)
    .map(normalizeMember)
}

export async function getMemberBySlug(slug: string): Promise<TeamMember | null> {
  const team = await getTeam()
  return team.find((m) => m.slug === slug) ?? null
}

// ── Projects ───────────────────────────────────────────────────────────────

export interface CompanyProject {
  id: string
  slug: string
  title: string
  description: string
  body: string
  tags: string[]
  image: string
  link: string
  status: string
  featured: boolean
  owner_id: string | null
}

export function normalizeProject(row: any): CompanyProject {
  return {
    id: String(row.id),
    slug: row.slug || slugify(row.title) || String(row.id),
    title: row.title ?? '',
    description: row.description ?? '',
    body: row.body ?? '',
    tags: Array.isArray(row.tags)
      ? row.tags
      : String(row.tags ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
    image: row.image ?? '',
    link: row.link ?? '',
    status: row.status ?? 'live',
    featured: Boolean(row.featured),
    owner_id: row.owner_id ? String(row.owner_id) : null,
  }
}

export async function getProjects(): Promise<CompanyProject[]> {
  const rows = await restSelect<any>('projects', 'select=*&order=sort_order.asc,created_at.desc')
  if (!rows) return []
  return rows.map(normalizeProject)
}

// ── Gallery ────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string
  title: string
  image_url: string
  description: string
  category: string
}

export async function getGallery(): Promise<GalleryItem[]> {
  const rows = await restSelect<any>('gallery', 'select=*&order=sort_order.asc,created_at.desc')
  if (!rows) return []
  return rows.map((r) => ({
    id: String(r.id),
    title: r.title ?? '',
    image_url: r.image_url ?? '',
    description: r.description ?? '',
    category: r.category ?? 'general',
  }))
}

// ── Articles ───────────────────────────────────────────────────────────────

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  cover_image: string
  author: string
  tags: string[]
  published_at: string
}

function normalizeArticle(row: any): Article {
  return {
    id: String(row.id),
    slug: row.slug || slugify(row.title),
    title: row.title ?? '',
    excerpt: row.excerpt ?? '',
    body: row.body ?? '',
    cover_image: row.cover_image ?? '',
    author: row.author || 'VAF UBWENGE TECH',
    tags: Array.isArray(row.tags) ? row.tags : [],
    published_at: row.published_at ?? '',
  }
}

export async function getArticles(): Promise<Article[]> {
  const rows = await restSelect<any>(
    'articles',
    'select=*&published=eq.true&order=published_at.desc',
  )
  if (!rows) return []
  return rows.map(normalizeArticle)
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const rows = await restSelect<any>(
    'articles',
    `select=*&published=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  )
  if (!rows || rows.length === 0) return null
  return normalizeArticle(rows[0])
}

// ── Ad slots ───────────────────────────────────────────────────────────────

export interface AdSlotConfig {
  placement: string
  slot_id: string
  format: string
  layout_key: string | null
  full_width: boolean
  enabled: boolean
}

export async function getAdSlots(): Promise<Record<string, AdSlotConfig>> {
  const rows = await restSelect<any>('ad_slots', 'select=*&enabled=eq.true')
  const map: Record<string, AdSlotConfig> = {}
  for (const r of rows ?? []) {
    if (!r?.placement || !r?.slot_id) continue
    map[r.placement] = {
      placement: r.placement,
      slot_id: String(r.slot_id),
      format: r.format || 'auto',
      layout_key: r.layout_key || null,
      full_width: r.full_width !== false,
      enabled: true,
    }
  }
  return map
}
