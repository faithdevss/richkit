// RichKit Pro licence server.
//
//   node server.mjs
//
// One job: a Lemon Squeezy webhook arrives, this mints the matching offline
// licence key with the private signing key on this machine and emails it.
// Nothing is ever asked of it at runtime by a customer's editor — the keys it
// issues are verified offline, in the browser, against the public key baked
// into the shipped build.
//
// Listens on 127.0.0.1 by default: put nginx or Caddy in front for TLS.
import { createServer } from 'node:http'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { loadSigningKey, signLicensePayload, verifyOwnKey } from './lib/sign.mjs'
import { openStore } from './lib/store.mjs'
import { configurePlans, intentFor, verifySignature } from './lib/lemonsqueezy.mjs'
import { sendLicenseEmail } from './lib/email.mjs'

const env = process.env
const PORT = Number(env.PORT ?? 8787)
const HOST = env.HOST ?? '127.0.0.1'
const WEBHOOK_SECRET = env.LS_WEBHOOK_SECRET
const PRIVATE_KEY_PATH =
  env.RICHKIT_LICENSE_PRIVATE_KEY ?? join(homedir(), '.richkit', 'license-private.jwk')
const ORDERS_FILE = env.ORDERS_FILE ?? join(process.cwd(), 'orders.jsonl')
const MAX_BODY = 512 * 1024

// A lifetime key covers every future release and can never be revoked, so a
// buyer who refunds would keep it for ever. A lifetime order therefore gets a
// provisional key first, covering releases up to the end of this hold, and the
// permanent key is minted only once the hold has passed without a refund. The
// default is the 30-day refund window plus a few days for a refund requested on
// the last day to be processed. 0 mints the permanent key at once.
const LIFETIME_HOLD_DAYS = Math.max(0, Number(env.LIFETIME_HOLD_DAYS ?? 35) || 0)
const SWEEP_INTERVAL_MS = Number(env.SWEEP_INTERVAL_MS ?? 60 * 60 * 1000)

const today = () => new Date().toISOString().slice(0, 10)
const addDays = (iso, days) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)

function fatal(message) {
  console.error(message)
  process.exit(1)
}

if (!WEBHOOK_SECRET) fatal('LS_WEBHOOK_SECRET is required — without it anyone can mint keys.')
const planCount = configurePlans(env)
if (!planCount) fatal('Set at least one of VARIANT_STARTUP/BUSINESS/LIFETIME.')

let signing
try {
  signing = await loadSigningKey(PRIVATE_KEY_PATH)
} catch (error) {
  fatal(`Cannot read the private key at ${PRIVATE_KEY_PATH}: ${error.message}`)
}

// A key minted with the wrong pair verifies here but fails in every shipped
// build, and we would only find out from a customer. Compare against the
// public key the build embeds (packages/license/src/public-key.ts) when it is
// configured, and print the fingerprint either way so it can be eyeballed.
if (env.EXPECTED_PUBLIC_KEY_X && env.EXPECTED_PUBLIC_KEY_X !== signing.publicJwk.x) {
  fatal(
    `The private key at ${PRIVATE_KEY_PATH} is not the pair shipped builds trust.\n` +
      `  expected x: ${env.EXPECTED_PUBLIC_KEY_X}\n  this key x: ${signing.publicJwk.x}`,
  )
}

const mail = {
  provider: env.MAIL_PROVIDER ?? 'resend',
  apiKey: env.RESEND_API_KEY ?? env.POSTMARK_API_KEY ?? '',
  from: env.MAIL_FROM ?? 'RichKit <licenses@richkit.dev>',
  bcc: env.MAIL_BCC ?? '',
  stream: env.POSTMARK_STREAM,
}

const store = openStore(ORDERS_FILE)

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function send(res, status, payload) {
  const text = JSON.stringify(payload)
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  res.end(text)
}

/**
 * Mint, record and deliver. The record is written before the email, so a mail
 * outage never loses a key: the buyer can always recover it.
 *
 * Re-minting is how a renewal works, and also how a replayed webhook is made
 * harmless — the same licence id with an `updatesUntil` that has not moved
 * forward is a no-op, and nothing is emailed twice.
 */
