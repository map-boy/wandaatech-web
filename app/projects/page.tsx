import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { Project } from '@/components/project'
import { Footer } from '@/components/footer'

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarqueeBar /> 
      <Header /> 

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
            Our <span className="text-emerald-500">Projects</span>
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl font-mono text-xs uppercase tracking-widest">
            VAF Intelligence Deployment Archive
          </p>
        </div>

        {/* This displays your existing projects component */}
        <Project />
      </main>
      
      <Footer />
    </div>
  )
}