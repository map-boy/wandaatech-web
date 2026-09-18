'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight, Clock, Tag, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { STATIC_ARTICLES } from '@/lib/articles-static'

const projectFeatures = [
  'Live GPS Tracking',
  'Price Prediction AI',
  'Mobile Money Integration',
  'Driver Management UI',
  'Real-time Logistics Analytics',
  'Kigali-wide Coverage'
]

const tagStyles: Record<string, string> = {
  emerald: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  sky:     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  violet:  'bg-amber-700/10 text-amber-600 border-amber-700/20',
}

// Card metadata is derived from the shared article module rather than
// duplicated here, so the cards and the pages they link to stay in sync.
const TAG_COLORS: Record<string, string> = {
  'Behind the Build': 'emerald',
  Engineering: 'sky',
  Industry: 'amber',
  'Startup Life': 'violet',
  Product: 'emerald',
  Research: 'sky',
}

const blogPosts = STATIC_ARTICLES.map((a) => ({
  slug: a.slug,
  tag: a.tag,
  tagColor: TAG_COLORS[a.tag] ?? 'emerald',
  title: a.title,
  excerpt: a.excerpt,
  readTime: a.readTime,
  date: new Date(a.published_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }),
}))

// ─── MAIN EXPORT ───
export function Project({ id = 'project' }: { id?: string } = {}) {
  const [featured, ...rest] = blogPosts

  return (
    <section id={id} className="py-20 sm:py-32 bg-background border-b border-border/50 overflow-hidden">
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
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              Our Flagship Project
            </h2>
            <p className="text-lg text-amber-600 dark:text-amber-400 font-medium">
              Revolutionizing logistics with Easy GO
            </p>
          </motion.div>

          {/* Project Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <motion.div
              className="skeuo-card relative group aspect-square flex items-center justify-center p-12 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <Image
                src="/Gemini_Generated_Image_i81dxxi81dxxi81d.png"
                alt="Easy GO Logo"
                width={500}
                height={500}
                className="relative z-10 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                priority
              />
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-amber-500/30 rounded-tl-xl" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-yellow-500/30 rounded-br-xl" />
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-3xl font-bold text-foreground">Easy GO Delivery Platform</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Developed as a comprehensive solution for local commerce, Easy GO combines
                  advanced geospatial tracking with machine learning to predict delivery costs
                  accurately and connect users with efficient transport options across the city.
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-4">
                {projectFeatures.map((feature, i) => (
                  <motion.div
                    key={feature}
                    className="skeuo-inset flex items-center gap-3 p-3 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="skeuo-button w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 skeuo-glow-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-4"
              >
                <a
                  href="#case-study"
                  className="skeuo-button inline-flex items-center gap-3 px-8 py-4 font-bold"
                >
                  <span className="skeuo-glow-text">Read the case study</span>
                  <ChevronDown className="w-5 h-5 skeuo-glow-text" />
                </a>
              </motion.div>
            </div>
          </div>

          {/* CASE STUDY — always rendered so it is in the server HTML */}
          <div id="case-study" className="space-y-10 pt-4">
                <div className="pb-6 border-b border-border/50">
                  <h3 className="text-3xl font-bold text-foreground tracking-tight">Easy GO — Case Study</h3>
                  <p className="text-muted-foreground mt-1">
                    Engineering notes, product decisions, and lessons from building Kigali&apos;s delivery platform.
                  </p>
                </div>

                {/* Article cards — each links to its own page under /insights */}
                <div className="space-y-10">
                      {/* Featured card */}
                      <Link
                        href={`/insights/${featured.slug}`}
                        className="group block cursor-pointer"
                      >
                        <div className="skeuo-card relative p-8 sm:p-12 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold px-3 py-1 skeuo-inset ${tagStyles[featured.tagColor]}`}>
                                  {featured.tag}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {featured.readTime}
                                </span>
                              </div>
                              <h4 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug group-hover:text-amber-400 transition-colors">
                                {featured.title}
                              </h4>
                              <p className="text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                              <div className="flex items-center gap-2 text-amber-500 font-medium">
                                Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                            <div className="hidden lg:flex items-center justify-center skeuo-inset aspect-video">
                              <div className="text-center space-y-2 p-8">
                                <div className="text-5xl font-black text-amber-500/20 tracking-tighter">EASY GO</div>
                                <div className="text-xs text-muted-foreground/50 uppercase tracking-widest">VAF UBWENGE TECH</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Remaining cards */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rest.map((post, i) => (
                          <motion.div
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                          >
                            <Link href={`/insights/${post.slug}`} className="group block cursor-pointer">
                            <div className="h-full skeuo-card p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold px-3 py-1 skeuo-inset ${tagStyles[post.tagColor]}`}>
                                  {post.tag}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {post.readTime}
                                </span>
                              </div>
                              <h4 className="font-bold text-foreground leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                                {post.title}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                {post.excerpt}
                              </p>
                              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" /> {post.date}
                                </span>
                                <span className="flex items-center gap-1 text-amber-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  Read <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/insights"
                    className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
                  >
                    <span className="skeuo-glow-text">Read all articles</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
          </div>

        </div>
      </div>
    </section>
  )
}