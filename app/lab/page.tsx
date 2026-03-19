import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { IntelligenceLab } from '@/components/intelligence-lab' // Ensure this path is correct
import { Footer } from '@/components/footer'

export default function LabPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Navigation & Global Branding */}
      <MarqueeBar /> 
      <Header /> 

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 mb-4 border border-emerald-500/20">
            <span className="text-emerald-500 font-mono text-xs font-bold uppercase tracking-widest">
              Core Division: Research & Development
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            Intelligence <span className="text-emerald-500">Lab</span>
          </h1>
          <p className="text-slate-400 mt-6 max-w-2xl font-mono text-xs uppercase tracking-[0.2em] leading-relaxed">
            Advanced Machine Learning Architectures • Predictive Analytics • Computer Vision Systems
          </p>
        </div>

        {/* 2. Your ML/AI Component */}
        <section className="border-t border-emerald-500/10 pt-10">
          <IntelligenceLab /> 
        </section>
      </main>
      
      <Footer />
    </div>
  )
}