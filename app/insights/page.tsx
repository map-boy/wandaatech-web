import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/site-footer'
import { AdSlot } from '@/components/ads/ad-slot'
import { getContent } from '@/lib/site-content'
import { getArticles } from '@/lib/site-data'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent()
  return {
    title: c.t('insights.title'),
    description: c.t('insights.subtitle'),
    alternates: { canonical: '/insights' },
  }
}

function formatDate(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function InsightsPage() {
  const [c, articles] = await Promise.all([getContent(), getArticles()])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28">
        <section className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter sm:text-5xl">
            {c.t('insights.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{c.t('insights.subtitle')}</p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          {articles.length === 0 ? (
            <div className="skeuo-inset rounded-2xl p-12 text-center">
              <p className="font-bold text-foreground">No articles published yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Write-ups from the lab will appear here. In the meantime, see{' '}
                <Link href="/projects" className="text-emerald-500 underline">
                  what we have built
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((article) => (
                <article key={article.id} className="skeuo-card flex flex-col overflow-hidden">
                  {article.cover_image && (
                    <Link href={`/insights/${article.slug}`} className="relative block h-44 bg-muted">
                      <Image
                        src={article.cover_image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </Link>
                  )}

                  <div className="flex flex-grow flex-col gap-3 p-6">
                    {article.published_at && (
                      <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(article.published_at)}
                      </p>
                    )}

                    <h2 className="text-lg font-bold leading-snug text-foreground">
                      <Link href={`/insights/${article.slug}`} className="hover:text-emerald-500">
                        {article.title}
                      </Link>
                    </h2>

                    <p className="flex-grow text-sm leading-relaxed text-muted-foreground">
                      {article.excerpt}
                    </p>

                    <Link
                      href={`/insights/${article.slug}`}
                      className="inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-500"
                    >
                      Read article <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <AdSlot placement="list-grid" minHeight={120} />
        </section>
      </main>

      <Footer />
    </div>
  )
}
