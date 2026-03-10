'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function Hero() {
  const [current, setCurrent] = useState(0)
  const headlines = [
    'Building the Future',
    'Innovating with Data',
    'Creating Smart Solutions'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % headlines.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Professional Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/012.jpg"
          alt="WANDAA TECH Team"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Modern Blue-Green Glass Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground drop-shadow-xl">
              {headlines[current]}
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full py-2 px-8 border border-white/20 inline-block shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Student-led innovation at ULK
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Our Work
            </motion.button>
            <motion.button
              className="px-8 py-4 glass text-foreground font-bold rounded-xl hover:bg-white/10 border border-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Animated Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-emerald-500 rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}