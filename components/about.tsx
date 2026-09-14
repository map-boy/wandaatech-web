import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getContent } from '@/lib/site-content'
import { RichText } from '@/components/content/rich-text'

/** Home-page "about" block. Every string here is editable in /admin. */
export async function About({ id = 'about' }: { id?: string }) {
  const c = await getContent()
  const values = c.list('about.values')

  return (
    <section id={id} className="border-b border-border bg-background py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">
              {c.t('about.eyebrow')}
            </p>
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
              {c.t('about.title')}{' '}
              <span className="skeuo-glow-text">{c.t('about.titleAccent')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">{c.t('about.subtitle')}</p>
          </div>

          <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
            <div className="skeuo-card space-y-6 p-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">{c.t('about.block1.title')}</h3>
                <RichText value={c.t('about.block1.body')} />
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">{c.t('about.block2.title')}</h3>
                <RichText value={c.t('about.block2.body')} />
              </div>

              {values.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-foreground">
                    {c.t('about.values.title')}
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    {values.map((value) => (
                      <li key={value} className="skeuo-inset flex items-center gap-3 px-4 py-2.5">
                        <span className="skeuo-glow-text h-2 w-2 rounded-full bg-current" />
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href="/company"
                className="skeuo-button inline-flex items-center gap-2 px-5 py-3 text-sm font-bold"
              >
                <span className="skeuo-glow-text">Read our full story</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="skeuo-card relative aspect-square overflow-hidden rounded-[1.5rem] p-3">
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src={c.t('about.image')}
                  alt={c.t('brand.name')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-primary/5 transition-colors duration-300 hover:bg-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
