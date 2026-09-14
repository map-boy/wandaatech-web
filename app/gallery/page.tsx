import type { Metadata } from 'next'
import { Camera } from 'lucide-react'
import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Footer } from '@/components/site-footer'
import { GalleryBrowser } from '@/components/gallery-browser'
import { AdSlot } from '@/components/ads/ad-slot'
import { getContent } from '@/lib/site-content'
import { getGallery } from '@/lib/site-data'
import { DEFAULT_PHOTOS, type Photo } from '@/lib/gallery-defaults'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent()
  return {
    title: c.t('gallery.title'),
    description: c.t('gallery.subtitle'),
    alternates: { canonical: '/gallery' },
  }
}

export default async function GalleryPage() {
  const [c, items] = await Promise.all([getContent(), getGallery()])

  // Admin-managed photos replace the bundled set once any exist.
  const photos: Photo[] =
    items.length > 0
      ? items.map((item) => ({
          id: item.id,
          src: item.image_url,
          caption: item.title,
          category: item.category || 'General',
        }))
      : DEFAULT_PHOTOS

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBar />
      <Header />

      <main className="pb-24 pt-32">
        <div className="container mx-auto mb-14 px-6">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
            <Camera className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-500">
              Visual Archive
            </span>
          </div>
          <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-foreground md:text-7xl">
            {c.t('gallery.title')}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {c.t('gallery.subtitle')}
          </p>
        </div>

        <GalleryBrowser photos={photos} />

        <div className="container mx-auto px-6">
          <AdSlot placement="list-grid" minHeight={120} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
