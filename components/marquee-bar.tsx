'use client'

import { motion } from 'framer-motion'

// Define our futuristic color stops for the text
const sciFiColors = [
  "#10b981", // Emerald (Start)
  "#38bdf8", // Sky Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink (Flash)
  "#10b981"  // Emerald (Back)
];

const message = " IN WHATEVER YOU DO YOU MUST BE NUMBER ONE — VAF UBWENGE TECH  —";

export function MarqueeBar() {
  return (
    <div className="w-full bg-[#050509] overflow-hidden py-2.5 border-b-2 border-dashed border-emerald-950/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative z-50">
      
      {/* Background Neon "Scanner" Beam */}
      <motion.div 
        className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-xl"
        animate={{ x: ["-100%", "2000%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="flex whitespace-nowrap relative z-10">
        
        {/* We loop twice to make it seamless */}
        {[...Array(2)].map((_, loopIndex) => (
          <motion.div 
            key={loopIndex}
            className="flex shrink-0 items-center"
            animate={{ x: [0, "-100%"] }}
            transition={{ 
              duration: 25, // Adjusted speed for better readability
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...Array(5)].map((_, textIndex) => (
              <span key={textIndex} className="flex items-center mx-6 gap-6">
                
                {/* 1. Main Text with Pulsing Color Shift */}
                <motion.span 
                  className="font-black italic uppercase tracking-tighter text-sm md:text-base font-mono"
                  animate={{ color: sciFiColors }}
                  transition={{ 
                    duration: 6, // How fast the color changes
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  style={{ textShadow: "0 0 10px currentcolor" }} // "currentcolor" glows with the animation
                >
                  {message}
                </motion.span>

                {/* 2. Small "Football Scoreboard" decorative dot */}
                <motion.div 
                  className="w-2 h-2 rounded-full"
                  animate={{ 
                    backgroundColor: [sciFiColors[0], sciFiColors[2], sciFiColors[0]],
                    scale: [1, 1.3, 1] 
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