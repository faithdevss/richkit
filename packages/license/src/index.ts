import { PUBLIC_KEY } from './public-key'
import { verifyLicenseKey, type LicenseStatus } from './key'

export { PUBLIC_KEY }
export {
  decodeLicenseKey,
  signLicensePayload,
  verifyLicenseKey,
  type LicensePayload,
  type LicensePlan,
  type LicenseStatus,
} from './key'

declare const __RICHKIT_RELEASE_DATE__: string | undefined

/** ISO date this build was released, or undefined when running from source. */
export const RELEASE_DATE: string | undefined =
  typeof __RICHKIT_RELEASE_DATE__ === 'string' ? __RICHKIT_RELEASE_DATE__ : undefined

const PRICING_URL = 'https://faithdevss.github.io/richkit/pricing'
const BADGE_ID = 'richkit-pro-unlicensed'

let licenseKey: string | null = null
let status: Promise<LicenseStatus> | null = null
const features = new Set<string>()
let scheduled = false
let warned = false

/**
 * Register your RichKit Pro licence key. Call once, before or after the first
 * editor mounts. The key is checked locally; nothing is sent anywhere.
 *
 * The key is global to the page, not per editor: the same registration covers
 * every Pro package. An empty value is ignored, so an env var that is not set
 * in a preview build never clears a key another call already registered, and
 * re-registering the same key is a no-op — cheap enough to call on every
 * render, which is what the `licenseKey` prop does.
 */
export function setLicenseKey(key: string | null | undefined): void {
  if (!key || key === licenseKey) return
  licenseKey = key
  status = null
  warned = false
  if (features.size) schedule()
}

/** Resolve the current key's status. */
export function getLicenseStatus(): Promise<LicenseStatus> {
  const hostname = typeof window === 'undefined' ? undefined : window.location.hostname
  status ??= verifyLicenseKey(licenseKey, PUBLIC_KEY, RELEASE_DATE, hostname)
  return status
}

/**
 * Development hosts never show the badge, so evaluating Pro needs no key.
 * Anything else — including LAN addresses — counts as production.
 */
export function isDevelopmentHost(
  loc: Pick<Location, 'hostname' | 'protocol'> | undefined,
): boolean {
  if (!loc) return true
  if (loc.protocol === 'file:') return true
  const host = loc.hostname.replace(/^\[|\]$/g, '')
  return (
    host === '' ||
    host === 'localhost' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    /^127\./.test(host) ||
    /\.(localhost|local|test)$/.test(host)
  )
}

/**
 * Called by every Pro package when it is used. Without a valid key on a
 * production host it shows one small badge per page and logs one warning.
 * It never throws, never blocks editing and never touches the document.
 *
 * `key` is the licence a caller received as a prop or an option; registering
 * it here is the same as calling `setLicenseKey` yourself, and it still lands
 * before the badge check, which waits a tick.
 */
export function requirePro(feature: string, key?: string | null): void {
  if (key) setLicenseKey(key)
  features.add(feature)
  schedule()
}

function schedule() {
  if (scheduled) return
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (isDevelopmentHost(window.location)) return
  scheduled = true
  // Wait a tick so a `setLicenseKey` call made after the editor mounts still
  // counts, instead of flashing the badge on every licensed page load.
  setTimeout(() => {
    scheduled = false
    void getLicenseStatus().then(apply)
  }, 0)
}

function apply(result: LicenseStatus) {
  const existing = document.getElementById(BADGE_ID)
  if (result.valid) {
    existing?.remove()
    return
  }
  if (!warned) {
    warned = true
    console.warn(
      `[RichKit Pro] ${[...features].join(', ')} ${features.size === 1 ? 'is' : 'are'} unlicensed (${result.reason}). ` +
        `Get a licence at ${PRICING_URL} and call setLicenseKey(). The editor keeps working.`,
    )
  }
  if (existing || !document.body) return
  const badge = document.createElement('a')
  badge.id = BADGE_ID
  badge.href = PRICING_URL
  badge.target = '_blank'
  badge.rel = 'noopener'
  badge.textContent = 'RichKit Pro · unlicensed'
  badge.setAttribute(
    'style',
    [
      'position:fixed',
      'right:12px',
      'bottom:12px',
      'z-index:2147483647',
      'padding:4px 10px',
      'border-radius:999px',
      'background:rgba(17,17,17,.82)',
      'color:#fff',
      'font:500 12px/1.4 system-ui,sans-serif',
      'text-decoration:none',
      'pointer-events:auto',
    ].join(';'),
  )
  document.body.appendChild(badge)
}

/** Test hook: forget the key, the registered features and the badge. */
export function __resetLicenseForTests(): void {
  licenseKey = null
  status = null
  features.clear()
  scheduled = false
  warned = false
  document.getElementById(BADGE_ID)?.remove()
}
