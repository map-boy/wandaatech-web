import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Project } from '@/components/project'
import { Team } from '@/components/team'
import { University } from '@/components/university'
import { Gallery } from '@/components/gallery'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <About />
        <Project />
        <Team />
        <University />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
