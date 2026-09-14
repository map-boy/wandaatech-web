// ===========================================================================
// Google AdSense configuration.
//
// The publisher ID lives in NEXT_PUBLIC_ADSENSE_CLIENT so a fork of this repo
// never serves ads against someone else's account by accident. The literal
// below is the account this site was verified with and is used as a fallback
// so existing deployments keep working without a new env var.
// ===========================================================================

export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || 'ca-pub-6727162627172885'

/** The numeric part, e.g. "6727162627172885" — what ads.txt expects. */
export const ADSENSE_PUBLISHER_ID = ADSENSE_CLIENT.replace(/^ca-/, '')

/**
 * Ads are suppressed entirely in development. Serving real ad requests from
 * localhost inflates invalid traffic, which is the fastest way to get an
 * AdSense account limited or banned.
 */
export const ADS_ENABLED =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_ADS_DISABLED !== 'true'

/**
 * Routes that must never carry ads.
 *
 * AdSense program policy forbids ads on pages without publisher content, and
 * placing them on the very policy pages a reviewer reads is a common cause of
 * rejection. The admin panel is excluded because it is not public content.
 */
export const AD_FREE_PATHS = [
  '/admin',
  '/privacy',
  '/terms',
  '/cookie-policy',
  '/disclaimer',
  '/smartmotos-privacy',
  '/smartmotos-support',
  '/smartmotos-delete-account',
]

export function isAdFreePath(pathname: string): boolean {
  return AD_FREE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** Placement identifiers used by <AdUnit placement="…" />. */
export type AdPlacement =
  | 'home-top'
  | 'home-mid'
  | 'article-top'
  | 'article-inline'
  | 'article-bottom'
  | 'list-grid'
  | 'sidebar'

/**
 * Slot IDs can also be supplied by env, which lets a deployment run ads before
 * anyone has opened the admin panel. Admin values take priority.
 */
export const ENV_SLOTS: Partial<Record<AdPlacement, string>> = {
  'home-top': process.env.NEXT_PUBLIC_AD_SLOT_HOME_TOP,
  'home-mid': process.env.NEXT_PUBLIC_AD_SLOT_HOME_MID,
  'article-top': process.env.NEXT_PUBLIC_AD_SLOT_ARTICLE_TOP,
  'article-inline': process.env.NEXT_PUBLIC_AD_SLOT_ARTICLE_INLINE,
  'article-bottom': process.env.NEXT_PUBLIC_AD_SLOT_ARTICLE_BOTTOM,
  'list-grid': process.env.NEXT_PUBLIC_AD_SLOT_LIST_GRID,
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR,
}
