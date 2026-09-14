import Link from 'next/link'
import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { ConverterBanner } from '@/components/converter-banner'
import { About } from '@/components/about'
import { Project } from '@/components/project'
import { Team } from '@/components/team'
import { Footer } from '@/components/site-footer'
import { AdSlot } from '@/components/ads/ad-slot'
import { getContent, getSectionVisibility } from '@/lib/site-content'
import { getGallery, getArticles } from '@/lib/site-data'
import { DEFAULT_PHOTOS } from '@/lib/gallery-defaults'

export const revalidate = 60

export default async function Home() {
  const [c, isVisible, galleryItems, articles] = await Promise.all([
    getContent(),
    getSectionVisibility(),
    getGallery(),
    getArticles(),
  ])

  const previewPhotos = (
    galleryItems.length > 0
      ? galleryItems.map((g) => ({ src: g.image_url, caption: g.title }))
      : DEFAULT_PHOTOS.map((p) => ({ src: p.src, caption: p.caption }))
  ).slice(0, 6)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBar />
      <Header />

      <main>
        {isVisible('hero') && (
          <Hero
            headlines={c.list('hero.headlines')}
            subtitle={c.t('hero.subtitle')}
            image={c.t('hero.image')}
            primaryCta={c.t('hero.primaryCta')}
            primaryHref={c.t('hero.primaryHref')}
            secondaryCta={c.t('hero.secondaryCta')}
            secondaryHref={c.t('hero.secondaryHref')}
          />
        )}

        {isVisible('converter-banner') && <ConverterBanner />}

        {isVisible('leaderboard-cta') && (
          <section className="border-y border-emerald-500/20 bg-emerald-500/5 py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                  🏆 ML <span className="text-emerald-500">Leaderboard</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Submit your model predictions and compete with the club in real time.
                </p>
              </div>
              <Link
                href="/competitions?tab=leaderboard"
                className="whitespace-nowrap rounded-xl bg-emerald-600 px-8 py-4 font-black uppercase tracking-tight text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 active:scale-95"
              >
                Join the Competition →
              </Link>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <AdSlot placement="home-top" minHeight={120} />
        </div>

        {isVisible('about') && <About id="about" />}
        {isVisible('project') && <Project id="project" />}

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <AdSlot placement="home-mid" minHeight={120} />
        </div>

        {isVisible('team') && <Team id="team" limit={6} />}

        {/* ── Latest insights ── */}
        {isVisible('insights') && articles.length > 0 && (
          <section className="border-t border-border/40 py-24">
            <div className="container mx-auto px-6">
              <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-4xl font-black uppercase leading-none tracking-tighter md:text-5xl">
                    {c.t('insights.title')}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">{c.t('insights.subtitle')}</p>
                </div>
                <Link
                  href="/insights"
                  className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black uppercase tracking-tight text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 active:scale-95"
                >
                  Read all →
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 3).map((article) => (
                  <Link
                    key={article.id}
                    href={`/insights/${article.slug}`}
                    className="skeuo-card p-6 transition-transform hover:-translate-y-1"
                  >
                    <h3 className="font-bold leading-snug text-foreground">{article.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Gallery preview ── */}
        {isVisible('gallery') && (
          <section className="border-t border-border/40 py-24">
            <div className="container mx-auto px-6">
              <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-500">
                      📸 Visual Archive
                    </span>
                  </div>
                  <h2 className="text-4xl font-black uppercase leading-none tracking-tighter md:text-5xl">
                    {c.t('gallery.title')}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">{c.t('gallery.subtitle')}</p>
                </div>
                <Link
                  href="/gallery"
                  className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black uppercase tracking-tight text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 active:scale-95"
                >
                  View All Photos →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {previewPhotos.map((photo) => (
                  <Link
                    key={photo.src}
                    href="/gallery"
                    className="group relative aspect-video overflow-hidden rounded-2xl border border-border/40 transition-all hover:border-emerald-500/40"
                  >
                    <img
                      src={photo.src}
                      alt={photo.caption}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="text-xs font-bold text-white">{photo.caption}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
