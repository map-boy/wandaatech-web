'use client'

import { motion } from 'framer-motion'

export function Project() {
  return (
    <section id="project" className="py-20 sm:py-32 bg-background border-b border-border/50">
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
              Our First Project
            </h2>
            <p className="text-lg text-muted-foreground">
              Meet Easy GO - our flagship product
            </p>
          </motion.div>

          {/* Project Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Project Image */}
            <motion.div
              className="glass border border-white/10 rounded-2xl aspect-square flex items-center justify-center overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.2)' }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center space-y-4 p-8">
                <div className="w-24 h-24 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground">Easy GO Demo</h4>
                <p className="text-sm text-muted-foreground">Product showcase image</p>
              </div>
            </motion.div>

            {/* Project Details */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <h3 className="text-4xl font-bold text-foreground">
                  Easy GO
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A smart delivery platform that makes it incredibly easy for users to order food, parcels, shop items, and pharmacy products—and receive them quickly.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Key Features</h4>
                <div className="space-y-3">
                  {[
                    'Fast & Reliable Delivery',
                    'Multi-Category Support',
                    'Real-time Order Tracking',
                    'Secure Payment Options',
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="w-6 h-6 rounded-full glass flex items-center justify-center flex-shrink-0"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      >
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                      <span className="text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More About Easy GO
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
