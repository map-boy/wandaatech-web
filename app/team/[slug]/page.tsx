import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, FolderGit2, MapPin, Mail, MessageCircle,
  Linkedin, Github, Globe, Calendar,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/site-footer'
import { AdSlot } from '@/components/ads/ad-slot'
import { RichText } from '@/components/content/rich-text'
import { getContent } from '@/lib/site-content'
import { getTeam, getMemberBySlug, getProjects, type TeamMember } from '@/lib/site-data'

export const revalidate = 60

export async function generateStaticParams() {
  const team = await getTeam()
  return team.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const member = await getMemberBySlug(slug)
  if (!member) return { title: 'Team member not found' }

  return {
    title: `${member.name} — ${member.role}`,
    description:
      member.headline ||
      member.bio.slice(0, 155) ||
      `${member.name}, ${member.role} at VAF UBWENGE TECH.`,
    alternates: { canonical: `/team/${member.slug}` },
    openGraph: {
      title: `${member.name} — ${member.role}`,
      description: member.headline || member.bio.slice(0, 155),
      images: member.photo ? [{ url: member.photo }] : undefined,
      type: 'profile',
    },
  }
}

const SOCIALS = [
  { key: 'email', icon: Mail, label: 'Email' },
  { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'github', icon: Github, label: 'GitHub' },
  { key: 'website', icon: Globe, label: 'Website' },
] as const

function socialHref(key: string, raw: string): string {
  const value = (raw ?? '').trim()
  if (!value) return ''
  if (key === 'email') return value.startsWith('mailto:') ? value : `mailto:${value}`
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (key === 'whatsapp') return `https://wa.me/${value.replace(/[^\d]/g, '')}`
  return `https://${value}`
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [c, member, allProjects, team] = await Promise.all([
    getContent(),
    getMemberBySlug(slug),
    getProjects(),
    getTeam(),
  ])

  if (!member) notFound()

  // A member's portfolio is their own `projects` entries plus any company
  // project assigned to them in the Projects tab — so a project only has to
  // be entered once, wherever it fits best.
  const ownedCompanyProjects = allProjects.filter((p) => p.owner_id === member.id)
  const colleagues = team.filter((m) => m.id !== member.id).slice(0, 4)
  const totalProjects = member.projects.length + ownedCompanyProjects.length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link
            href="/team"
            className="mb-8 flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-emerald-500"
          >
            <ArrowLeft className="h-4 w-4" />
            All team members
          </Link>

          {/* ── Profile header ── */}
          <header className="skeuo-card grid gap-8 p-6 sm:p-8 md:grid-cols-[240px_1fr]">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={member.photo}
                alt={member.name}
                fill
                className="object-cover"
                sizes="240px"
                priority
              />
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <p className="skeuo-glow-text text-xs font-bold uppercase tracking-[0.2em]">
                  {member.role}
                </p>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{member.name}</h1>
                {member.headline && (
                  <p className="text-lg text-muted-foreground">{member.headline}</p>
                )}
                {member.location && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {member.location}
                  </p>
                )}
              </div>

              {member.bio && <RichText value={member.bio} />}

              {member.skills.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <li
                      key={skill}
                      className="skeuo-inset px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {SOCIALS.map(({ key, icon: Icon, label }) => {
                  const href = socialHref(key, (member.social as any)[key] ?? '')
                  if (!href) return null
                  return (
                    <a
                      key={key}
                      href={href}
                      target={key === 'email' ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="skeuo-button inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
                      aria-label={`${member.name} on ${label}`}
                    >
                      <Icon className="skeuo-glow-text h-4 w-4" />
                      <span>{label}</span>
                    </a>
                  )
                })}

                {member.portfolio_link && (
                  <a
                    href={member.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="skeuo-button inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
                  >
                    <ExternalLink className="skeuo-glow-text h-4 w-4" />
                    <span>Full portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </header>

          <AdSlot placement="article-top" minHeight={120} />

          {/* ── Projects ── */}
          <section className="py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight">
                  <FolderGit2 className="h-5 w-5 text-emerald-500" />
                  Projects
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {totalProjects === 0
                    ? `We are still writing up ${member.name.split(' ')[0]}'s project history.`
                    : `Everything ${member.name.split(' ')[0]} has built with us — ${totalProjects} in total.`}
                </p>
              </div>
            </div>

            {totalProjects === 0 ? (
              <div className="skeuo-inset rounded-2xl p-10 text-center text-sm text-muted-foreground">
                No projects published yet. Check back soon.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {member.projects.map((project, i) => (
                  <article key={`own-${i}`} className="skeuo-card flex flex-col overflow-hidden">
                    {project.image && (
                      <div className="relative h-44 w-full bg-muted">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className="flex flex-grow flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-foreground">{project.title}</h3>
                        {project.year && (
                          <span className="flex shrink-0 items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {project.year}
                          </span>
                        )}
                      </div>

                      {project.description && (
                        <p className="flex-grow text-sm leading-relaxed text-muted-foreground">
                          {project.description}
                        </p>
                      )}

                      {project.tags && (
                        <ul className="flex flex-wrap gap-1.5">
                          {project.tags
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((tag) => (
                              <li
                                key={tag}
                                className="skeuo-inset px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                              >
                                {tag}
                              </li>
                            ))}
                        </ul>
                      )}

                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="skeuo-button inline-flex w-fit items-center gap-1.5 px-3 py-2 text-xs font-bold"
                        >
                          <span className="skeuo-glow-text">Open project</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}

                {ownedCompanyProjects.map((project) => (
                  <article key={project.id} className="skeuo-card flex flex-col overflow-hidden">
                    {project.image && (
                      <div className="relative h-44 w-full bg-muted">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className="flex flex-grow flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-foreground">{project.title}</h3>
                        <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                          Company
                        </span>
                      </div>
                      <p className="flex-grow text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>
                      {project.tags.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5">
                          {project.tags.map((tag) => (
                            <li
                              key={tag}
                              className="skeuo-inset px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="skeuo-button inline-flex w-fit items-center gap-1.5 px-3 py-2 text-xs font-bold"
                        >
                          <span className="skeuo-glow-text">Open project</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <AdSlot placement="article-bottom" minHeight={120} />

          {/* ── Colleagues ── */}
          {colleagues.length > 0 && (
            <section className="border-t border-border/50 py-12">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Also at {c.t('brand.name')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {colleagues.map((colleague: TeamMember) => (
                  <Link
                    key={colleague.id}
                    href={`/team/${colleague.slug}`}
                    className="skeuo-card flex items-center gap-3 p-3 transition-transform hover:-translate-y-1"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                      <Image src={colleague.photo} alt={colleague.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{colleague.name}</p>
                      <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                        {colleague.role}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
