'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileType, ArrowRight } from 'lucide-react'

const features = [
  { icon: '📝', label: 'DOCX → PDF',      desc: 'Word to PDF instantly' },
  { icon: '🖼️', label: 'Image → PDF',     desc: 'Photos to document' },
  { icon: '📦', label: 'Compress PDF',    desc: 'MB → KB in seconds' },
  { icon: '🗜️', label: 'Compress Image', desc: 'Reduce image size' },
]

export function ConverterBanner() {
  return (
    <section className="py-16 sm:py-20 bg-background border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left — text */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3">
              <div className="skeuo-card p-2.5">
                <FileType className="w-6 h-6 skeuo-glow-text" />
              </div>
              <span className="text-xs font-black skeuo-button px-2.5 py-1 uppercase tracking-wider">
                Free Tool for Students
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Convert & Compress
                <span className="skeuo-glow-text"> Documents</span>
                <br />Instantly
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed skeuo-inset py-3 px-5">
                Need to submit your assignment as PDF? Compress a file that is too large?
                Convert Word documents, images, and more — all in your browser, completely private.
              </p>
            </div>

            <Link
              href="/converter"
              className="inline-flex items-center gap-3 px-8 py-4 skeuo-button font-bold"
            >
              <span className="skeuo-glow-text">Open File Converter</span>
              <ArrowRight className="w-5 h-5 skeuo-glow-text" />
            </Link>
          </motion.div>

          {/* Right — feature cards */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link href="/converter" className="group block">
                  <div className="skeuo-card h-full p-5">
                    <div className="text-3xl mb-3">{f.icon}</div>
                    <p className="font-bold text-foreground text-sm group-hover:skeuo-glow-text transition-colors">
                      {f.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}