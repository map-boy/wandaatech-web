import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Star } from 'lucide-react'
import { getContent } from '@/lib/site-content'
import { getProjects, getTeam } from '@/lib/site-data'

/**
 * The admin-managed project portfolio.
 *
 * Each project can be attributed to a team member, in which case its card
 * links through to that person's profile — so a visitor can go from a project
 * to the people who built it and back again.
 */
export async function ProjectsGrid() {
  const [c, projects, team] = await Promise.all([getContent(), getProjects(), getTeam()])

  if (projects.length === 0) return null

  const memberById = new Map(team.map((m) => [m.id, m]))
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)
  const ordered = [...featured, ...rest]

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="mb-10 max-w-2xl space-y-3">
        <h2 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">
          {c.t('projects.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{c.t('projects.subtitle')}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((project) => {
          const owner = project.owner_id ? memberById.get(project.owner_id) : null

          return (
            <article key={project.id} className="skeuo-card flex flex-col overflow-hidden">
              {project.image && (
                <div className="relative h-44 w-full bg-muted">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}

              <div className="flex flex-grow flex-col gap-3 p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold leading-snug text-foreground">{project.title}</h3>
                  {project.featured && (
                    <Star className="h-4 w-4 shrink-0 fill-emerald-500 text-emerald-500" />
                  )}
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

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="skeuo-button inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold"
                    >
                      <span className="skeuo-glow-text">Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {owner && (
                    <Link
                      href={`/team/${owner.slug}`}
                      className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-emerald-500"
                    >
                      <span className="relative h-6 w-6 overflow-hidden rounded-full bg-muted">
                        <Image src={owner.photo} alt={owner.name} fill className="object-cover" sizes="24px" />
                      </span>
                      {owner.name}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
