import { AdUnit } from './ad-unit'
import { getAdSlots } from '@/lib/site-data'
import { ADS_ENABLED, ENV_SLOTS, type AdPlacement } from '@/lib/adsense'

interface AdSlotProps {
  placement: AdPlacement
  minHeight?: number
  className?: string
}

/**
 * Server-side resolver for an ad placement.
 *
 * Slot IDs come from the `ad_slots` table (editable in /admin → Monetization)
 * and fall back to env vars. A placement that is disabled, or has no slot ID
 * yet, renders nothing at all — so the site is never littered with empty ad
 * boxes while the AdSense application is still pending.
 */
export async function AdSlot({ placement, minHeight, className }: AdSlotProps) {
  if (!ADS_ENABLED) return null

  const slots = await getAdSlots()
  const config = slots[placement]
  const slotId = config?.slot_id || ENV_SLOTS[placement] || ''

  if (!slotId) return null

  return (
    <AdUnit
      slotId={slotId}
      format={config?.format ?? 'auto'}
      layoutKey={config?.layout_key ?? null}
      fullWidth={config?.full_width ?? true}
      minHeight={minHeight}
      className={className}
    />
  )
}
