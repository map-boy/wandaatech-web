'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { MessageCircle, Mail, X, ExternalLink, FolderGit2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Project {
  title: string
  description?: string
  image?: string
  link?: string
}

interface Member {
  id: string
  name: string
  role: string
  photo: string
  bio: string
  social_links: string
  projects: Project[]
}

function parseSocial(raw: string) {
  try {
    const parsed = JSON.parse(raw)
    return { whatsapp: parsed.whatsapp || '', email: parsed.email || '' }
  } catch {
    return { whatsapp: '', email: '' }
  }
}

function TeamCard({ member, index, onOpenPortfolio }: { member: Member; index: number; onOpenPortfolio: (m: Member) => void }) {
  const social = parseSocial(member.social_links)

  return (
    <motion.div
      className="group skeuo-card overflow-hidden flex flex-col h-full p-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <button
        onClick={() => onOpenPortfolio(member)}
        className="relative aspect-[4/5] overflow-hidden bg-muted rounded-2xl cursor-pointer w-full text-left"
        aria-label={`View ${member.name}'s portfolio`}
      >
        <Image
          src={member.photo}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-2xl pointer-events-none" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[11px] font-bold text-white/0 group-hover:text-white/90 transition-colors">
          <FolderGit2 className="w-3.5 h-3.5" />
          View Portfolio
        </div>
      </button>

      <div className="p-5 space-y-4 flex-grow flex flex-col">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground group-hover:skeuo-glow-text transition-colors">
            {member.name}
          </h3>
          <p className="text-sm font-medium skeuo-glow-text uppercase tracking-wider">
            {member.role}
          </p>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
          {member.bio}
        </p>

        <div className="flex gap-3 pt-4">
          {social.whatsapp && (
            <motion.a
              href={social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="skeuo-button p-2.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 skeuo-glow-text" />
            </motion.a>
          )}

          {social.email && (
            <motion.a
              href={social.email}
              className="skeuo-button p-2.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Email"
            >
              <Mail className="w-5 h-5 skeuo-glow-text" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function PortfolioModal({ member, onClose }: { member: Member; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="skeuo-card border border-border rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="skeuo-button absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden skeuo-button">
              <Image src={member.photo} alt={member.name} fill className="object-cover" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{member.name}</h3>
            <p className="text-xs font-bold skeuo-glow-text uppercase tracking-wider">{member.role}</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{member.bio}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-foreground uppercase tracking-tight text-xs flex items-center gap-2">
              <FolderGit2 className="w-3.5 h-3.5 skeuo-glow-text" /> Machine Learning Projects
            </h4>

            {(!member.projects || member.projects.length === 0) ? (
              <p className="text-sm text-muted-foreground skeuo-inset p-4 rounded-2xl text-center">
                No projects added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {member.projects.map((proj, i) => (
                  <div key={i} className="skeuo-inset rounded-2xl overflow-hidden">
                    {proj.image && (
                      <div className="relative w-full h-40">
                        <Image src={proj.image} alt={proj.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <p className="font-bold text-foreground text-sm">{proj.title}</p>
                      {proj.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>
                      )}
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="skeuo-button inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold skeuo-glow-text cursor-pointer"
                        >
                          Open Project <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Team() {
  const [members, setMembers] = useState<Member[]>([])
  const [activeMember, setActiveMember] = useState<Member | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('team')
        .select('*')
        .order('created_at', { ascending: true })
      if (data) {
        setMembers(
          data.map((m: any) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            photo: m.photo || '/placeholder-avatar.jpg',
            bio: m.bio || '',
            social_links: m.social_links || '{}',
            projects: Array.isArray(m.projects) ? m.projects : [],
          }))
        )
      }
    }
    load()
  }, [])

  return (
    <section id="team" className="py-20 sm:py-32 bg-background border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <motion.div
            className="space-y-4 max-w-2xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Our <span className="skeuo-glow-text">Leadership</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Leading the digital transformation at VAF UBWENGE TECH with a focus on AI and Data Science.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, i) => (
              <TeamCard key={member.id} member={member} index={i} onOpenPortfolio={setActiveMember} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeMember && (
          <PortfolioModal member={activeMember} onClose={() => setActiveMember(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}