import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { ConverterBanner } from '@/components/converter-banner'
import { About } from '@/components/about'
import { Project } from '@/components/project'
import { Team } from '@/components/team'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBar />
      <Header />

      <main>
        <Hero />
        <ConverterBanner />
        <About id="about" />
        <Project id="project" />
        <Team id="team" />
        <Contact id="contact" />
      </main>

      <Footer />
    </div>
  )
}