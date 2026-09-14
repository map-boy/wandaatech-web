import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LegalSubNav } from '@/components/legal'
import { Footer } from '@/components/site-footer'
import { Header } from '@/components/header'

/** Shared chrome for every policy page so they read as one document set. */
export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string
  updated: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            href="/"
            className="mb-8 flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-emerald-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <LegalSubNav />

          <header className="mb-12 border-b border-border pb-8">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
            {intro && (
              <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{intro}</p>
            )}
          </header>

          <div className="space-y-10">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
