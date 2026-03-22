import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { CookieBanner } from '@/components/cookie-banner'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'VAF UBWENGE TECH - Intelligence Systems & Digital Solutions',
  description: 'VAF UBWENGE TECH is a student-led startup in Rwanda creating innovative digital solutions like Easy GO and the Intelligence Lab.',
  generator: 'VAF UBWENGE TECH',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  other: {
    'google-adsense-account': 'ca-pub-6727162627172885',
  },
  openGraph: {
    title: 'VAF UBWENGE TECH',
    description: 'Intelligence Systems & AI Research Lab based in Rwanda.',
    url: 'https://vaf-ubwenge-tech.vercel.app',
    siteName: 'VAF UBWENGE TECH',
    images: [
      {
        url: '/vaf-tech-banner.png',
        width: 1200,
        height: 630,
        alt: "VAF UBWENGE TECH - Building Africa's Digital Future",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAF UBWENGE TECH',
    description: 'Innovative digital solutions and AI research in Rwanda.',
    images: ['/vaf-tech-banner.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── AdSense verification meta tag ── */}
        <meta name="google-adsense-account" content="ca-pub-6727162627172885" />

        {/* ── Google AdSense script ── */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6727162627172885"
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
            src="https://www.googletagmanager.com/gtag/js?id=G-RE59R799HT"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RE59R799HT');
            `}
          </Script>

          {/* ── Schema Markup moved here to avoid SSR hydration conflict ── */}
          <Script id="schema-org" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "VAF UBWENGE TECH",
              "url": "https://vaf-ubwenge-tech.vercel.app",
              "logo": "https://vaf-ubwenge-tech.vercel.app/vaf-logo.png",
              "description": "Student-led AI and logistics startup in Kigali, Rwanda building Easy GO and the Intelligence Lab.",
              "foundingLocation": {
                "@type": "Place",
                "name": "Kigali, Rwanda"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "email": "support@wandaatech.rw"
              }
            })}
          </Script>

          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}