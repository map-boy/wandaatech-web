import { MarqueeBar } from '@/components/marquee-bar'
import { Header } from '@/components/header'
import { IntelligenceLab } from '@/components/intelligence-lab' // Ensure this path is correct
import { Footer } from '@/components/site-footer'
import { ToolExplainer } from '@/components/tool-explainer'
import { AdSlot } from '@/components/ads/ad-slot'

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

        <ToolExplainer
          lead="The Intelligence Lab is where we put our trained models in front of anyone who wants to try them. Each one is a model we built and evaluated ourselves, served from our own inference API, and exposed here with the raw inputs it expects — no sign-up, no sample data hidden behind a form."
          sections={[
            {
              heading: 'What you can run here',
              bullets: [
                { term: 'Sonar Mine Detector', description: 'a classifier that reads 60 sonar frequency returns and predicts whether the object is rock or a mine.' },
                { term: 'Diabetes Risk Predictor', description: 'takes eight patient metrics — glucose, blood pressure, BMI, age and others — and estimates risk of onset.' },
                { term: 'Fake News Detector', description: 'a natural-language model that judges whether a headline reads as authentic or fabricated.' },
                { term: 'Wine Quality Analyst', description: 'a regression model that scores quality from chemical properties.' },
                { term: 'Deep Learning Vision', description: 'MobileNetV2 exported to ONNX, classifying types of clothing from an image.' },
              ],
            },
            {
              heading: 'How it works',
              paragraphs: [
                'Each model is trained offline, evaluated against a held-out set, then exported and served behind a FastAPI endpoint. When you press run, your inputs are sent to that endpoint and the prediction comes back as JSON, which the page renders.',
                'The vision model is the exception: it runs entirely in your browser through ONNX Runtime Web, so the image you pick never leaves your device.',
              ],
            },
            {
              heading: 'What it is not',
              paragraphs: [
                'These are research models, published so students can see what a trained classifier actually does rather than read about one. They are not calibrated for professional use, and the medical model in particular is a teaching example — it is not a diagnostic tool and must not be used as one.',
              ],
            },
          ]}
        />

        {/* 2. Your ML/AI Component */}
        <section className="border-t border-emerald-500/10 pt-10">
          <IntelligenceLab /> 
        </section>

        <div className="container mx-auto max-w-3xl px-6">
          <AdSlot placement="article-bottom" minHeight={120} />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}