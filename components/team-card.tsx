'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Mail, Linkedin, Github, Globe, FolderGit2, ArrowRight } from 'lucide-react'
import type { TeamMember } from '@/lib/site-data'

const SOCIAL_ICONS = [
  { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { key: 'email', icon: Mail, label: 'Email' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'github', icon: Github, label: 'GitHub' },
  { key: 'website', icon: Globe, label: 'Website' },
] as const

/** Normalises whatever an admin typed into something an anchor can use. */
function socialHref(key: string, raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  if (key === 'email') return value.startsWith('mailto:') ? value : `mailto:${value}`
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (key === 'whatsapp') return `https://wa.me/${value.replace(/[^\d]/g, '')}`
  return `https://${value}`
}

export function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const projectCount = member.projects.length

  return (
    <motion.article
      className="group skeuo-card flex h-full flex-col overflow-hidden p-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ delay: Math.min(index * 0.08, 0.4) }}
      viewport={{ once: true }}
    >
      <Link
        href={`/team/${member.slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted"
        aria-label={`View ${member.name}'s profile and projects`}
      >
        <Image
          src={member.photo}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent opacity-70" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

        {projectCount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            {projectCount} {projectCount === 1 ? 'project' : 'projects'}
          </span>
        )}

        <span className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[11px] font-bold text-white/0 transition-colors group-hover:text-white/90">
          <FolderGit2 className="h-3.5 w-3.5" />
          View portfolio
        </span>
      </Link>

      <div className="flex flex-grow flex-col space-y-4 p-5">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground transition-colors group-hover:skeuo-glow-text">
            {member.name}
          </h3>
          <p className="skeuo-glow-text text-sm font-medium uppercase tracking-wider">{member.role}</p>
          {member.headline && (
            <p className="text-xs text-muted-foreground">{member.headline}</p>
          )}
        </div>

        <p className="flex-grow text-sm leading-relaxed text-muted-foreground line-clamp-4">
          {member.bio}
        </p>

        {member.skills.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {member.skills.slice(0, 4).map((skill) => (
              <li
                key={skill}
                className="skeuo-inset px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {skill}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {SOCIAL_ICONS.map(({ key, icon: Icon, label }) => {
            const href = socialHref(key, (member.social as any)[key] ?? '')
            if (!href) return null
            return (
              <a
                key={key}
                href={href}
                target={key === 'email' ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="skeuo-button p-2.5"
                aria-label={`${member.name} on ${label}`}
              >
                <Icon className="skeuo-glow-text h-4 w-4" />
              </a>
            )
          })}

          <Link
            href={`/team/${member.slug}`}
            className="skeuo-button ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wide"
          >
            <span className="skeuo-glow-text">Projects</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
