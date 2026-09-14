import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getContent } from '@/lib/site-content'
import { getTeam } from '@/lib/site-data'
import { TeamCard } from '@/components/team-card'

/**
 * Leadership section. Members, photos, bios and their project portfolios all
 * come from the `team` table, which is managed in /admin → Team Roster.
 */
export async function Team({ id = 'team', limit }: { id?: string; limit?: number }) {
  const [c, team] = await Promise.all([getContent(), getTeam()])
  const members = typeof limit === 'number' ? team.slice(0, limit) : team

  return (
    <section id={id} className="border-b border-border/50 bg-background py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-4xl font-bold text-foreground sm:text-5xl">
                {c.t('team.title')} <span className="skeuo-glow-text">{c.t('team.titleAccent')}</span>
              </h2>
              <p className="text-lg text-muted-foreground">{c.t('team.subtitle')}</p>
            </div>

            {team.length > 0 && (
              <Link
                href="/team"
                className="skeuo-button inline-flex shrink-0 items-center gap-2 px-5 py-3 text-sm font-bold"
              >
                <span className="skeuo-glow-text">Meet the whole team</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {members.length === 0 ? (
            <div className="skeuo-inset rounded-2xl p-10 text-center text-muted-foreground">
              {c.t('team.emptyState')}
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member, i) => (
                <TeamCard key={member.id} member={member} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
