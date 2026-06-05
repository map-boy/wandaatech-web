import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { ConverterBanner } from '@/components/converter-banner'
import { About } from '@/components/about'
import { Project } from '@/components/project'
import { Team } from '@/components/team'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import Image from 'next/image'

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

        {/* ── Gallery Preview ── */}
        <section className="py-24 border-t border-border/40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <span className="text-emerald-500 font-mono text-[11px] font-bold uppercase tracking-widest">📸 Visual Archive</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                  Our <span className="text-emerald-500">Gallery</span>
                </h2>
                <p className="text-muted-foreground mt-3 text-sm font-mono uppercase tracking-widest">
                  Moments from the lab, the field, and everything in between.
                </p>
              </div>
              <Link
                href="/gallery"
                className="shrink-0 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 uppercase tracking-tight text-sm"
              >
                View All Photos →
              </Link>
            </div>

            {/* Preview grid — 6 photos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { src: '/gallery/VAF-UBWENGE-TECH-TEAM.jpg', caption: 'VAF Team' },
                { src: '/gallery/felix-convention.jpg',       caption: 'Convention' },
                { src: '/gallery/zindi-competition.jpg',      caption: 'Zindi Competition' },
                { src: '/gallery/opening-ceremony.jpg',       caption: 'Opening Ceremony' },
                { src: '/gallery/felix-wandaa.jpg',           caption: 'WANDAA Demo' },
                { src: '/gallery/pakistan-embassy.jpg',       caption: 'Embassy Visit' },
              ].map((photo) => (
                <Link key={photo.src} href="/gallery" className="group relative overflow-hidden rounded-2xl aspect-video border border-border/40 hover:border-emerald-500/40 transition-all">
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-xs font-bold">{photo.caption}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}