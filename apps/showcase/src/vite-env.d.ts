/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Lemon Squeezy buy URL for the Startup plan. Public; only opens a checkout. */
  readonly VITE_LS_CHECKOUT_STARTUP?: string
  /** Lemon Squeezy buy URL for the Business plan. */
  readonly VITE_LS_CHECKOUT_BUSINESS?: string
  /** Lemon Squeezy buy URL for the one-time Lifetime licence. */
  readonly VITE_LS_CHECKOUT_LIFETIME?: string
  /** RichKit Pro key for the showcase's own demos, domain-bound to the Pages host. */
  readonly VITE_RICHKIT_LICENSE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