async function issue(intent) {
  const existing = store.get(intent.licenseId)
  // Lifetime starts provisional; `finalizeLifetime` swaps in the permanent key.
  // The date is derived from the order, so a replayed webhook lands on the
  // same window and is recognised as a duplicate below.
  const finalizeOn =
    intent.plan === 'lifetime' && LIFETIME_HOLD_DAYS > 0
      ? addDays(intent.issued, LIFETIME_HOLD_DAYS)
      : undefined
  if (finalizeOn) intent = { ...intent, updatesUntil: finalizeOn }
  if (existing) {
    const sameWindow = existing.payload.updatesUntil === intent.updatesUntil
    const notNewer =
      existing.payload.updatesUntil === null ||
      (intent.updatesUntil !== null && intent.updatesUntil <= existing.payload.updatesUntil)
    if (sameWindow || notNewer) return { status: 'duplicate', licenseId: intent.licenseId }
  }

  const payload = {
    v: 1,
    // Stable across renewals, so a leaked key always traces back to its buyer.
    id: intent.licenseId,
    company: intent.company,
    email: intent.email,
    plan: intent.plan,
    issued: existing?.payload.issued ?? intent.issued,
    updatesUntil: intent.updatesUntil,
  }

  const key = await signLicensePayload(payload, signing.privateKey)
  if (!(await verifyOwnKey(key, signing.publicKey))) {
    throw new Error('minted key failed its own verification — refusing to send it')
  }

  store.put({
    licenseId: intent.licenseId,
    orderId: intent.orderId,
    email: intent.email,
    plan: intent.plan,
    payload,
    key,
    ...(finalizeOn ? { finalizeOn } : {}),
  })

  await sendLicenseEmail(mail, {
    to: intent.email,
    key,
    payload,
    renewal: Boolean(existing),
    finalizeOn,
  })
  console.log(
    `[issue] ${existing ? 'renewed' : 'minted'} ${intent.licenseId} (${intent.plan}${finalizeOn ? `, provisional until ${finalizeOn}` : ''}) for ${intent.email}`,
  )
  return { status: existing ? 'renewed' : 'issued', licenseId: intent.licenseId }
}

/** Mark every licence bought with an order as refunded. */
function recordRefund(orderId) {
  const hit = store.all().filter((r) => r.orderId === orderId && !r.refunded)
  for (const record of hit) {
    const { recordedAt: _recordedAt, ...rest } = record
    store.put({ ...rest, refunded: true, refundedOn: today() })
    if (record.finalizeOn) {
      console.log(`[refund] ${record.licenseId}: permanent lifetime key will not be issued`)
    } else if (record.payload.updatesUntil === null) {
      // Past the hold, so the permanent key is already out and cannot be recalled.
      console.warn(`[refund] ${record.licenseId}: refunded AFTER its permanent key was issued`)
    } else {
      console.log(`[refund] ${record.licenseId}: recorded`)
    }
  }
  return hit.length
}

/**
 * Swap provisional lifetime keys for permanent ones once their hold is over,
 * and retry any permanent key whose email did not go out. Runs at boot and on
 * a timer; every step is recorded first, so a crash or a mail outage midway
 * is picked up by the next run.
 */
let sweeping = false
async function finalizeLifetime() {
  if (sweeping) return
  sweeping = true
  try {
    const now = today()
    for (const record of store.all()) {
      if (record.refunded) continue
      let current = record
      if (record.finalizeOn && record.finalizeOn <= now) {
        const payload = { ...record.payload, updatesUntil: null }
        const key = await signLicensePayload(payload, signing.privateKey)
        if (!(await verifyOwnKey(key, signing.publicKey))) {
          console.error(`[lifetime] ${record.licenseId}: minted key failed verification`)
          continue
        }
        const { recordedAt: _r, finalizeOn: _f, ...rest } = record
        current = store.put({ ...rest, payload, key, mailPending: true })
        console.log(`[lifetime] ${record.licenseId}: permanent key minted`)
      }
      if (!current.mailPending) continue
      try {
        await sendLicenseEmail(mail, {
          to: current.email,
          key: current.key,
          payload: current.payload,
          permanent: true,
        })
        const { recordedAt: _r, mailPending: _m, ...rest } = current
        store.put(rest)
      } catch (error) {
        console.error(`[lifetime] ${current.licenseId}: email failed, will retry: ${error.message}`)
      }
    }
  } finally {
    sweeping = false
  }
}

// Crude in-memory throttle for the recovery endpoint: enough to stop both
// email enumeration at speed and using us to mail-bomb a customer.
const hits = new Map()
function throttled(bucket, limit, windowMs) {
  const now = Date.now()
  const fresh = (hits.get(bucket) ?? []).filter((t) => now - t < windowMs)
  fresh.push(now)
  hits.set(bucket, fresh)
  if (hits.size > 5000) hits.clear()
  return fresh.length > limit
}

