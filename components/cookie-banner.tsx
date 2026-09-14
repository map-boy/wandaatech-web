'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { readConsent, writeConsent, CONSENT_EVENT } from '@/lib/consent'

/**
 * Cookie consent banner.
 *
 * AdSense requires publishers to obtain consent for ad cookies from EEA/UK
 * visitors and to give them a real choice — so "Reject all" is a first-class
 * button, not buried in settings, and declining still lets the site work
 * (ads simply become non-personalised).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [ads, setAds] = useState(true)

  useEffect(() => {
    if (readConsent() === null) setVisible(true)

    // "Cookie settings" in the footer re-opens the banner.
    function reopen() {
      const current = readConsent()
      setAnalytics(current?.analytics ?? true)
      setAds(current?.ads ?? true)
      setShowDetail(true)
      setVisible(true)
    }
    window.addEventListener('vaf-open-consent', reopen)
    return () => window.removeEventListener('vaf-open-consent', reopen)
  }, [])

  function decide(next: { analytics: boolean; ads: boolean }) {
    writeConsent(next)
    setVisible(false)
    setShowDetail(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="skeuo-card fixed bottom-0 left-0 right-0 z-[9999] rounded-none border-t border-border px-5 py-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-2 text-[13px] leading-relaxed text-muted-foreground">
          <p className="font-bold text-foreground">We use cookies</p>
          <p>
            We use necessary cookies to run this site, and — with your permission — analytics
            cookies to understand how it is used and advertising cookies so that Google and its
            partners can show you relevant ads. You can change your mind at any time.{' '}
            <Link href="/cookie-policy" className="skeuo-glow-text underline">
              Cookie Policy
            </Link>{' '}
            ·{' '}
            <Link href="/privacy" className="skeuo-glow-text underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {showDetail && (
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="skeuo-inset flex items-center justify-between gap-3 px-4 py-3 text-[12px]">
              <span className="font-bold text-foreground">Necessary</span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Always on</span>
            </div>

            <label className="skeuo-inset flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-[12px]">
              <span className="font-bold text-foreground">Analytics</span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
            </label>

            <label className="skeuo-inset flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-[12px]">
              <span className="font-bold text-foreground">Advertising</span>
              <input
                type="checkbox"
                checked={ads}
                onChange={(e) => setAds(e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {!showDetail && (
            <button
              onClick={() => setShowDetail(true)}
              className="skeuo-inset px-4 py-2 text-[13px] text-muted-foreground"
            >
              Manage choices
            </button>
          )}
          <button
            onClick={() => decide({ analytics: false, ads: false })}
            className="skeuo-inset px-4 py-2 text-[13px] text-muted-foreground"
          >
            Reject all
          </button>
          {showDetail && (
            <button
              onClick={() => decide({ analytics, ads })}
              className="skeuo-inset px-4 py-2 text-[13px] text-foreground"
            >
              Save choices
            </button>
          )}
          <button
            onClick={() => decide({ analytics: true, ads: true })}
            className="skeuo-button px-5 py-2 text-[13px] font-bold"
          >
            <span className="skeuo-glow-text">Accept all</span>
          </button>
        </div>
      </div>
    </div>
  )
}
