// End-to-end check with no Lemon Squeezy and no mail provider: start the
// server on a throwaway key pair, post signed webhooks at it and verify the
// keys it minted with the real verifier customers run.
//
//   node --test test/
import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHmac, randomUUID } from 'node:crypto'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const SECRET = 'test-signing-secret'
const PORT = 8899
const BASE = `http://127.0.0.1:${PORT}`

let child
let ordersFile
let verifyLicenseKey
let publicJwk

function post(path, body) {
  const raw = JSON.stringify(body)
  return fetch(BASE + path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature': createHmac('sha256', SECRET).update(raw).digest('hex'),
    },
    body: raw,
  })
}

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'richkit-license-'))
  ordersFile = join(dir, 'orders.jsonl')
  // A lifetime order that was refunded during its hold, long ago. The boot
  // sweep must leave it provisional for ever.
  writeFileSync(
    ordersFile,
    JSON.stringify({
      licenseId: 'ls_order_800001',
      orderId: '800001',
      email: 'refunded@gone.test',
      plan: 'lifetime',
      payload: {
        v: 1,
        id: 'ls_order_800001',
        company: 'Gone Ltd',
        email: 'refunded@gone.test',
        plan: 'lifetime',
        issued: '2026-01-01',
        updatesUntil: '2026-02-05',
      },
      key: 'seed.key',
      finalizeOn: '2026-02-05',
      refunded: true,
    }) + '\n',
  )

  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ])
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
  const keyPath = join(dir, 'private.jwk')
  writeFileSync(keyPath, JSON.stringify(privateJwk))
  const { kty, crv, x, y } = await crypto.subtle.exportKey('jwk', pair.publicKey)
  publicJwk = { kty, crv, x, y }

  // The verifier the shipped packages use, so the format cannot drift apart.
  ;({ verifyLicenseKey } = await import('../../../packages/license/dist/index.js'))

  child = spawn(process.execPath, ['server.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(PORT),
      LS_WEBHOOK_SECRET: SECRET,
      RICHKIT_LICENSE_PRIVATE_KEY: keyPath,
      ORDERS_FILE: ordersFile,
      VARIANT_BUSINESS: '111',
      VARIANT_LIFETIME: '222',
      LIFETIME_HOLD_DAYS: '35',
      SWEEP_INTERVAL_MS: '100',
      RESEND_API_KEY: '',
      EXPECTED_PUBLIC_KEY_X: x,
    },
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  await new Promise((resolve, reject) => {
    child.stdout.on('data', (d) => String(d).includes('listening') && resolve())
    child.on('exit', (code) => reject(new Error(`server exited early (${code})`)))
    setTimeout(() => reject(new Error('server did not start')), 5000)
  })
})

after(() => child?.kill())

const records = () =>
  readFileSync(ordersFile, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))

test('rejects an unsigned webhook', async () => {
  const response = await fetch(`${BASE}/webhooks/lemonsqueezy`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ meta: { event_name: 'order_created' } }),
  })
  assert.equal(response.status, 401)
})

test('rejects a webhook signed with the wrong secret', async () => {
  const raw = JSON.stringify({ meta: { event_name: 'order_created' } })
  const response = await fetch(`${BASE}/webhooks/lemonsqueezy`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature': createHmac('sha256', 'wrong').update(raw).digest('hex'),
    },
    body: raw,
  })
  assert.equal(response.status, 401)
})

const NOW = new Date().toISOString()
const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10)
const latest = (licenseId) => records().findLast((r) => r.licenseId === licenseId)

const lifetimeOrder = (id, createdAt, email = 'ada@acme.test') => ({
  meta: { event_name: 'order_created', custom_data: { company: 'Acme Ltd' } },
  data: {
    id,
    attributes: {
      status: 'paid',
      user_name: 'Ada',
      user_email: email,
      created_at: createdAt,
      first_order_item: { variant_id: 222 },
    },
  },
})

test('a lifetime order starts on a provisional key, not a permanent one', async () => {
  const response = await post('/webhooks/lemonsqueezy', lifetimeOrder('900001', NOW))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).status, 'issued')

  const record = latest('ls_order_900001')
  const holdEnds = isoDay(Date.parse(NOW.slice(0, 10)) + 35 * 86_400_000)
  assert.equal(record.payload.company, 'Acme Ltd')
  assert.equal(record.payload.plan, 'lifetime')
  assert.equal(record.payload.updatesUntil, holdEnds)
  assert.equal(record.finalizeOn, holdEnds)

  // Works today, checked the way a customer's build checks it — but a refund
  // inside the window does not leave a key that covers every future release.
  assert.equal((await verifyLicenseKey(record.key, publicJwk, NOW.slice(0, 10))).valid, true)
  assert.equal((await verifyLicenseKey(record.key, publicJwk, '2099-01-01')).reason, 'expired')
})

test('a replayed order webhook does not mint again', async () => {
  const before = records().length
  const response = await post('/webhooks/lemonsqueezy', lifetimeOrder('900001', NOW))
  assert.equal((await response.json()).status, 'duplicate')
  assert.equal(records().length, before)
})

