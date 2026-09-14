import type { MetadataRoute } from 'next'
import { getContent } from '@/lib/site-content'
import { getTeam, getArticles } from '@/lib/site-data'

export const revalidate = 3600

/** Static routes, with the weight Google should give each. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',              priority: 1.0, changeFrequency: 'weekly' },
  { path: '/company',      priority: 0.9, changeFrequency: 'monthly' },
  { path: '/team',         priority: 0.9, changeFrequency: 'weekly' },
  { path: '/projects',     priority: 0.9, changeFrequency: 'weekly' },
  { path: '/insights',     priority: 0.9, changeFrequency: 'weekly' },
  { path: '/competitions', priority: 0.9, changeFrequency: 'daily' },
  { path: '/gallery',      priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact',      priority: 0.7, changeFrequency: 'monthly' },
  { path: '/lab',          priority: 0.7, changeFrequency: 'monthly' },
  { path: '/qr-engine',    priority: 0.6, changeFrequency: 'monthly' },
  { path: '/converter',    priority: 0.6, changeFrequency: 'monthly' },
  { path: '/experiments',  priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy',      priority: 0.5, changeFrequency: 'yearly' },
  { path: '/terms',        priority: 0.5, changeFrequency: 'yearly' },
  { path: '/cookie-policy',priority: 0.5, changeFrequency: 'yearly' },
  { path: '/disclaimer',   priority: 0.5, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [c, team, articles] = await Promise.all([getContent(), getTeam(), getArticles()])
  const base = c.t('seo.siteUrl').replace(/\/$/, '')
  const now = new Date()

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const teamEntries = team.map((member) => ({
    url: `${base}/team/${member.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const articleEntries = articles.map((article) => ({
    url: `${base}/insights/${article.slug}`,
    lastModified: article.published_at ? new Date(article.published_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...teamEntries, ...articleEntries]
}
