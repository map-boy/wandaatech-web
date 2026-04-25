'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const router = useRouter()
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLogoClick() {
    clickCount.current += 1

    // Reset counter after 5 seconds of inactivity
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0
    }, 5000)

    if (clickCount.current >= 20) {
      clickCount.current = 0
      if (clickTimer.current) clearTimeout(clickTimer.current)
      router.push('/admin')
    }
  }

  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16">
          {/* Brand — clicking 20 times triggers admin */}
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 cursor-default select-none"
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 bg-primary-foreground rounded-sm flex items-center justify-center">
                <span className="text-primary font-bold text-sm">VAF</span>
              </div>
              <span className="font-bold text-lg">VAF UBWENGE TECH</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Building innovative digital solutions for Africa
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link href="/#project" className="hover:text-primary-foreground transition-colors">
                  Easy GO
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-primary-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-primary-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link href="/#about" className="hover:text-primary-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#team" className="hover:text-primary-foreground transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link href="/#blog" className="hover:text-primary-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-semibold">Connect</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <a href="mailto:hello@wandaatech.com" className="hover:text-primary-foreground transition-colors">
                  Email
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary/20" />

        {/* Bottom */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
          <p>
            © {currentYear} VAF UBWENGE TECH. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}