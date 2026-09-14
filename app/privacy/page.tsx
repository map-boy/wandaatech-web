import type { Metadata } from 'next'
import Link from 'next/link'
import { getContent } from '@/lib/site-content'
import { LegalShell, LegalSection } from '@/components/legal-shell'
import { CookieSettingsButton } from '@/components/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How VAF UBWENGE TECH collects, uses and protects personal data, including the cookies used by Google AdSense and Google Analytics.',
  alternates: { canonical: '/privacy' },
}

export default async function PrivacyPage() {
  const c = await getContent()
  const entity = c.t('legal.entity')
  const email = c.t('legal.privacyEmail')

  return (
    <LegalShell
      title="Privacy Policy"
      updated={c.t('legal.updated')}
      intro={`This policy explains what information ${entity} collects when you use this website, why we collect it, who we share it with, and the choices you have. It applies to this website and every subdomain we operate.`}
    >
      <LegalSection title="1. Who we are">
        <p>
          {entity} is a technology company based in {c.t('contact.address')}. For anything in this
          policy, or to exercise any of the rights described below, write to{' '}
          <a href={`mailto:${email}`} className="text-emerald-500 underline">
            {email}
          </a>
          . We are the data controller for information collected through this site.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We collect only what we need, and we tell you which is which:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Information you give us.</strong> Your name, email
            address and message when you use the contact form; your name, email and institution
            when you register for a competition; the files and model submissions you upload.
          </li>
          <li>
            <strong className="text-foreground">Information collected automatically.</strong> Your
            IP address, browser and device type, the pages you visit, the referring page and
            approximate location derived from your IP. This is standard web-server and analytics
            data.
          </li>
          <li>
            <strong className="text-foreground">Cookies and similar technologies.</strong> Small
            files stored on your device. See section 4.
          </li>
        </ul>
        <p>
          We do not knowingly collect personal information from children under 13, and this site is
          not directed at them. If you believe a child has given us personal information, contact us
          and we will delete it.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To operate the site and the tools on it, and to answer messages you send us.</li>
          <li>To run competitions: registration, scoring, and the public leaderboard.</li>
          <li>To understand which pages are used, so we know what to improve.</li>
          <li>To display advertising, which is how we cover the cost of running this site.</li>
          <li>To keep the site secure and to detect abuse.</li>
        </ul>
        <p>
          Our legal bases are your consent (analytics and advertising cookies), performance of a
          contract (competition entry), and our legitimate interest in running and securing the
          site.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies and advertising">
        <p>
          This site uses cookies. Strictly necessary cookies are always active. Analytics and
          advertising cookies are only set after you agree to them in our cookie banner, and you can
          change or withdraw that choice at any time using{' '}
          <CookieSettingsButton className="text-emerald-500 underline" />.
        </p>

        <h3 className="pt-2 font-semibold text-foreground">Google AdSense and third-party vendors</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Third-party vendors, including Google, use cookies to serve ads based on your prior
            visits to this website or other websites.
          </li>
          <li>
            Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to you
            based on your visit to this site and/or other sites on the Internet.
          </li>
          <li>
            You may opt out of personalised advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-500 underline"
            >
              Google Ads Settings
            </a>
            . You can also opt out of a third-party vendor&rsquo;s use of cookies for personalised
            advertising at{' '}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-500 underline"
            >
              aboutads.info/choices
            </a>{' '}
            or{' '}
            <a
              href="https://optout.networkadvertising.org/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-500 underline"
            >
              the NAI opt-out page
            </a>
            .
          </li>
          <li>
            Where required, we operate Google Consent Mode v2. If you decline advertising cookies,
            ads may still appear but they will be non-personalised.
          </li>
          <li>
            More detail on how Google uses data from sites that use its services is available at{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-500 underline"
            >
              policies.google.com/technologies/partner-sites
            </a>
            .
          </li>
        </ul>

        <h3 className="pt-2 font-semibold text-foreground">Analytics</h3>
        <p>
          We use Google Analytics 4 with IP anonymisation, and Vercel Analytics, to count visits and
          see which pages are read. Both run only after you accept analytics cookies.
        </p>

        <p>
          A full list of cookie categories is in our{' '}
          <Link href="/cookie-policy" className="text-emerald-500 underline">
            Cookie Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Who we share data with">
        <p>
          We do not sell your personal data. We share it only with service providers who process it
          on our behalf: Google (advertising and analytics), Supabase (database and file storage),
          Vercel (hosting and analytics), and our email provider. Each processes data under its own
          terms and only for the purposes above. We may also disclose information where the law
          requires it.
        </p>
      </LegalSection>

      <LegalSection title="6. International transfers">
        <p>
          Our providers operate globally, so your information may be processed outside your country,
          including in the United States and the European Union. Where that happens, transfers are
          covered by the safeguards those providers maintain, such as Standard Contractual Clauses.
        </p>
      </LegalSection>

      <LegalSection title="7. How long we keep it">
        <p>
          Contact messages are kept for up to 24 months. Competition registrations and submissions
          are kept for as long as the leaderboard for that competition remains public. Analytics
          data is retained for up to 14 months. Server logs are kept for up to 90 days.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>
          Depending on where you live, you may have the right to access the personal data we hold
          about you, to correct it, to delete it, to object to or restrict how we use it, to receive
          a portable copy, and to withdraw consent at any time. Residents of the EEA and UK have
          these rights under the GDPR; residents of California have equivalent rights under the CCPA,
          including the right to opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of
          personal information for cross-context behavioural advertising — declining advertising
          cookies in our banner exercises that right.
        </p>
        <p>
          To make a request, email{' '}
          <a href={`mailto:${email}`} className="text-emerald-500 underline">
            {email}
          </a>
          . We respond within 30 days. If you are in the EEA or UK you may also complain to your
          local data protection authority.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          Data is transmitted over HTTPS and stored with access controls at our providers.
          Administrative access to site content requires a separate credential. No system is
          perfectly secure, so we cannot guarantee absolute security, but we will notify you and the
          relevant authority if a breach affects your personal data.
        </p>
      </LegalSection>

      <LegalSection title="10. External links">
        <p>
          This site links to services we do not control, and advertisements may lead to third-party
          sites. We are not responsible for the privacy practices or content of those sites. Read
          their policies before giving them information.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to this policy">
        <p>
          We update this policy when our practices change. The &ldquo;last updated&rdquo; date at the
          top always reflects the current version, and material changes will be announced on this
          page.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          {entity} · {c.t('contact.address')} ·{' '}
          <a href={`mailto:${email}`} className="text-emerald-500 underline">
            {email}
          </a>{' '}
          ·{' '}
          <Link href="/contact" className="text-emerald-500 underline">
            contact form
          </Link>
        </p>
      </LegalSection>
    </LegalShell>
  )
}
