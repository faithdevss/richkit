// Generate the RichKit Pro signing key pair. Run once, ever.
//
//   pnpm license:keygen
//
// The private key is written outside the repository (default
// ~/.richkit/license-private.jwk, override with RICHKIT_LICENSE_PRIVATE_KEY)
// and must be backed up somewhere safe: lose it and no new key can be minted
// that existing builds accept. The public key is printed for
// packages/license/src/public-key.ts.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { privateKeyPath } from './paths.mjs'

const path = privateKeyPath()
if (existsSync(path)) {
  console.error(`Refusing to overwrite the existing private key at ${path}.`)
  process.exit(1)
}

const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
  'sign',
  'verify',
])
const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
const { kty, crv, x, y } = await crypto.subtle.exportKey('jwk', pair.publicKey)

mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
writeFileSync(path, JSON.stringify(privateJwk, null, 2) + '\n', { mode: 0o600 })

console.log(`Private key written to ${path} — back it up now.\n`)
console.log('Paste this into packages/license/src/public-key.ts:\n')
console.log(
  `export const PUBLIC_KEY: JsonWebKey | null = ${JSON.stringify({ kty, crv, x, y }, null, 2)}`,
)
