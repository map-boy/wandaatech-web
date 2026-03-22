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
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#0f172a',
        borderTop: '1px solid #059669',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        fontSize: '13px',
        color: '#cbd5e1',
      }}
    >
      <span>
        We use cookies to improve your experience on our site.{' '}
        <a href="/privacy" style={{ color: '#34d399', textDecoration: 'underline' }}>
          Privacy Policy
        </a>
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={decline}
          style={{
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '13px',
            borderRadius: '8px',
            border: '1px solid #334155',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            background: '#059669',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            padding: '8px 20px',
            cursor: 'pointer',
          }}
        >
          Accept All
        </button>
      </div>
    </div>
  )
}