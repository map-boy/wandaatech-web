'use client'

import { motion } from 'framer-motion'

const teamMembers = [
  {
    id: 1,
    name: 'Team Member 1',
    role: 'Chief Executive Officer',
    bio: 'Visionary leader and founder, driving the company vision forward.',
    social: {
      linkedin: '#',
      email: 'mailto:member1@wandaatech.com',
    },
  },
  {
    id: 2,
    name: 'Team Member 2',
    role: 'Chief Operating Officer',
    bio: 'Operations expert ensuring smooth execution of all company initiatives.',
    social: {
      linkedin: '#',
      email: 'mailto:member2@wandaatech.com',
    },
  },
  {
    id: 3,
    name: 'Team Member 3',
    role: 'Chief Technology Officer',
    bio: 'Tech innovator building scalable solutions for African markets.',
    social: {
      linkedin: '#',
      email: 'mailto:member3@wandaatech.com',
    },
  },
]

function TeamCard({ member, index }: { member: typeof teamMembers[0], index: number }) {
  return (
    <motion.div
      className="group glass border border-white/10 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, borderColor: 'rgba(255, 255, 255, 0.3)' }}
      transition={{ delay: index * 0.2, duration: 0.4 }}
      viewport={{ once: true }}
    >
      {/* Image Placeholder */}
      <motion.div
        className="aspect-square bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden relative"
        whileHover={{ backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)' }}
      >
        <div className="text-center space-y-2">
          <motion.div
            className="w-16 h-16 bg-white/10 rounded-full mx-auto flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <p className="text-xs text-muted-foreground">Add photo</p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <motion.div className="space-y-2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.2 + 0.3 }}>
          <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
          <p className="text-sm font-medium text-primary">{member.role}</p>
        </motion.div>

        <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>

        {/* Social Links */}
        <div className="flex gap-3 pt-4">
          <motion.a
            href={member.social.linkedin}
            className="w-9 h-9 rounded-lg glass text-foreground flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </motion.a>
          <motion.a
            href={member.social.email}
            className="w-9 h-9 rounded-lg glass text-foreground flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
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
        <div className="space-y-12">
          {/* Section Header */}
          <motion.div
            className="space-y-4 max-w-2xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Leadership Team
            </h2>
            <p className="text-lg text-muted-foreground">
              Meet the visionary minds behind WANDAA TECH
            </p>
          </motion.div>

          {/* Team Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
