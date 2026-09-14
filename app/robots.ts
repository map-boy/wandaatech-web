import type { MetadataRoute } from 'next'
import { getContent } from '@/lib/site-content'

export const revalidate = 3600

export default async function robots(): Promise<MetadataRoute.Robots> {
  const c = await getContent()
  const base = c.t('seo.siteUrl').replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The panel and its API are not content; keeping them out of the index
        // also keeps them off AdSense's crawl.
        disallow: ['/admin', '/api/'],
      },
      // Explicitly welcome the AdSense crawler so it can read every page it
      // needs to classify for ad targeting.
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: 'AdsBot-Google', allow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
