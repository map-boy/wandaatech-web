'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from 'lucide-react'

const PHOTOS = [
  {
    id: 1,
    src: '/gallery/VAF-UBWENGE-TECH-TEAM.jpg',
    caption: 'VAF Ubwenge Tech Team',
    category: 'Team',
    year: '2026',
  },
  {
    id: 2,
    src: '/gallery/felix-convention.jpg',
    caption: 'Felix at Convention Center',
    category: 'Events',
    year: '2026',
  },
  {
    id: 3,
    src: '/gallery/felix_explanation.jpeg',
    caption: 'Felix — Project Explanation',
    category: 'Projects',
    year: '2026',
  },
  {
    id: 4,
    src: '/gallery/wandaa-explanation.jpeg',
    caption: 'WANDAA — Model Explanation',
    category: 'Lab',
    year: '2026',
  },
  {
    id: 5,
    src: '/gallery/viella-presentation.jpeg',
    caption: 'Viella — Presentation',
    category: 'Events',
    year: '2026',
  },
  {
    id: 6,
    src: '/gallery/pakistan-embassy.jpg',
    caption: 'Pakistan Embassy Visit',
    category: 'Events',
    year: '2026',
  },
  {
    id: 7,
    src: '/gallery/pakistan--embassy.jpg',
    caption: 'Pakistan Embassy — Meeting',
    category: 'Events',
    year: '2026',
  },
  {
    id: 8,
    src: '/gallery/zindi-competition.jpg',
    caption: 'Zindi ML Competition',
    category: 'Lab',
    year: '2026',
  },
  {
    id: 9,
    src: '/gallery/zindi-pic.jpg',
    caption: 'Zindi Competition Team',
    category: 'Lab',
    year: '2026',
  },
  {
    id: 10,
    src: '/gallery/training.jpg',
    caption: 'Team Training Session',
    category: 'Team',
    year: '2026',
  },
  {
    id: 11,
    src: '/gallery/opening-ceremony.jpg',
    caption: 'Opening Ceremony',
    category: 'Events',
    year: '2026',
  },
  {
    id: 12,
    src: '/gallery/picture-overview.jpg',
    caption: 'Picture of all attendees',
    category: 'Projects',
    year: '2026',
  },
  {
    id: 13,
    src: '/gallery/ambassada.jpg',
    caption: 'Ambassador Meeting',
    category: 'Events',
    year: '2026',
  },
  {
    id: 14,
    src: '/gallery/ambassador.jpg',
    caption: 'Ambassador Event',
    category: 'Events',
    year: '2026',
  },
  {
    id: 15,
    src: '/gallery/assistan.jpg',
    caption: ' Assistant at ambassader',
    category: 'Lab',
    year: '2026',
  },
  {
    id: 16,
    src: '/gallery/felix-presentation.jpg',
    caption: 'Felix — Live Presentation',
    category: 'Projects',
    year: '2026',
  },
  {
    id: 17,
    src: '/gallery/felix-wandaa.jpg',
    caption: 'Felix & WANDAA in Zindi',
    category: 'Lab',
    year: '2026',
  },
  {
    id: 18,
    src: '/gallery/valentin presentation.jpg',
    caption: 'Valentin — Presentation',
    category: 'Events',
    year: '2026',
  },
  {
    id: 19,
    src: '/gallery/valentin-prese.jpg',
    caption: 'Valentin — Stage',
    category: 'Events',
    year: '2026',
  },
  {
    id: 20,
    src: '/gallery/wandaa.jpg',
    caption: 'WANDAA — Showcase',
    category: 'Lab',
    year: '2026',
  },
]

const CATEGORIES = ['All', 'Team', 'Events', 'Projects', 'Lab'] as const
type Category = typeof CATEGORIES[number]

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [lightboxIndex, setLightboxIndex]   = useState<number | null>(null)

  const filtered = activeCategory === 'All'
    ? PHOTOS
    : PHOTOS.filter((p) => p.category === activeCategory)

  function openLightbox(id: number) {
    setLightboxIndex(filtered.findIndex((p) => p.id === id))
  }
  function closeLightbox() { setLightboxIndex(null) }
  function prev() { setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)) }
  function next() { setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length)) }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, filtered.length])

  const currentPhoto = lightboxIndex !== null ? filtered[lightboxIndex] : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBar />
      <Header />

      <main className="pt-32 pb-24">

        {/* Page Header */}
        <div className="container mx-auto px-6 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
            <Camera className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-mono text-[11px] font-bold uppercase tracking-widest">
              Visual Archive
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-foreground">
            Our <span className="text-emerald-500">Gallery</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl font-mono text-xs uppercase tracking-widest leading-relaxed">
            Moments from the lab, the field, and everything in between.
          </p>
        </div>

        {/* Category Filter */}
        <div className="container mx-auto px-6 mb-10">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
                    : 'border-border text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400 bg-white/5'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 opacity-60">
                    {PHOTOS.filter((p) => p.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="container mx-auto px-6">
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            <AnimatePresence>
              {filtered.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="break-inside-avoid mb-4 group relative cursor-pointer overflow-hidden rounded-2xl border border-border/40 hover:border-emerald-500/40 transition-all duration-300"
                  onClick={() => openLightbox(photo.id)}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                        {photo.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{photo.year}</span>
                    </div>
                    <p className="text-white text-sm font-bold leading-snug">{photo.caption}</p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span className="font-mono">Click to expand</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <Camera className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">No photos in this category yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentPhoto.src}
                alt={currentPhoto.caption}
                className="w-full max-h-[75vh] object-contain rounded-2xl"
              />
              <div className="mt-4 flex items-center justify-between px-1">
                <div>
                  <p className="text-white font-bold">{currentPhoto.caption}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      {currentPhoto.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{currentPhoto.year}</span>
                  </div>
                </div>
                <span className="text-slate-500 text-sm font-mono">
                  {(lightboxIndex ?? 0) + 1} / {filtered.length}
                </span>
              </div>

              <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 p-3 rounded-full bg-white/10 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-white transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 p-3 rounded-full bg-white/10 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>

            <button onClick={closeLightbox} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-red-500/20 border border-white/10 text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}