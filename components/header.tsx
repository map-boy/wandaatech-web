'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Info, Briefcase, Users, Mail, ShieldCheck, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { name: 'Home', href: '#', icon: Home },
  { name: 'About', href: '#about', icon: Info },
  { name: 'Easy GO', href: '#project', icon: Briefcase },
  { name: 'Team', href: '#team', icon: Users },
  { name: 'Contact', href: '#contact', icon: Mail },
  { name: 'Privacy', href: '/privacy', icon: ShieldCheck },
  { name: 'Terms', href: '/terms', icon: FileText },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile & Desktop Toggle Button (Always visible at top-left) */}
      <div className="fixed top-6 left-6 z-[100]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-emerald-500 text-slate-950 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-110 transition-transform active:scale-95"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Foldable Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Backdrop */}
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
              className="fixed top-0 left-0 h-full w-[280px] bg-slate-950 border-r border-emerald-500/20 z-[90] p-8 pt-24 shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                <div className="mb-8 px-4">
                  <h1 className="text-xl font-black text-white tracking-tighter uppercase">
                    VAF UBWENGE <span className="text-emerald-500">TECH</span>
                  </h1>
                  <p className="text-[10px] text-emerald-500/50 font-mono uppercase tracking-widest mt-1">Intelligence Systems</p>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between group px-4 py-4 rounded-xl hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white uppercase tracking-tight">
                          {item.name}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  ))}
                </nav>

                <div className="absolute bottom-10 left-8 right-8">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] text-slate-500 font-mono uppercase text-center">System Status: <span className="text-emerald-500">Online</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}