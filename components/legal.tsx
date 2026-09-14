'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, FileText, Cookie, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LegalSubNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Privacy', href: '/privacy', icon: ShieldCheck },
    { name: 'Terms', href: '/terms', icon: FileText },
    { name: 'Cookies', href: '/cookie-policy', icon: Cookie },
    { name: 'Disclaimer', href: '/disclaimer', icon: AlertTriangle },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-6 mb-12">
      <div className="flex flex-wrap justify-center skeuo-inset p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all rounded-lg',
                isActive ? 'skeuo-button' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'skeuo-glow-text' : '')} />
              <span className={isActive ? 'skeuo-glow-text' : ''}>{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/** Re-opens the cookie banner. Required so visitors can withdraw consent. */
export function CookieSettingsButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('vaf-open-consent'))}
      className={className || 'underline hover:text-foreground transition-colors'}
    >
      Cookie settings
    </button>
  )
}
