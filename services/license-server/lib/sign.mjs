// Minting half of the licence-key format. This deliberately duplicates the
// small amount of encoding in packages/license/src/key.ts instead of importing
// it, so the server stays a standalone folder with no node_modules to install
// on the box that holds the private key. Keep the two in step: a key is
// `<base64url payload>.<base64url raw ECDSA P-256 signature>` and the payload
// is signed as its own base64url *text*, not as the JSON bytes.
import { readFileSync } from 'node:fs'

const ALGORITHM = { name: 'ECDSA', namedCurve: 'P-256' }
const SIGN_ALGORITHM = { name: 'ECDSA', hash: 'SHA-256' }

function toBase64Url(bytes) {
  return Buffer.from(bytes).toString('base64url')
}

/** Load the private JWK and import both halves of the pair from it. */
export async function loadSigningKey(path) {
  const jwk = JSON.parse(readFileSync(path, 'utf8'))
  const privateKey = await crypto.subtle.importKey('jwk', jwk, ALGORITHM, false, ['sign'])
  // A private JWK carries the public coordinates, so the pair's public half
  // needs no separate file — it is what the shipped build must embed.
  const publicJwk = { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }
  const publicKey = await crypto.subtle.importKey('jwk', publicJwk, ALGORITHM, false, ['verify'])
  return { privateKey, publicKey, publicJwk }
}

export async function signLicensePayload(payload, privateKey) {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await crypto.subtle.sign(SIGN_ALGORITHM, privateKey, new TextEncoder().encode(body))
  return `${body}.${toBase64Url(new Uint8Array(sig))}`
}

/**
 * Verify a freshly minted key against the pair's own public half. This catches
 * a broken payload or encoding here rather than at a customer's build, the
 * same guard scripts/license/mint.mjs applies before printing a key.
 */
export async function verifyOwnKey(key, publicKey) {
  const [body, sig, extra] = key.split('.')
  if (!body || !sig || extra !== undefined) return false
  try {
    return await crypto.subtle.verify(
      SIGN_ALGORITHM,
      publicKey,
      Buffer.from(sig, 'base64url'),
      new TextEncoder().encode(body),
    )
  } catch {
    return false
  }
}
