'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function University() {
  return (
    <section id="university" className="py-20 sm:py-32 bg-secondary/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left - High Quality Image of ULK */}
          <motion.div 
            className="relative aspect-video lg:aspect-square rounded-3xl overflow-hidden border border-border shadow-2xl group"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/ULK-Masters-Administration-building.jpg"
              alt="ULK Administration Building"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            {/* Gradient Overlay for professional look */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-8 left-8 right-8">
              <motion.div 
                className="glass p-4 rounded-xl border border-white/10 inline-block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-foreground font-bold text-lg">Kigali Campus</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Headquarters of Innovation</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content Area */}
          <div className="space-y-10">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                Rooted in Excellence
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                WANDAA TECH is proudly founded and operated within the <strong>Université Libre de Kigali (ULK)</strong> ecosystem. As Year 1 Data Science students, we leverage the university's world-class environment to bridge the gap between academic theory and real-world technological solutions.
              </p>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-8">
              <motion.div 
                className="space-y-2 p-6 rounded-2xl glass border border-white/5"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-4xl font-bold text-emerald-600">3</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Founding Members</p>
              </motion.div>
              <motion.div 
                className="space-y-2 p-6 rounded-2xl glass border border-white/5"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-4xl font-bold text-sky-600">L1</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Data Science Year</p>
              </motion.div>
            </div>

            {/* Key Academic Pillars */}
            <div className="space-y-4">
              {[
                'Data-driven approach to local problem-solving',
                'Hands-on experience in tech entrepreneurship',
                'Strong emphasis on research and development',
              ].map((point, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-foreground font-medium">{point}</p>
                </motion.div>
              ))}
            </div>

            {/* University Link */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <a 
                href="https://ulk.ac.rw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
              >
                Visit ULK Website
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}