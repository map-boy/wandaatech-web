import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { CookieBanner } from '@/components/cookie-banner'
import { AIChatbot } from '@/components/ai-chatbot'
import Script from 'next/script'
import { getContent } from '@/lib/site-content'
import { ADSENSE_CLIENT } from '@/lib/adsense'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || 'G-RE59R799HT'

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent()
  const siteUrl = c.t('seo.siteUrl')
  const title = c.t('seo.title')
  const description = c.t('seo.description')
  const banner = c.t('brand.banner')

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${c.t('brand.name')}`,
    },
    description,
    applicationName: c.t('brand.name'),
    generator: c.t('brand.name'),
    alternates: { canonical: '/' },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
    other: {
      'google-adsense-account': ADSENSE_CLIENT,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: c.t('brand.name'),
      images: [{ url: banner, width: 1200, height: 630, alt: c.t('brand.name') }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [banner],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const c = await getContent()
  const siteUrl = c.t('seo.siteUrl')

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />

        {/*
          Google Consent Mode v2 — required for EEA/UK traffic.
          Everything starts denied and is upgraded only after the visitor
          chooses in the cookie banner. This must run before gtag.js and
          before the AdSense tag, which is why it is a raw inline script in
          <head> rather than a next/script component.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });
              try {
                var stored = JSON.parse(localStorage.getItem('vaf-consent-v2') || 'null');
                if (stored) {
                  gtag('consent', 'update', {
                    ad_storage: stored.ads ? 'granted' : 'denied',
                    ad_user_data: stored.ads ? 'granted' : 'denied',
                    ad_personalization: stored.ads ? 'granted' : 'denied',
                    analytics_storage: stored.analytics ? 'granted' : 'denied'
                  });
                }
                window.adsbygoogle = window.adsbygoogle || [];
                window.adsbygoogle.requestNonPersonalizedAds = (stored && stored.ads) ? 0 : 1;
              } catch (e) {}
            `,
          }}
        />

        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>

      <body className="font-sans antialiased bg-white dark:bg-slate-950 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />

          {/* ── Google Analytics 4 ── */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
            `}
          </Script>

          {/* ── Organization schema ── */}
          <Script id="schema-org" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: c.t('brand.name'),
              url: siteUrl,
              logo: `${siteUrl}${c.t('brand.logo')}`,
              description: c.t('seo.description'),
              foundingLocation: { '@type': 'Place', name: c.t('contact.address') },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: c.t('contact.email'),
              },
            })}
          </Script>

          <CookieBanner />
          <AIChatbot />
        </ThemeProvider>
      </body>
    </html>
  )
}
