'use client'

import { useState, useEffect } from 'react'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="skeuo-card fixed bottom-0 left-0 right-0 z-[9999] rounded-none px-6 py-4 flex items-center justify-between gap-4 flex-wrap text-[13px] text-muted-foreground">
      <span>
        We use cookies to improve your experience on our site.{' '}
        <a href="/privacy" className="skeuo-glow-text underline">
          Privacy Policy
        </a>
      </span>
      <div className="flex gap-2">
        <button
          onClick={decline}
          className="skeuo-inset text-muted-foreground text-[13px] px-4 py-2"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="skeuo-button text-[13px] font-bold px-5 py-2"
        >
          <span className="skeuo-glow-text">Accept All</span>
        </button>
      </div>
    </div>
  )
}