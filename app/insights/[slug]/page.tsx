import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, User } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/site-footer'
import { AdSlot } from '@/components/ads/ad-slot'
import { getContent } from '@/lib/site-content'
import { getArticles, getArticleBySlug } from '@/lib/site-data'

export const revalidate = 60

export async function generateStaticParams() {
  const articles = await getArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Article not found' }

  return {
    title: article.title,
    description: article.excerpt || article.body.slice(0, 155),
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.published_at || undefined,
      authors: [article.author],
      images: article.cover_image ? [{ url: article.cover_image }] : undefined,
    },
  }
}

function formatDate(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Renders the article body.
 *
 * Blank lines separate paragraphs and a line starting with "## " becomes a
 * subheading. Deliberately not HTML: the body is admin-authored text, and
 * keeping it as text means it can never carry markup into the page.
 */
function ArticleBody({ body }: { body: string }) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return (
            <h2 key={i} className="pt-4 text-2xl font-black tracking-tight text-foreground">
              {block.slice(3)}
            </h2>
          )
        }
        if (block.startsWith('### ')) {
          return (
            <h3 key={i} className="pt-2 text-lg font-bold text-foreground">
              {block.slice(4)}
            </h3>
          )
        }
        if (block.startsWith('- ')) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 text-[15px] leading-[1.8] text-muted-foreground">
              {block.split('\n').map((line, j) => (
                <li key={j}>{line.replace(/^-\s*/, '')}</li>
              ))}
            </ul>
          )
        }
        if (block.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-emerald-500 pl-4 text-[15px] italic leading-[1.8] text-foreground"
            >
              {block.replace(/^>\s*/gm, '')}
            </blockquote>
          )
        }
        return (
          <p key={i} className="text-[15px] leading-[1.8] text-muted-foreground">
            {block}
          </p>
        )
      })}
    </div>
  )
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [c, article, all] = await Promise.all([getContent(), getArticleBySlug(slug), getArticles()])

  if (!article) notFound()

  const related = all.filter((a) => a.slug !== article.slug).slice(0, 3)
  const siteUrl = c.t('seo.siteUrl')

  // Split the body so an in-article ad sits between paragraphs rather than
  // interrupting the first screen — AdSense penalises ads that crowd content.
  const blocks = article.body.split(/\n\s*\n/)
  const midpoint = Math.floor(blocks.length / 2)
  const firstHalf = blocks.slice(0, midpoint).join('\n\n')
  const secondHalf = blocks.slice(midpoint).join('\n\n')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28">
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            href="/insights"
            className="mb-8 flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-emerald-500"
          >
            <ArrowLeft className="h-4 w-4" />
            All insights
          </Link>

          <header className="space-y-4 border-b border-border pb-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {article.author}
              </span>
              {article.published_at && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(article.published_at)}
                </span>
              )}
            </div>

            {article.excerpt && (
              <p className="text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
            )}
          </header>

          {article.cover_image && (
            <div className="relative my-8 h-64 w-full overflow-hidden rounded-2xl bg-muted sm:h-80">
              <Image
                src={article.cover_image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          <div className="py-4">
            <ArticleBody body={firstHalf} />
          </div>

          {secondHalf && <AdSlot placement="article-inline" minHeight={120} />}

          {secondHalf && (
            <div className="py-4">
              <ArticleBody body={secondHalf} />
            </div>
          )}

          {article.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 border-t border-border/50 pt-8">
              {article.tags.map((tag) => (
                <li
                  key={tag}
                  className="skeuo-inset px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <AdSlot placement="article-bottom" minHeight={120} />

          {related.length > 0 && (
            <section className="border-t border-border/50 py-12">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Read next
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/insights/${item.slug}`}
                    className="skeuo-card p-4 transition-transform hover:-translate-y-1"
                  >
                    <p className="text-sm font-bold leading-snug text-foreground">{item.title}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Script id="article-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          image: article.cover_image ? [article.cover_image] : undefined,
          datePublished: article.published_at || undefined,
          author: { '@type': 'Organization', name: article.author },
          publisher: {
            '@type': 'Organization',
            name: c.t('brand.name'),
            logo: { '@type': 'ImageObject', url: `${siteUrl}${c.t('brand.logo')}` },
          },
          mainEntityOfPage: `${siteUrl}/insights/${article.slug}`,
        })}
      </Script>

      <Footer />
    </div>
  )
}
