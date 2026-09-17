/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Which Paddle account the checkout talks to. Defaults to the sandbox. */
  readonly VITE_PADDLE_ENV?: 'sandbox' | 'production'
  /** Paddle client-side token. Safe to ship; only opens a checkout. */
  readonly VITE_PADDLE_CLIENT_TOKEN?: string
  /** Paddle price ID for the $99/yr licence, prefixed `pri_`. */
  readonly VITE_PADDLE_PRICE_ANNUAL?: string
  /** Paddle price ID for the $999 lifetime licence, prefixed `pri_`. */
  readonly VITE_PADDLE_PRICE_LIFETIME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
