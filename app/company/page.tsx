import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Target, Eye, Compass, Quote } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/site-footer'
import { AdSlot } from '@/components/ads/ad-slot'
import { RichText } from '@/components/content/rich-text'
import { getContent } from '@/lib/site-content'
import { getTeam } from '@/lib/site-data'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent()
  return {
    title: c.t('company.title'),
    description: c.t('company.subtitle'),
    alternates: { canonical: '/company' },
  }
}

export default async function CompanyPage() {
  const [c, team] = await Promise.all([getContent(), getTeam()])

  const stats = c.pairs('company.stats')
  const values = c.pairs('company.values')
  const services = c.pairs('company.services')
  const timeline = c.triples('company.timeline')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28">
        {/* ── Masthead ── */}
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-500">
            {c.t('brand.name')}
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter sm:text-6xl">
            {c.t('company.title')}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {c.t('company.subtitle')}
          </p>
        </section>

        {/* ── Stats strip ── */}
        {stats.length > 0 && (
          <section className="border-y border-border/50 bg-emerald-500/[0.03]">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px px-4 py-10 sm:px-6 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.a + stat.b} className="px-4 py-2 text-center">
                  <p className="text-3xl font-black tracking-tight text-emerald-500 sm:text-4xl">
                    {stat.a}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {stat.b}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Story ── */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-5">
              <h2 className="text-3xl font-black uppercase tracking-tight">
                {c.t('company.story.title')}
              </h2>
              <RichText
                value={c.t('company.story.body')}
                paragraphClassName="text-[15px] leading-[1.8] text-muted-foreground"
              />
            </div>

            <div className="skeuo-card relative h-64 overflow-hidden rounded-2xl p-3 md:h-full">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  src={c.t('about.image')}
                  alt={c.t('brand.name')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <AdSlot placement="article-inline" minHeight={120} />
        </div>

        {/* ── Mission / Vision / Approach ── */}
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, title: c.t('company.mission.title'), body: c.t('company.mission.body') },
              { icon: Eye, title: c.t('company.vision.title'), body: c.t('company.vision.body') },
              { icon: Compass, title: c.t('company.approach.title'), body: c.t('company.approach.body') },
            ].map(({ icon: Icon, title, body }) => (
              <article key={title} className="skeuo-card space-y-3 p-6">
                <Icon className="h-6 w-6 text-emerald-500" />
                <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
                <RichText
                  value={body}
                  paragraphClassName="text-sm leading-relaxed text-muted-foreground"
                />
              </article>
            ))}
          </div>
        </section>

        {/* ── What we stand for ── */}
        {values.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="mb-8 text-3xl font-black uppercase tracking-tight">
              {c.t('company.values.title')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((value, i) => (
                <article key={value.a} className="skeuo-inset space-y-2 rounded-2xl p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-black text-emerald-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-bold text-foreground">{value.a}</h3>
                  </div>
                  <p className="pl-8 text-sm leading-relaxed text-muted-foreground">{value.b}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Services ── */}
        {services.length > 0 && (
          <section className="border-y border-border/50 bg-muted/20 py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <h2 className="mb-8 text-3xl font-black uppercase tracking-tight">
                {c.t('company.services.title')}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {services.map((service) => (
                  <article key={service.a} className="skeuo-card space-y-2 p-6">
                    <h3 className="font-bold text-foreground">{service.a}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{service.b}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Timeline ── */}
        {timeline.length > 0 && (
          <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <h2 className="mb-10 text-3xl font-black uppercase tracking-tight">
              {c.t('company.timeline.title')}
            </h2>
            <ol className="relative space-y-8 border-l border-border pl-8">
              {timeline.map((entry) => (
                <li key={`${entry.a}-${entry.b}`} className="relative">
                  <span className="absolute -left-[38px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-emerald-500 bg-background" />
                  <p className="font-mono text-xs font-black uppercase tracking-widest text-emerald-500">
                    {entry.a}
                  </p>
                  <h3 className="mt-1 font-bold text-foreground">{entry.b}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.c}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Team teaser ── */}
        {team.length > 0 && (
          <section className="border-t border-border/50 py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">
                    The people behind it
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select anyone to see their full profile and every project they have shipped.
                  </p>
                </div>
                <Link
                  href="/team"
                  className="skeuo-button inline-flex items-center gap-2 px-5 py-3 text-sm font-bold"
                >
                  <span className="skeuo-glow-text">All team members</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {team.slice(0, 4).map((member) => (
                  <Link
                    key={member.id}
                    href={`/team/${member.slug}`}
                    className="skeuo-card group overflow-hidden p-3 transition-transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-bold text-foreground">{member.name}</p>
                      <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Closing CTA ── */}
        <section className="border-t border-border/50 bg-emerald-500/[0.04] py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 text-center sm:px-6">
            <Quote className="h-7 w-7 text-emerald-500" />
            <p className="max-w-2xl text-xl font-medium leading-relaxed text-foreground">
              {c.t('company.vision.body')}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="skeuo-button px-7 py-3 text-sm font-bold">
                <span className="skeuo-glow-text">Work with us</span>
              </Link>
              <Link href="/projects" className="skeuo-button px-7 py-3 text-sm font-bold">
                See what we built
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
