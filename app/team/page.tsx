import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/site-footer'
import { Team } from '@/components/team'
import { AdSlot } from '@/components/ads/ad-slot'
import { getContent } from '@/lib/site-content'
import { getTeam } from '@/lib/site-data'

export async function generateMetadata(): Promise<Metadata> {
  const [c, team] = await Promise.all([getContent(), getTeam()])
  return {
    title: 'Leadership & Team',
    description: `Meet the people behind ${c.t('brand.name')} — their roles, their background and every project they have shipped.`,
    alternates: { canonical: '/team' },
    // Until profiles are added this page has nothing on it; an indexed empty
    // page counts against the site in an AdSense content review.
    robots: team.length === 0 ? { index: false, follow: true } : undefined,
  }
}

export default async function TeamIndexPage() {
  const c = await getContent()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28">
        <section className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter sm:text-5xl">
            {c.t('team.title')} <span className="text-emerald-500">{c.t('team.titleAccent')}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {c.t('team.subtitle')} Select anyone to see their full profile and every project they
            have worked on.
          </p>
        </section>

        <Team id="team-directory" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <AdSlot placement="list-grid" minHeight={120} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
