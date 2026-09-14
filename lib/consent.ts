'use client'

// ===========================================================================
// Cookie / ad consent, wired to Google Consent Mode v2.
//
// Consent Mode v2 is mandatory for traffic from the EEA and UK: without it
// Google stops serving personalised ads and measurement to those users. The
// defaults are set to "denied" in the document head before any Google tag
// loads, and this module flips them once the visitor chooses.
// ===========================================================================

export const CONSENT_STORAGE_KEY = 'vaf-consent-v2'
export const CONSENT_EVENT = 'vaf-consent-change'

export interface ConsentState {
  /** Strictly necessary cookies — always true, listed for transparency. */
  necessary: true
  /** Google Analytics. */
  analytics: boolean
  /** Personalised advertising (AdSense). */
  ads: boolean
  /** ISO timestamp of the decision, so we can re-ask after a policy change. */
  decidedAt: string
}

export const CONSENT_DENIED: ConsentState = {
  necessary: true,
  analytics: false,
  ads: false,
  decidedAt: '',
}

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      ads: Boolean(parsed.ads),
      decidedAt: String(parsed.decidedAt ?? ''),
    }
  } catch {
    // Private browsing or disabled storage — treat as "not yet asked".
    return null
  }
}

export function writeConsent(partial: { analytics: boolean; ads: boolean }): ConsentState {
  const state: ConsentState = {
    necessary: true,
    analytics: partial.analytics,
    ads: partial.ads,
    decidedAt: new Date().toISOString(),
  }
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Nothing to do — consent simply gets asked again next visit.
  }
  applyConsent(state)
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }))
  return state
}

/** Push the decision into Google Consent Mode and the AdSense queue. */
export function applyConsent(state: ConsentState) {
  if (typeof window === 'undefined') return

  const w = window as any
  w.dataLayer = w.dataLayer || []
  function gtag(...args: any[]) {
    w.dataLayer.push(args)
  }

  gtag('consent', 'update', {
    ad_storage: state.ads ? 'granted' : 'denied',
    ad_user_data: state.ads ? 'granted' : 'denied',
    ad_personalization: state.ads ? 'granted' : 'denied',
    analytics_storage: state.analytics ? 'granted' : 'denied',
  })

  // Without ad consent we still serve ads, but non-personalised ones.
  try {
    w.adsbygoogle = w.adsbygoogle || []
    w.adsbygoogle.requestNonPersonalizedAds = state.ads ? 0 : 1
  } catch {
    // The AdSense script may not have loaded yet; the flag is read lazily.
  }
}

/** True once the visitor has made any choice. */
export function hasDecided(): boolean {
  return readConsent() !== null
}
