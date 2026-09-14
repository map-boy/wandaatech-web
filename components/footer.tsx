'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { Linkedin, Twitter, Github, Mail } from 'lucide-react'
import { CookieSettingsButton } from '@/components/legal'

/**
 * Presentational footer. Use `Footer` from components/site-footer.tsx in
 * pages — it feeds this component the admin-managed values.
 */
interface FooterLinks {
  blurb?: string
  copyright?: string
  email?: string
  linkedin?: string
  twitter?: string
  github?: string
}

const COMPANY_LINKS = [
  { name: 'About', href: '/company' },
  { name: 'Leadership', href: '/team' },
  { name: 'Insights', href: '/insights' },
  { name: 'Contact', href: '/contact' },
]

const PRODUCT_LINKS = [
  { name: 'Projects', href: '/projects' },
  { name: 'Intelligence Lab', href: '/lab' },
  { name: 'Competitions', href: '/competitions' },
  { name: 'Gallery', href: '/gallery' },
]

const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Cookie Policy', href: '/cookie-policy' },
  { name: 'Disclaimer', href: '/disclaimer' },
]

export function FooterView({
  blurb = 'Building innovative digital solutions for Africa',
  copyright = 'VAF UBWENGE TECH',
  email = 'support@wandaatech.rw',
  linkedin = '',
  twitter = '',
  github = '',
}: FooterLinks) {
  const currentYear = new Date().getFullYear()
  const router = useRouter()
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Twenty clicks on the wordmark opens the admin panel — there is no visible
  // link to it anywhere on the public site.
  function handleLogoClick() {
    clickCount.current += 1
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

  const socials = [
    { href: linkedin, icon: Linkedin, label: 'LinkedIn' },
    { href: twitter, icon: Twitter, label: 'X' },
    { href: github, icon: Github, label: 'GitHub' },
    { href: email ? `mailto:${email}` : '', icon: Mail, label: 'Email' },
  ].filter((s) => s.href)

  return (
    <footer className="border-t border-primary/20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex cursor-default select-none items-center gap-2" onClick={handleLogoClick}>
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary-foreground">
                <span className="text-sm font-bold text-primary">VAF</span>
              </div>
              <span className="text-lg font-bold">{copyright}</span>
            </div>
            <p className="text-sm text-primary-foreground/70">{blurb}</p>

            {socials.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="What we build" links={PRODUCT_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="border-t border-primary/20" />

        <div className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-primary-foreground/70 sm:flex-row">
          <p>
            © {currentYear} {copyright}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <CookieSettingsButton />
            <Link href="/privacy" className="transition-colors hover:text-primary-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { name: string; href: string }[]
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{title}</h3>
      <ul className="space-y-2 text-sm text-primary-foreground/70">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-primary-foreground">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
