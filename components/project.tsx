'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const projectFeatures = [
  'Live GPS Tracking',
  'Price Prediction AI',
  'Mobile Money Integration',
  'Driver Management UI',
  'Real-time Logistics Analytics',
  'Kigali-wide Coverage'
]

export function Project() {
  return (
    <section id="project" className="py-20 sm:py-32 bg-background border-b border-border/50 overflow-hidden">
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
            <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium">
              Revolutionizing logistics with Easy GO
            </p>
          </motion.div>

          {/* Project Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Project Image/Logo Container */}
            <motion.div
              className="relative group aspect-square rounded-3xl glass border border-white/10 flex items-center justify-center p-12 overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              {/* Dynamic Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              
              <Image
                src="/Gemini_Generated_Image_i81dxxi81dxxi81d.png"
                alt="Easy GO Logo"
                width={500}
                height={500}
                className="relative z-10 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                priority
              />

              {/* Decorative Corner Elements */}
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-xl" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-sky-500/30 rounded-br-xl" />
            </motion.div>

            {/* Right: Content & Features */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-3xl font-bold text-foreground">
                  Easy GO Delivery Platform
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Developed as a comprehensive solution for local commerce, Easy GO combines 
                  advanced geospatial tracking with machine learning to predict delivery costs 
                  accurately and connect users with efficient transport options across the city.
                </p>
              </motion.div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {projectFeatures.map((feature, i) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-3 p-3 rounded-xl glass border border-white/5 hover:border-emerald-500/30 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-4"
              >
                <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                  View Case Study
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}