async function handleWebhook(req, res) {
  let raw
  try {
    raw = await readBody(req)
  } catch {
    return send(res, 413, { error: 'body too large' })
  }

  if (!verifySignature(raw, req.headers['x-signature'], WEBHOOK_SECRET)) {
    console.warn('[webhook] rejected: bad signature')
    return send(res, 401, { error: 'bad signature' })
  }

  let body
  try {
    body = JSON.parse(raw.toString('utf8'))
  } catch {
    return send(res, 400, { error: 'bad json' })
  }

  const intent = intentFor(body)
  if (!intent) {
    // Acknowledge anything we deliberately ignore, or Lemon Squeezy retries it
    // for days and eventually disables the endpoint.
    return send(res, 200, { ok: true, ignored: body?.meta?.event_name ?? 'unknown' })
  }
  if (intent.refund) {
    try {
      return send(res, 200, { ok: true, status: 'refund', licences: recordRefund(intent.orderId) })
    } catch (error) {
      console.error(`[webhook] refund of order ${intent.orderId} failed: ${error.message}`)
      return send(res, 500, { error: 'refund not recorded' })
    }
  }
  if (!intent.email) return send(res, 200, { ok: true, ignored: 'no email on the event' })

  try {
    const result = await issue(intent)
    return send(res, 200, { ok: true, ...result })
  } catch (error) {
    // Non-2xx so Lemon Squeezy retries. `issue` is safe to repeat.
    console.error(`[webhook] ${intent.licenseId} failed: ${error.message}`)
    return send(res, 500, { error: 'mint or delivery failed' })
  }
}

async function handleRecover(req, res) {
  let raw
  try {
    raw = await readBody(req)
  } catch {
    return send(res, 413, { error: 'body too large' })
  }
  let email
  try {
    email = String(JSON.parse(raw.toString('utf8')).email ?? '').trim()
  } catch {
    return send(res, 400, { error: 'bad json' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? req.socket.remoteAddress
  if (
    throttled(`ip:${ip}`, 20, 60 * 60 * 1000) ||
    throttled(`em:${email.toLowerCase()}`, 3, 60 * 60 * 1000)
  ) {
    return send(res, 429, { error: 'too many requests' })
  }

  const records = store.forEmail(email)
  // Always the same answer, so this cannot be used to discover who is a customer.
  const reply = { ok: true, message: 'If that address has a licence, the key is on its way.' }
  if (!records.length) return send(res, 200, reply)

  const latest = records[records.length - 1]
  try {
    await sendLicenseEmail(mail, {
      to: latest.email,
      key: latest.key,
      payload: latest.payload,
      renewal: false,
      finalizeOn: latest.finalizeOn,
    })
    console.log(`[recover] resent ${latest.licenseId}`)
  } catch (error) {
    console.error(`[recover] failed for ${latest.licenseId}: ${error.message}`)
  }
  return send(res, 200, reply)
}

const server = createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0]
  if (req.method === 'GET' && path === '/health') {
    return send(res, 200, { ok: true, issued: store.size() })
  }
  if (req.method === 'POST' && path === '/webhooks/lemonsqueezy')
    return void handleWebhook(req, res)
  if (req.method === 'POST' && path === '/recover') return void handleRecover(req, res)
  return send(res, 404, { error: 'not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`[richkit-license] listening on http://${HOST}:${PORT}`)
  console.log(`[richkit-license] private key ${PRIVATE_KEY_PATH}, public x ${signing.publicJwk.x}`)
  console.log(
    `[richkit-license] ${planCount} variant(s) mapped, ${store.size()} licence(s) on file`,
  )
  if (!mail.apiKey)
    console.warn('[richkit-license] no mail provider set — keys will be stored only')
  console.log(
    LIFETIME_HOLD_DAYS
      ? `[richkit-license] lifetime keys become permanent ${LIFETIME_HOLD_DAYS} days after purchase`
      : '[richkit-license] LIFETIME_HOLD_DAYS=0 — lifetime keys are permanent at once; a refund keeps one',
  )
  const sweep = () =>
    finalizeLifetime().catch((error) => console.error(`[lifetime] sweep failed: ${error.message}`))
  void sweep()
  setInterval(sweep, SWEEP_INTERVAL_MS).unref()
})
