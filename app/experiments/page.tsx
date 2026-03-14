import { MLLab } from '@/components/ml-lab'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function ExperimentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20 bg-background">
        <div className="container mx-auto px-4 text-center mb-10">
          <h1 className="text-5xl font-black mb-4 uppercase">AI Experiments</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Interactive playground for WANDAA TECH machine learning models.
          </p>
        </div>
        <MLLab />
      </main>
      <Footer />
    </div>
  )
}