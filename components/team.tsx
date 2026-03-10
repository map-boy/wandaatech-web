'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const teamMembers = [
  {
    id: 1,
    name: 'MUGISHA Alain Paisible',
    role: 'Chief Executive Officer CEO',
    image: '/010.jpg',
    bio: 'Visionary leader and founder, driving the company vision forward with a focus on data-driven innovation.',
    social: {
      linkedin: '#',
      email: 'mailto:mugishaalainpaisible@gmail.com',
    },
  },
  {
    id: 2,
    name: 'MUCUNGUZI Felix',
    role: 'Chief Operating Officer COO',
    image: '/004.jpg',
    bio: 'Operations expert ensuring smooth execution of all company initiatives and platform logistics.',
    social: {
      linkedin: '#',
      email: 'mailto:coo@wandaatech.com',
    },
  },
  {
    id: 3,
    name: 'MURENGERANTWALI Valentin',
    role: 'Chief Technology Officer CTO',
    image: '/IMG_0514.JPG',
    bio: 'Tech innovator building scalable solutions for African markets and leading our development team.',
    social: {
      linkedin: '#',
      email: 'mailto:cto@wandaatech.com',
    },
  },
  
]

function TeamCard({ member, index }: { member: typeof teamMembers[0], index: number }) {
  return (
    <motion.div
      className="group glass border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, borderColor: 'rgba(16, 185, 129, 0.3)' }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {/* Photo Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-4 flex-grow flex flex-col">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {member.role}
          </p>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
          {member.bio}
        </p>

        {/* Social Links */}
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <motion.a
            href={member.social.linkedin}
            className="p-2 rounded-lg glass-hover text-muted-foreground hover:text-emerald-500"
            whileHover={{ scale: 1.1 }}
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </motion.a>
          <motion.a
            href={member.social.email}
            className="p-2 rounded-lg glass-hover text-muted-foreground hover:text-emerald-500"
            whileHover={{ scale: 1.1 }}
            aria-label="Email"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}

export function Team() {
  return (
    <section id="team" className="py-20 sm:py-32 bg-background border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {/* Section Header */}
          <motion.div
            className="space-y-4 max-w-2xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Our Leadership
            </h2>
            <p className="text-lg text-muted-foreground">
              Meet the Year 1 Data Science students from ULK behind WANDAA TECH.
            </p>
          </motion.div>

          {/* Team Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <TeamCard key={member.id} member={member} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}