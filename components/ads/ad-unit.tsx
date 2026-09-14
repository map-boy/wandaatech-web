'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ADSENSE_CLIENT, ADS_ENABLED, isAdFreePath } from '@/lib/adsense'
import { CONSENT_EVENT, readConsent, applyConsent } from '@/lib/consent'

interface AdUnitProps {
  slotId: string
  format?: string
  layoutKey?: string | null
  fullWidth?: boolean
  /** Reserved height, in px, so the page does not jump when the ad fills. */
  minHeight?: number
  className?: string
}

/**
 * A single AdSense unit.
 *
 * Policy notes baked in here rather than left to each caller:
 *  - never renders outside production, so localhost never generates ad requests
 *  - never renders on policy/admin routes
 *  - always carries a visible "Advertisement" label, which AdSense requires so
 *    ads are distinguishable from publisher content
 *  - reserves space to avoid layout shift, and collapses cleanly when unfilled
 */
export function AdUnit({
  slotId,
  format = 'auto',
  layoutKey = null,
  fullWidth = true,
  minHeight = 280,
  className = '',
}: AdUnitProps) {
  const pathname = usePathname()
  const insRef = useRef<HTMLModElement | null>(null)
  const pushed = useRef(false)
  const [filled, setFilled] = useState(true)

  const suppressed = !ADS_ENABLED || !slotId || isAdFreePath(pathname ?? '')

  useEffect(() => {
    if (suppressed || pushed.current) return

    // React 18/19 mounts effects twice in dev StrictMode; a second push on the
    // same <ins> throws "All 'ins' elements already have ads in them".
    pushed.current = true

    try {
      const consent = readConsent()
      if (consent) applyConsent(consent)
      const w = window as any
      w.adsbygoogle = w.adsbygoogle || []
      w.adsbygoogle.push({})
    } catch {
      // A blocked script or an ad blocker — leave the slot collapsed.
    }
  }, [suppressed])

  // Re-apply the personalisation flag if the visitor changes their mind.
  useEffect(() => {
    function onChange() {
      const consent = readConsent()
      if (consent) applyConsent(consent)
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  // Collapse the reserved space when AdSense reports the slot went unfilled,
  // so an empty box never sits in the middle of the page.
  useEffect(() => {
    if (suppressed) return
    const el = insRef.current
    if (!el) return
    const timer = window.setTimeout(() => {
      if (el.getAttribute('data-ad-status') === 'unfilled') setFilled(false)
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [suppressed])

  if (suppressed || !filled) return null

  return (
    <aside
      className={`my-10 w-full ${className}`}
      aria-label="Advertisement"
      data-ad-placement="true"
    >
      <p className="mb-2 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
        Advertisement
      </p>
      <div
        className="mx-auto w-full overflow-hidden rounded-xl border border-border/40 bg-muted/20"
        style={{ minHeight }}
      >
        <ins
          ref={insRef as any}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format={format}
          {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
          data-full-width-responsive={fullWidth ? 'true' : 'false'}
        />
      </div>
    </aside>
  )
}
