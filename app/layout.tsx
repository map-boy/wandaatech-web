import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  // The text shown in the browser tab
  title: 'VAF UBWENGE TECH - Intelligence Systems & Digital Solutions',
  description: 'VAF UBWENGE TECH is a student-led startup in Rwanda creating innovative digital solutions like Easy GO and the Intelligence Lab.',
  
  // Replaces v0.app with your company identity
  generator: 'VAF UBWENGE TECH', 

  // The small icon for the browser tab (from Nano Banana Asset 2)
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png', 
  },

  // The large "card" shown when you send the link (from Nano Banana Asset 1)
  openGraph: {
    title: 'VAF UBWENGE TECH',
    description: 'Intelligence Systems & AI Research Lab based in Rwanda.',
    url: 'https://wandaatech-web.vercel.app', 
    siteName: 'VAF UBWENGE TECH',
    images: [
      {
        url: '/vaf-tech-banner.png', 
        width: 1200,
        height: 630,
        alt: 'VAF UBWENGE TECH - Building Africa’s Digital Future',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Ensures the preview looks great on X/Twitter
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
      <body className="font-sans antialiased bg-white dark:bg-slate-950 transition-colors duration-300">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem 
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}