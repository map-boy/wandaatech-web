import type { Metadata } from 'next'
import { CompetitionsClient } from './CompetitionsClient'
import { ToolExplainer } from '@/components/tool-explainer'
import { Footer } from '@/components/site-footer'

export const metadata: Metadata = {
  title: 'Machine Learning Competitions',
  description:
    'Open machine learning competitions run by VAF UBWENGE TECH in Kigali — register, submit model predictions, and see where you land on a scored public leaderboard.',
  alternates: { canonical: '/competitions' },
}

export default function CompetitionsPage() {
  return (
    <>
      <CompetitionsClient />

      <ToolExplainer
        lead="We run open machine learning competitions for students in Rwanda. Each one is a real dataset with a held-out answer key, a public leaderboard, and a scoring engine that grades every submission the same way."
        sections={[
          {
            heading: 'How a competition works',
            bullets: [
              { term: 'Register', description: 'enter as an individual or a team. You need an email address and your institution, nothing more.' },
              { term: 'Get the data', description: 'each challenge publishes its training set and the exact submission format expected.' },
              { term: 'Build a model', description: 'use whatever tools you like. We do not restrict libraries or require a particular language.' },
              { term: 'Submit predictions', description: 'upload your predictions as a CSV. You can submit more than once — your best score stands.' },
              { term: 'See where you land', description: 'the leaderboard updates as submissions come in, so you can watch your position move.' },
            ],
          },
          {
            heading: 'How submissions are scored',
            paragraphs: [
              'Your predictions are compared against a held-out answer key you never see. That is what makes the leaderboard meaningful: a model that memorised the training set scores badly, because it has not learned anything that generalises.',
              'Scoring combines accuracy with an F1 measure, so a model that wins by always predicting the majority class does not do well. Some challenges also weight harder rows more heavily, which rewards models that hold up on the difficult cases rather than the easy bulk.',
            ],
          },
          {
            heading: 'Who these are for',
            paragraphs: [
              'Mostly students who have finished a machine learning course and want to find out whether any of it transfers to data nobody has cleaned for them. You do not need to be enrolled anywhere to take part, and you do not need to have competed before.',
              'If you are starting out, a plain baseline submitted early is worth more than a sophisticated model submitted never. Getting any score on the board tells you your pipeline works end to end, and everything after that is improvement.',
            ],
          },
        ]}
      />

      <Footer />
    </>
  )
}
