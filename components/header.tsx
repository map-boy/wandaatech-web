'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Home, Info, Briefcase, Users,
  Mail, ChevronRight, Sun, Moon, Zap, Microscope, FileType, Trophy, ClipboardList, UserPlus, Camera, BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

const navItems = [
  { name: 'Home',             href: '/',              icon: Home          },
  { name: 'Company',          href: '/company',       icon: Info          },
  { name: 'Leadership',       href: '/team',          icon: Users         },
  { name: 'Projects',         href: '/projects',      icon: Briefcase     },
  { name: 'Insights',         href: '/insights',      icon: BookOpen      },
  { name: 'Competitions',     href: '/competitions',  icon: ClipboardList },
  { name: 'Converter',        href: '/converter',     icon: FileType      },
  { name: 'QR Engine',        href: '/qr-engine',     icon: Zap           },
  { name: 'Intelligence Lab', href: '/lab',           icon: Microscope    },
  { name: 'Gallery',          href: '/gallery',       icon: Camera        },
  { name: 'Contact',          href: '/contact',       icon: Mail          },
]

// Items that get the highlighted emerald style
const HIGHLIGHTED = ['Company', 'Leadership', 'Competitions']

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // The primary links, surfaced directly in the bar. Everything else stays in
  // the drawer. Google lists weak site navigation among the common reasons a
  // site is judged not ready for ads, and a menu that only exists behind a
  // hamburger gives neither visitors nor a crawler a way to see the site's
  // structure.
  const primaryNav = navItems.filter((item) =>
    ['Home', 'Company', 'Leadership', 'Projects', 'Insights', 'Competitions', 'Contact'].includes(item.name),
  )

  return (
    <>
      {/* Persistent top bar */}
      {/* Sticky rather than fixed: it stays in the document flow, so it sits
          below the marquee bar on pages that have one instead of covering it. */}
      <header className="sticky top-0 z-[95] border-b border-border/40 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="skeuo-button shrink-0 p-2.5 transition-transform active:scale-95"
          >
            {isOpen ? <X size={20} className="skeuo-glow-text" /> : <Menu size={20} className="skeuo-glow-text" />}
          </button>

          <Link href="/" className="shrink-0 text-sm font-black uppercase tracking-tighter text-foreground">
            VAF UBWENGE <span className="skeuo-glow-text">TECH</span>
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-[13px] font-bold uppercase tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/contact"
            className="skeuo-button ml-auto shrink-0 px-4 py-2 text-[11px] font-black uppercase tracking-wide lg:ml-0"
          >
            <span className="skeuo-glow-text">Get in touch</span>
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[94]"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="skeuo-card fixed top-0 left-0 h-full w-[280px] z-[96] p-6 pt-24 rounded-none flex flex-col overflow-y-auto"
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