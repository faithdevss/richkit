import { useCallback, useEffect, useState } from 'react'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'

// Paddle is the merchant of record, so it collects VAT and sales tax on our
// behalf rather than us registering in every jurisdiction.
//
// Everything here is client-side on purpose: the showcase is a static bundle on
// GitHub Pages with no server to sign anything. The client token is safe to
// ship — it only opens a checkout, and Paddle refuses to render one on a domain
// that has not been approved in the dashboard.
const ENVIRONMENT = import.meta.env.VITE_PADDLE_ENV ?? 'sandbox'
const TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN

export const PRICE_ANNUAL = import.meta.env.VITE_PADDLE_PRICE_ANNUAL
export const PRICE_LIFETIME = import.meta.env.VITE_PADDLE_PRICE_LIFETIME

// Forks and local clones have no token, and we would rather the buy buttons
// degrade into "talk to a human" links than render as dead controls.
export const paddleConfigured = Boolean(TOKEN && PRICE_ANNUAL && PRICE_LIFETIME)

let pending: Promise<Paddle | undefined> | null = null

function loadPaddle() {
  if (!pending) {
    pending = initializePaddle({
      environment: ENVIRONMENT === 'production' ? 'production' : 'sandbox',
      token: TOKEN as string,
    })
  }
  return pending
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle>()

  useEffect(() => {
    if (!paddleConfigured) return
    let live = true
    loadPaddle().then((instance) => {
      if (live) setPaddle(instance)
    })
    return () => {
      live = false
    }
  }, [])

  const openCheckout = useCallback(
    (priceId: string) => {
      paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          // The licence is a contract, not a key, so there is nothing to
          // provision afterwards — Paddle's own success screen is the whole
          // post-purchase flow.
          showAddDiscounts: true,
        },
      })
    },
    [paddle],
  )

  return { openCheckout, ready: Boolean(paddle) }
}
