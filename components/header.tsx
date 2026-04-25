'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Home, Info, Briefcase, Users,
  Mail, ChevronRight, Sun, Moon, Zap, Microscope, FileType, Trophy, ClipboardList, UserPlus
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
  { name: 'Team',             href: '/#team',         icon: Users        },
  { name: 'Contact',          href: '/#contact',      icon: Mail         },
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
          className="p-3 bg-emerald-500 text-slate-950 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-110 transition-transform active:scale-95"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
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
              className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-slate-950 border-r border-emerald-500/20 z-[90] p-6 pt-24 shadow-2xl flex flex-col"
            >
              <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
                {/* Branding */}
                <div className="mb-2 px-2">
                  <h1 className="text-xl font-black text-slate-950 dark:text-white tracking-tighter uppercase">
                    VAF UBWENGE <span className="text-emerald-500">TECH</span>
                  </h1>
                  <p className="text-[10px] text-emerald-500/50 font-mono uppercase tracking-widest mt-1">Intelligence Systems</p>
                </div>

                {/* Theme Toggle */}
                {mounted && (
                  <div className="mb-6 mt-2 flex items-center justify-between p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[10px] text-slate-500 font-mono uppercase ml-2">Theme</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}
                      >
                        <Sun size={16} />
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}
                      >
                        <Moon size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const highlighted = HIGHLIGHTED.includes(item.name)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between group px-4 py-4 rounded-xl transition-all border ${
                          highlighted
                            ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                            : 'border-transparent hover:bg-emerald-500/10 hover:border-emerald-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon
                            size={20}
                            className={`transition-colors ${
                              highlighted
                                ? 'text-emerald-500'
                                : 'text-slate-400 group-hover:text-emerald-500'
                            }`}
                          />
                          <span className={`text-sm font-bold uppercase tracking-tight transition-colors ${
                            highlighted
                              ? 'text-emerald-500'
                              : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-500'
                          }`}>
                            {item.name}
                          </span>
                          {item.name === 'Competitions' && (
                            <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Status Section */}
              <div className="mt-auto pt-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-[10px] text-slate-500 font-mono uppercase text-center">
                    Status: <span className="text-emerald-500">Online</span>
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