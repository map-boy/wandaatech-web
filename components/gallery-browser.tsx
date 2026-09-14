'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from 'lucide-react'
import type { Photo } from '@/lib/gallery-defaults'

/** Filterable masonry grid with a keyboard-navigable lightbox. */
export function GalleryBrowser({ photos }: { photos: Photo[] }) {
  const categories = useMemo(() => {
    const found = Array.from(new Set(photos.map((p) => p.category).filter(Boolean)))
    return ['All', ...found]
  }, [photos])

  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = useMemo(
    () => (activeCategory === 'All' ? photos : photos.filter((p) => p.category === activeCategory)),
    [photos, activeCategory],
  )

  // A category change can leave the lightbox pointing past the end of the list.
  useEffect(() => {
    setLightboxIndex(null)
  }, [activeCategory])

  useEffect(() => {
    if (lightboxIndex === null) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length))
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, filtered.length])

  const currentPhoto = lightboxIndex !== null ? filtered[lightboxIndex] : null

  return (
    <>
      {categories.length > 2 && (
        <div className="container mx-auto mb-10 px-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'border-border bg-white/5 text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 opacity-60">
                    {photos.filter((p) => p.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6">
        <motion.div layout className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4">
          <AnimatePresence>
            {filtered.map((photo, i) => (
              <motion.button
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.5) }}
                className="group relative mb-4 block w-full cursor-pointer overflow-hidden break-inside-avoid rounded-2xl border border-border/40 text-left transition-all duration-300 hover:border-emerald-500/40"
                onClick={() => setLightboxIndex(i)}
                aria-label={`Expand photo: ${photo.caption}`}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {photo.category && (
                    <span className="mb-2 w-fit rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      {photo.category}
                    </span>
                  )}
                  <p className="text-sm font-bold leading-snug text-white">{photo.caption}</p>
                  <span className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                    <ZoomIn className="h-3.5 w-3.5" />
                    <span className="font-mono">Click to expand</span>
                  </span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <Camera className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground">No photos in this category yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-label={currentPhoto.caption}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentPhoto.src}
                alt={currentPhoto.caption}
                className="max-h-[75vh] w-full rounded-2xl object-contain"
              />
              <div className="mt-4 flex items-center justify-between px-1">
                <div>
                  <p className="font-bold text-white">{currentPhoto.caption}</p>
                  {currentPhoto.category && (
                    <span className="mt-1 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      {currentPhoto.category}
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm text-slate-500">
                  {(lightboxIndex ?? 0) + 1} / {filtered.length}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length))
                }}
                aria-label="Previous photo"
                className="absolute left-0 top-1/2 -translate-x-14 -translate-y-1/2 rounded-full border border-white/10 bg-white/10 p-3 text-white transition-all hover:border-emerald-500/30 hover:bg-emerald-500/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length))
                }}
                aria-label="Next photo"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 rounded-full border border-white/10 bg-white/10 p-3 text-white transition-all hover:border-emerald-500/30 hover:bg-emerald-500/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.div>

            <button
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
              className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/10 p-2 text-white transition-all hover:bg-red-500/20"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
