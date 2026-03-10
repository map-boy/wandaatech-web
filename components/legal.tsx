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
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-6 border-b border-border mb-12">
      <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-background text-emerald-500 shadow-sm border border-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-emerald-500" : "")} />
              {tab.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}