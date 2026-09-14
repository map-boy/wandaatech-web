import type { Metadata } from 'next'
import Link from 'next/link'
import { getContent } from '@/lib/site-content'
import { LegalShell, LegalSection } from '@/components/legal-shell'
import { CookieSettingsButton } from '@/components/legal'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Every category of cookie used on this site, what each one does, how long it lasts, and how to change your choices.',
  alternates: { canonical: '/cookie-policy' },
}

const COOKIE_TABLE = [
  {
    category: 'Strictly necessary',
    purpose: 'Keeps the site working: page routing, your theme choice, and your cookie decision itself.',
    examples: 'vaf-consent-v2, theme',
    duration: 'Up to 12 months',
    consent: 'Not required',
  },
  {
    category: 'Analytics',
    purpose: 'Counts visits and shows which pages are read, so we know what to improve. IP addresses are anonymised.',
    examples: '_ga, _ga_*  (Google Analytics 4), Vercel Analytics',
    duration: 'Up to 14 months',
    consent: 'Required',
  },
  {
    category: 'Advertising',
    purpose:
      'Lets Google and its partners select and measure ads. With consent these may be personalised; without consent, ads are non-personalised.',
    examples: '__gads, __gpi, IDE, test_cookie',
    duration: 'Up to 13 months',
    consent: 'Required',
  },
]

export default async function CookiePolicyPage() {
  const c = await getContent()

  return (
    <LegalShell
      title="Cookie Policy"
      updated={c.t('legal.updated')}
      intro="Cookies are small files a website stores on your device. This page lists every category we use, what it does, and how to turn it off."
    >
      <LegalSection title="Categories we use">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                <th className="py-3 pr-4 font-semibold">Category</th>
                <th className="py-3 pr-4 font-semibold">What it does</th>
                <th className="py-3 pr-4 font-semibold">Examples</th>
                <th className="py-3 pr-4 font-semibold">Lifetime</th>
                <th className="py-3 font-semibold">Consent</th>
              </tr>
            </thead>
            <tbody>
              {COOKIE_TABLE.map((row) => (
                <tr key={row.category} className="border-b border-border/50 align-top">
                  <td className="py-4 pr-4 font-semibold text-foreground">{row.category}</td>
                  <td className="py-4 pr-4">{row.purpose}</td>
                  <td className="py-4 pr-4 font-mono text-xs">{row.examples}</td>
                  <td className="py-4 pr-4">{row.duration}</td>
                  <td className="py-4">{row.consent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="Changing your mind">
        <p>
          Open <CookieSettingsButton className="text-emerald-500 underline" /> to review or change
          your choices at any time. You can also clear cookies in your browser settings, which
          resets the banner on your next visit.
        </p>
        <p>
          Blocking advertising cookies does not remove the ads — it makes them non-personalised.
          Blocking strictly necessary cookies is not possible without breaking the site.
        </p>
      </LegalSection>

      <LegalSection title="Third-party controls">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-500 underline"
            >
              Google Ads Settings
            </a>{' '}
            — turn off ad personalisation across Google.
          </li>
          <li>
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-500 underline"
            >
              Google Analytics opt-out
            </a>{' '}
            — a browser add-on that blocks Analytics everywhere.
          </li>
          <li>
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-500 underline"
            >
              aboutads.info/choices
            </a>{' '}
            and{' '}
            <a
              href="https://optout.networkadvertising.org/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-500 underline"
            >
              NAI opt-out
            </a>{' '}
            — industry-wide opt-outs.
          </li>
        </ul>
        <p>
          How we handle the data behind these cookies is described in our{' '}
          <Link href="/privacy" className="text-emerald-500 underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalShell>
  )
}
