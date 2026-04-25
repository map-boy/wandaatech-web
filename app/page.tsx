import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { ConverterBanner } from '@/components/converter-banner'
import { About } from '@/components/about'
import { Project } from '@/components/project'
import { Team } from '@/components/team'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBar />
      <Header />

      <main>
        <Hero />
        <ConverterBanner />

        {/* Leaderboard CTA */}
        <section className="py-12 bg-emerald-500/5 border-y border-emerald-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                🏆 ML <span className="text-emerald-500">Leaderboard</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Submit your model predictions and compete with the club in real time.
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap uppercase tracking-tight"
            >
              Join the Competition →
            </Link>
          </div>
        </section>

        <About id="about" />
        <Project id="project" />
        <Team id="team" />
        <Contact id="contact" />
      </main>

      <Footer />
    </div>
  )
}