test('a refund during the hold is recorded and stops the permanent key', async () => {
  const response = await post('/webhooks/lemonsqueezy', {
    meta: { event_name: 'order_refunded' },
    data: { id: '900001', attributes: { status: 'refunded', user_email: 'ada@acme.test' } },
  })
  const result = await response.json()
  assert.equal(result.status, 'refund')
  assert.equal(result.licences, 1)
  const record = latest('ls_order_900001')
  assert.equal(record.refunded, true)
  assert.notEqual(record.payload.updatesUntil, null)
})

test('a lifetime order past its hold is upgraded to the permanent key', async () => {
  const old = new Date(Date.now() - 40 * 86_400_000).toISOString()
  await post('/webhooks/lemonsqueezy', lifetimeOrder('900003', old, 'lin@delta.test'))
  await new Promise((resolve) => setTimeout(resolve, 500))

  const record = latest('ls_order_900003')
  assert.equal(record.payload.updatesUntil, null)
  assert.equal(record.finalizeOn, undefined)
  assert.equal(record.mailPending, undefined)
  assert.equal((await verifyLicenseKey(record.key, publicJwk, '2099-01-01')).valid, true)

  // And replaying the original order afterwards changes nothing.
  const before = records().length
  const replay = await post(
    '/webhooks/lemonsqueezy',
    lifetimeOrder('900003', old, 'lin@delta.test'),
  )
  assert.equal((await replay.json()).status, 'duplicate')
  assert.equal(records().length, before)
})

test('a refunded lifetime order is never upgraded, however old', async () => {
  for (const id of ['ls_order_800001', 'ls_order_900001']) {
    const record = latest(id)
    assert.equal(record.refunded, true)
    assert.notEqual(record.payload.updatesUntil, null)
  }
})

test('a subscription order is left to the subscription events', async () => {
  const response = await post('/webhooks/lemonsqueezy', {
    meta: { event_name: 'order_created' },
    data: {
      id: '900002',
      attributes: {
        status: 'paid',
        user_email: 'grace@beta.test',
        created_at: '2026-09-20T10:00:00.000000Z',
        first_order_item: { variant_id: 111 },
      },
    },
  })
  assert.equal((await response.json()).ignored, 'order_created')
})

const subscription = (renewsAt) => ({
  meta: { event_name: 'subscription_created', custom_data: { company: 'Beta Inc' } },
  data: {
    id: '700001',
    attributes: {
      status: 'active',
      variant_id: 111,
      order_id: 900002,
      user_name: 'Grace',
      user_email: 'grace@beta.test',
      created_at: '2026-09-20T10:00:00.000000Z',
      renews_at: renewsAt,
    },
  },
})

test('a subscription mints a key covering releases up to its renewal', async () => {
  const response = await post('/webhooks/lemonsqueezy', subscription('2027-09-20T10:00:00.000000Z'))
  assert.equal((await response.json()).status, 'issued')

  const record = records().at(-1)
  assert.equal(record.payload.updatesUntil, '2027-09-20')
  assert.equal(record.payload.plan, 'business')

  // Valid for a release inside the window, not for one after it — and the
  // customer's already-shipped build keeps working either way.
  assert.equal((await verifyLicenseKey(record.key, publicJwk, '2027-01-01')).valid, true)
  const late = await verifyLicenseKey(record.key, publicJwk, '2028-01-01')
  assert.equal(late.valid, false)
  assert.equal(late.reason, 'expired')
})

test('a renewal extends the same licence id', async () => {
  const response = await post('/webhooks/lemonsqueezy', {
    ...subscription('2028-09-20T10:00:00.000000Z'),
    meta: { event_name: 'subscription_updated' },
  })
  const result = await response.json()
  assert.equal(result.status, 'renewed')

  const record = records().at(-1)
  assert.equal(record.licenseId, 'ls_sub_700001')
  assert.equal(record.payload.updatesUntil, '2028-09-20')
  assert.equal((await verifyLicenseKey(record.key, publicJwk, '2028-01-01')).valid, true)
})

test('an unrelated subscription_updated does not re-issue', async () => {
  const before = records().length
  const response = await post('/webhooks/lemonsqueezy', {
    ...subscription('2028-09-20T10:00:00.000000Z'),
    meta: { event_name: 'subscription_updated' },
  })
  assert.equal((await response.json()).status, 'duplicate')
  assert.equal(records().length, before)
})

test('recovery answers the same whether or not the address is a customer', async () => {
  const known = await (await post('/recover', { email: 'ada@acme.test' })).json()
  const unknown = await (await post('/recover', { email: 'nobody@nowhere.test' })).json()
  assert.deepEqual(known, unknown)
})

test('health reports how many licences are on file', async () => {
  const body = await (await fetch(`${BASE}/health`)).json()
  assert.equal(body.ok, true)
  assert.ok(body.issued >= 2)
})
