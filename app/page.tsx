import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Project } from '@/components/project'
import { Team } from '@/components/team'
import { IntelligenceLab } from '@/components/intelligence-lab'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. This must be here to see the "NUMBER ONE" text */}
      <MarqueeBar /> 
      
      {/* 2. Your new foldable sidebar/header */}
      <Header /> 

      <main>
        <Hero />
        <About />
        <Project />
        <Team />
        
        {/* 3. Your modern sidebar-layout ML Lab */}
        <IntelligenceLab /> 
        
        <Contact />
      </main>
      
      <Footer />
    </div>
  )
}