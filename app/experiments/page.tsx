import { MLLab } from '@/components/ml-lab'
import { Header } from '@/components/header'
import { Footer } from '@/components/site-footer'
import { ToolExplainer } from '@/components/tool-explainer'

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
        <ToolExplainer
          lead="This playground runs the same models as the Intelligence Lab, in a stripped-back interface built for trying many inputs quickly rather than reading about any one model."
          sections={[
            {
              heading: 'How to use it',
              paragraphs: [
                'Pick a model from the tabs, paste the inputs it asks for, and run it. Numeric models expect comma-separated values in the order shown in the placeholder — that order matters, because the model was trained on those columns in that sequence.',
                'A prediction that looks wrong is usually an input-shape problem rather than a model problem: the sonar classifier wants exactly 60 values, and the diabetes model exactly eight.',
              ],
            },
            {
              heading: 'Why we published it',
              paragraphs: [
                'Most students meet machine learning as a notebook that someone else ran. Being able to change an input and watch the prediction move is a faster way to build intuition about what a model is sensitive to, and it costs us nothing to leave the endpoints open.',
              ],
            },
          ]}
        />

        <MLLab />
      </main>
      <Footer />
    </div>
  )
}