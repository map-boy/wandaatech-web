import type { Metadata } from 'next'
import Link from 'next/link'
import { getContent } from '@/lib/site-content'
import { LegalShell, LegalSection } from '@/components/legal-shell'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'The limits of the information, tools and advertising published on the VAF UBWENGE TECH website.',
  alternates: { canonical: '/disclaimer' },
}

export default async function DisclaimerPage() {
  const c = await getContent()
  const entity = c.t('legal.entity')

  return (
    <LegalShell
      title="Disclaimer"
      updated={c.t('legal.updated')}
      intro={`What you can and cannot rely on from the content, tools and advertising published by ${entity}.`}
    >
      <LegalSection title="General information only">
        <p>
          Everything on this site is published for general information and educational purposes. We
          make a genuine effort to keep it accurate and current, but we make no warranty of any kind
          about its completeness, accuracy, reliability or suitability for a particular purpose. Any
          reliance you place on it is strictly at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="Not professional advice">
        <p>
          Nothing here is legal, financial, medical or other professional advice. Our articles,
          benchmarks and model outputs describe what we observed in our own work; your situation may
          differ. Consult a qualified professional before acting on anything you read here.
        </p>
      </LegalSection>

      <LegalSection title="Experimental tools and AI output">
        <p>
          The Intelligence Lab, converters, QR engine, scoring engine and chatbot on this site are
          research tools. They run on models that can be wrong, and they are offered as-is with no
          guarantee of availability, accuracy or fitness for production use. Do not use them for
          decisions where an error would cause harm, and do not submit confidential data to them.
        </p>
      </LegalSection>

      <LegalSection title="Advertising">
        <p>
          This site is supported by advertising served through Google AdSense. Ads are selected
          automatically by Google, not chosen or endorsed by us, and are always labelled
          &ldquo;Advertisement&rdquo;. We do not control the products or claims of the advertisers
          that appear, and their presence is not a recommendation. Transactions you enter into with
          an advertiser are between you and them.
        </p>
      </LegalSection>

      <LegalSection title="External links">
        <p>
          Links to other websites are provided for convenience. We do not control those sites and are
          not responsible for their content, accuracy or practices.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, {entity} is not liable for any loss or damage —
          direct, indirect or consequential — arising from the use of this website or anything on
          it. Our full terms are set out in the{' '}
          <Link href="/terms" className="text-emerald-500 underline">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          Something here look wrong? Tell us at{' '}
          <a href={`mailto:${c.t('legal.privacyEmail')}`} className="text-emerald-500 underline">
            {c.t('legal.privacyEmail')}
          </a>{' '}
          and we will correct it.
        </p>
      </LegalSection>
    </LegalShell>
  )
}
