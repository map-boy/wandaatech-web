'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LegalSubNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Privacy Policy', href: '/privacy', icon: ShieldCheck },
    { name: 'Terms & Conditions', href: '/terms', icon: FileText },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-6 mb-12">
      <div className="flex skeuo-inset p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all rounded-lg",
                isActive
                  ? "skeuo-button"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "skeuo-glow-text" : "")} />
              <span className={isActive ? "skeuo-glow-text" : ""}>{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}