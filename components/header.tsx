'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Home, Info, Briefcase, Users,
  Mail, ChevronRight, Sun, Moon, Zap, Microscope, FileType, Trophy, ClipboardList, UserPlus, Camera
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

const navItems = [
  { name: 'Home',             href: '/',              icon: Home         },
  { name: 'Converter',        href: '/converter',     icon: FileType     },
  { name: 'Competitions',     href: '/competitions',  icon: ClipboardList },
  { name: 'About',            href: '/#about',        icon: Info         },
  { name: 'Projects',         href: '/projects',      icon: Briefcase    },
  { name: 'QR Engine',        href: '/qr-engine',     icon: Zap          },
  { name: 'Intelligence Lab', href: '/lab',           icon: Microscope   },
  { name: 'Gallery',          href: '/gallery',       icon: Camera       },
  { name: 'Team',             href: '/#team',         icon: Users        },
]

// Items that get the highlighted emerald style
const HIGHLIGHTED = ['Converter', 'Competitions', 'Leaderboard', 'Register']

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Mobile-Friendly Toggle Button */}
      <div className="fixed top-6 left-6 z-[100]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="skeuo-button p-3 hover:scale-110 transition-transform active:scale-95"
        >
          {isOpen ? <X size={24} className="skeuo-glow-text" /> : <Menu size={24} className="skeuo-glow-text" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="skeuo-card fixed top-0 left-0 h-full w-[280px] z-[90] p-6 pt-24 rounded-none flex flex-col"
            >
              <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
                {/* Branding */}
                <div className="mb-2 px-2">
                  <h1 className="text-xl font-black text-foreground tracking-tighter uppercase">
                    VAF UBWENGE <span className="skeuo-glow-text">TECH</span>
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">Intelligence Systems</p>
                </div>

                {/* Theme Toggle */}
                {mounted && (
                  <div className="mb-6 mt-2 flex items-center justify-between skeuo-inset p-2">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase ml-2">Theme</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'skeuo-button' : 'text-muted-foreground'}`}
                      >
                        <Sun size={16} className={theme === 'light' ? 'skeuo-glow-text' : ''} />
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'skeuo-button' : 'text-muted-foreground'}`}
                      >
                        <Moon size={16} className={theme === 'dark' ? 'skeuo-glow-text' : ''} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const highlighted = HIGHLIGHTED.includes(item.name)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between group px-4 py-4 transition-all ${
                          highlighted ? 'skeuo-button' : 'skeuo-inset hover:skeuo-button'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon
                            size={20}
                            className={highlighted ? 'skeuo-glow-text' : 'text-muted-foreground group-hover:skeuo-glow-text transition-colors'}
                          />
                          <span className={`text-sm font-bold uppercase tracking-tight transition-colors ${
                            highlighted ? 'skeuo-glow-text' : 'text-foreground/80 group-hover:skeuo-glow-text'
                          }`}>
                            {item.name}
                          </span>
                          {item.name === 'Competitions' && (
                            <span className="text-[9px] font-black skeuo-button px-1.5 py-0.5 uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground group-hover:skeuo-glow-text opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Status Section */}
              <div className="mt-auto pt-4">
                <div className="skeuo-inset p-4">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase text-center">
                    Status: <span className="skeuo-glow-text">Online</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}