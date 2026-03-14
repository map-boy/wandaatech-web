'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { MessageCircle, Mail } from 'lucide-react'

const teamMembers = [
  {
    id: 1,
    name: 'MUGISHA Alain Paisible',
    role: 'Chief Executive Officer CEO',
    image: '/010.jpg',
    bio: 'Visionary leader and founder, driving the company vision forward with a focus on data-driven innovation.',
    social: {
      whatsapp: 'https://wa.me/250780867473?text=Hello%20Alain,%20I%20am%20contacting%20you%20from%20WANDAA%20TECH.',
      email: 'mailto:mugishaalainpaisible@gmail.com?subject=Inquiry%20regarding%20WANDAA%20TECH&body=Hello%20Alain%2C%0A%0AI%20am%20reaching%20out%20to%20discuss...',
    },
  },
  {
    id: 2,
    name: 'MUCUNGUZI Felix',
    role: 'Chief Operating Officer COO',
    image: '/004.jpg',
    bio: 'Operations expert ensuring smooth execution of all company initiatives and platform logistics.',
    social: {
      whatsapp: 'https://wa.me/250789136987?text=Hello%20Felix,%20I%20am%20contacting%20you%20from%20WANDAA%20TECH.',
      email: 'mailto:mucunguzifelix85@gmail.com?subject=Inquiry%20regarding%20WANDAA%20TECH%20Operations&body=Hello%20Felix%2C%0A%0AI%20am%20reaching%20out%20to%20discuss...',
    },
  },
  {
    id: 3,
    name: 'MURENGERANTWALI Valentin',
    role: 'Chief Technology Officer CTO',
    image: '/IMG_0514.JPG',
    bio: 'Tech innovator building scalable solutions for African markets and leading our development team.',
    social: {
      whatsapp: 'https://wa.me/250798582533?text=Hello%20Valentin,%20I%20am%20contacting%20you%20from%20WANDAA%20TECH.',
      email: 'mailto:ishimwevarente@gmail.com?subject=Technical%20Inquiry%20-%20WANDAA%20TECH&body=Hello%20Valentin%2C%0A%0AI%20am%20reaching%20out%20to%20discuss%20the%20technical...',
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
            href={member.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
            whileHover={{ scale: 1.1 }}
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.a>
          
          <motion.a
            href={member.social.email}
            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
            whileHover={{ scale: 1.1 }}
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
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
              Leading the digital transformation at WANDAA TECH with a focus on AI and Data Science.
            </p>
          </motion.div>

          {/* Team Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <TeamCard key={member.id} member={member} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}