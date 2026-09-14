'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface HeroProps {
  headlines: string[]
  subtitle: string
  image: string
  primaryCta: string
  primaryHref: string
  secondaryCta: string
  secondaryHref: string
}

export function Hero({
  headlines,
  subtitle,
  image,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
}: HeroProps) {
  const lines = headlines.length > 0 ? headlines : ['Building the Future']
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (lines.length < 2) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % lines.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [lines.length])

  const words = (lines[current] ?? '').split(' ')

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src={image} alt="" fill className="object-cover" priority quality={90} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="space-y-8">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="skeuo-card inline-block px-10 py-8"
          >
            <h1 className="text-5xl font-bold tracking-tight text-foreground drop-shadow-xl md:text-7xl lg:text-8xl">
              {words.map((word, i) =>
                i === words.length - 1 ? (
                  <span key={i} className="skeuo-glow-text">
                    {word}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                ),
              )}
            </h1>
          </motion.div>

          <motion.p
            className="skeuo-inset mx-auto inline-block max-w-2xl px-8 py-3 text-xl text-foreground/90 md:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col justify-center gap-4 pt-8 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link href={primaryHref} className="skeuo-button px-8 py-4 font-bold text-foreground">
              <span className="skeuo-glow-text">{primaryCta}</span>
            </Link>
            <Link href={secondaryHref} className="skeuo-button px-8 py-4 font-bold text-foreground">
              {secondaryCta}
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 z-10 hidden -translate-x-1/2 transform md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="skeuo-inset flex h-10 w-6 justify-center rounded-full p-1">
          <div className="skeuo-glow-text h-2 w-1 rounded-full bg-current" />
        </div>
      </motion.div>
    </section>
  )
}
