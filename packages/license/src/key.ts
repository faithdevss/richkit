// A licence key is `<payload>.<signature>`, both base64url. The payload is JSON
// describing who bought what; the signature is ECDSA P-256 over the payload's
// base64url text, in the raw 64-byte form WebCrypto produces. Verification
// needs only the public key, so it runs offline in any browser or in Node.

export type LicensePlan = 'startup' | 'business' | 'lifetime' | 'enterprise'

export interface LicensePayload {
  /** Format version. Bump when the payload shape changes. */
  v: 1
  /** Our own order reference, so a leaked key can be traced to its buyer. */
  id: string
  company: string
  email: string
  plan: LicensePlan
  /** ISO date (YYYY-MM-DD) the key was minted. */
  issued: string
  /**
   * ISO date: the key covers every release up to and including this day, for
   * ever. `null` covers every release, past and future.
   */
  updatesUntil: string | null
  /**
   * Optional hostnames the key is restricted to. `*.example.com` matches any
   * subdomain. Used for keys that ship in public bundles, such as our own
   * showcase, so copying one out of a page is useless elsewhere.
   */
  domains?: string[]
}

export type LicenseStatus =
  | { valid: true; payload: LicensePayload }
  | {
      valid: false
      reason:
        'missing' | 'malformed' | 'invalid-signature' | 'expired' | 'wrong-domain' | 'unconfigured'
      payload?: LicensePayload
    }

export const ALGORITHM = { name: 'ECDSA', namedCurve: 'P-256' } as const
export const SIGN_ALGORITHM = { name: 'ECDSA', hash: 'SHA-256' } as const

export function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isPayload(value: unknown): value is LicensePayload {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    p.v === 1 &&
    typeof p.id === 'string' &&
    typeof p.company === 'string' &&
    typeof p.email === 'string' &&
    ['startup', 'business', 'lifetime', 'enterprise'].includes(p.plan as string) &&
    typeof p.issued === 'string' &&
    (p.updatesUntil === null ||
      (typeof p.updatesUntil === 'string' && ISO_DATE.test(p.updatesUntil))) &&
    (p.domains === undefined ||
      (Array.isArray(p.domains) && p.domains.every((d) => typeof d === 'string')))
  )
}

/** Parse the payload half without checking the signature. */
export function decodeLicenseKey(key: string): LicensePayload | null {
  const [body, sig, extra] = key.trim().split('.')
  if (!body || !sig || extra !== undefined) return null
  try {
    const payload: unknown = JSON.parse(new TextDecoder().decode(fromBase64Url(body)))
    return isPayload(payload) ? payload : null
  } catch {
    return null
  }
}

export function matchesDomain(hostname: string, domains: string[]): boolean {
  const host = hostname.toLowerCase()
  return domains.some((d) => {
    const domain = d.toLowerCase()
    return domain.startsWith('*.') ? host.endsWith(domain.slice(1)) : host === domain
  })
}

/**
 * Check a key's signature and whether it covers a release.
 *
 * `releaseDate` is the ISO date of the build doing the checking. When it is
 * unknown (running from source, in tests) the key is treated as covering it.
 * `hostname` is checked against a domain-restricted key; when omitted the
 * restriction is not checked.
 */
export async function verifyLicenseKey(
  key: string | null | undefined,
  publicKey: JsonWebKey | null,
  releaseDate?: string,
  hostname?: string,
): Promise<LicenseStatus> {
  if (!key || !key.trim()) return { valid: false, reason: 'missing' }
  if (!publicKey) return { valid: false, reason: 'unconfigured' }

  const payload = decodeLicenseKey(key)
  if (!payload) return { valid: false, reason: 'malformed' }

  const [body, sig] = key.trim().split('.') as [string, string]
  let ok: boolean
  try {
    const cryptoKey = await crypto.subtle.importKey('jwk', publicKey, ALGORITHM, false, ['verify'])
    ok = await crypto.subtle.verify(
      SIGN_ALGORITHM,
      cryptoKey,
      fromBase64Url(sig),
      new TextEncoder().encode(body),
    )
  } catch {
    ok = false
  }
  if (!ok) return { valid: false, reason: 'invalid-signature' }

  // ISO dates compare correctly as strings.
  if (payload.updatesUntil && releaseDate && releaseDate > payload.updatesUntil) {
    return { valid: false, reason: 'expired', payload }
  }
  if (
    payload.domains?.length &&
    hostname !== undefined &&
    !matchesDomain(hostname, payload.domains)
  ) {
    return { valid: false, reason: 'wrong-domain', payload }
  }
  return { valid: true, payload }
}

/** Sign a payload. Used by the minting script and tests — never shipped with a private key. */
export async function signLicensePayload(
  payload: LicensePayload,
  privateKey: CryptoKey,
): Promise<string> {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await crypto.subtle.sign(SIGN_ALGORITHM, privateKey, new TextEncoder().encode(body))
  return `${body}.${toBase64Url(new Uint8Array(sig))}`
}
