'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const sciFiColors = ["#10b981", "#38bdf8", "#8b5cf6", "#ec4899", "#10b981"];
const message = " IN WHATEVER YOU DO YOU MUST BE NUMBER ONE — VAF UBWENGE TECH —";

export function MarqueeBar() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className={`w-full overflow-hidden py-2.5 border-b-2 border-dashed border-emerald-950/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative z-50 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#050509]' : 'bg-slate-50'
    }`}>
      
      {/* Background Scanner - Duration slowed slightly for mobile smoothness */}
      <motion.div 
        className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-xl"
        animate={{ x: ["-100%", "2000%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      <div className="flex whitespace-nowrap relative z-10">
        {[...Array(2)].map((_, loopIndex) => (
          <motion.div 
            key={loopIndex}
            className="flex shrink-0 items-center"
            animate={{ x: [0, "-100%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(5)].map((_, textIndex) => (
              <span key={textIndex} className="flex items-center mx-4 md:mx-6 gap-4 md:gap-6">
                <motion.span 
                  className="font-black italic uppercase tracking-tighter text-xs sm:text-sm md:text-base font-mono"
                  animate={{ color: sciFiColors }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  style={{ textShadow: "0 0 10px currentcolor" }}
                >
                  {message}
                </motion.span>
                <motion.div 
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                  animate={{ 
                    backgroundColor: [sciFiColors[0], sciFiColors[2], sciFiColors[0]],
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}