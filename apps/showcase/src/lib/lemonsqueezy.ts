import { useCallback, useEffect, useState } from 'react'

// Lemon Squeezy is the merchant of record, so it collects VAT and sales tax on
// our behalf rather than us registering in every jurisdiction.
//
// Everything here is client-side on purpose: the showcase is a static bundle on
// GitHub Pages with no server. Buy URLs are public by design — they only open a
// checkout for a fixed product variant.
export const CHECKOUT_STARTUP = import.meta.env.VITE_LS_CHECKOUT_STARTUP
export const CHECKOUT_BUSINESS = import.meta.env.VITE_LS_CHECKOUT_BUSINESS
export const CHECKOUT_LIFETIME = import.meta.env.VITE_LS_CHECKOUT_LIFETIME

// Forks and local clones have no buy URLs, and we would rather the buy buttons
// degrade into "talk to a human" links than render as dead controls.
export const lemonConfigured = Boolean(CHECKOUT_STARTUP || CHECKOUT_BUSINESS || CHECKOUT_LIFETIME)

const SCRIPT_SRC = 'https://app.lemonsqueezy.com/js/lemon.js'

declare global {
  interface Window {
    createLemonSqueezy?: () => void
    LemonSqueezy?: { Url: { Open: (url: string) => void } }
  }
}

let pending: Promise<boolean> | null = null

function loadLemon(): Promise<boolean> {
  if (!pending) {
    pending = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.defer = true
      script.onload = () => {
        window.createLemonSqueezy?.()
        resolve(Boolean(window.LemonSqueezy))
      }
      // A blocked script (ad blocker, CSP) falls back to a full-page redirect
      // to the hosted checkout, so the sale still goes through.
      script.onerror = () => resolve(false)
      document.head.appendChild(script)
    })
  }
  return pending
}

function withEmbed(url: string) {
  return url + (url.includes('?') ? '&' : '?') + 'embed=1'
}

export function useLemonCheckout() {
  const [overlay, setOverlay] = useState(false)

  useEffect(() => {
    if (!lemonConfigured) return
    let live = true
    loadLemon().then((ok) => {
      if (live) setOverlay(ok)
    })
    return () => {
      live = false
    }
  }, [])

  const openCheckout = useCallback(
    (url: string) => {
      if (overlay && window.LemonSqueezy) window.LemonSqueezy.Url.Open(withEmbed(url))
      else window.location.href = url
    },
    [overlay],
  )

  return { openCheckout }
}
