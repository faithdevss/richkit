// Mint a RichKit Pro licence key after a Lemon Squeezy order.
//
//   pnpm license:mint --company "Acme Ltd" --email dev@acme.com --plan business \
//     [--order 12345] [--years 1 | --forever] [--domains example.com,*.example.io]
//
// --years sets how long the key keeps covering new releases (default 1). The
// key never stops working on releases inside that window. --forever covers
// every release; lifetime keys always get it. --domains restricts the key
// to those hostnames; use it for any key that ships in a public bundle.
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { privateKeyPath } from './paths.mjs'

const PLANS = ['startup', 'business', 'lifetime', 'enterprise']

const { values } = parseArgs({
  options: {
    company: { type: 'string' },
    email: { type: 'string' },
    plan: { type: 'string' },
    order: { type: 'string' },
    years: { type: 'string', default: '1' },
    forever: { type: 'boolean', default: false },
    domains: { type: 'string' },
  },
})

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!values.company) fail('--company is required')
if (!values.email) fail('--email is required')
if (!PLANS.includes(values.plan)) fail(`--plan must be one of ${PLANS.join(', ')}`)
const years = Number(values.years)
if (!values.forever && !(Number.isInteger(years) && years > 0))
  fail('--years must be a positive integer')

let license
try {
  license = await import('../../packages/license/dist/index.js')
} catch {
  fail('Build the licence package first: pnpm --filter @richkitjs/license build')
}

let privateJwk
try {
  privateJwk = JSON.parse(readFileSync(privateKeyPath(), 'utf8'))
} catch {
  fail(`No private key at ${privateKeyPath()}. Run pnpm license:keygen, or restore your backup.`)
}
const privateKey = await crypto.subtle.importKey(
  'jwk',
  privateJwk,
  { name: 'ECDSA', namedCurve: 'P-256' },
  false,
  ['sign'],
)

const today = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const until = new Date(today)
until.setUTCFullYear(until.getUTCFullYear() + years)

const payload = {
  v: 1,
  id:
    values.order ?? `rk_${iso(today).replace(/-/g, '')}_${Math.random().toString(36).slice(2, 8)}`,
  company: values.company,
  email: values.email,
  plan: values.plan,
  issued: iso(today),
  updatesUntil: values.forever || values.plan === 'lifetime' ? null : iso(until),
}
if (values.domains)
  payload.domains = values.domains
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)

const key = await license.signLicensePayload(payload, privateKey)

// Check the key against the public key the shipped build embeds, so a key
// minted with the wrong private key is caught here rather than by a customer.
const check = await license.verifyLicenseKey(key, license.PUBLIC_KEY)
if (!check.valid && check.reason !== 'unconfigured') {
  fail(`Minted key failed verification (${check.reason}). Wrong private key for this build?`)
}

console.log(JSON.stringify(payload, null, 2))
console.log('\n' + key + '\n')
if (!check.valid) {
  console.warn(
    'Note: packages/license/src/public-key.ts is not set yet, so builds reject every key.',
  )
}
