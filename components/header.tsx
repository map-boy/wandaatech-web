'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { ShieldCheck, FileText } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Changed href to "/" */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">WANDAA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {/* Anchor links for the home page sections */}
            {['About', 'Easy GO', 'Team', 'ULK', 'Contact'].map((item) => (
              <a
                key={item}
                href={`/#${item.toLowerCase().replace(' ', '')}`}
                className="text-sm text-muted-foreground hover:text-emerald-500 transition-colors"
              >
                {item}
              </a>
            ))}

            {/* NEW: Legal Pages Links */}
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4" />
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Terms
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-10 h-10 rounded-md glass hover:bg-emerald-500/10 transition-colors"
              aria-label="Toggle theme"
              title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
            >
              {mounted && (
                theme === 'dark' ? (
                  <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}