// Turning a Lemon Squeezy webhook into "mint this key, or don't".
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Lemon Squeezy signs the raw request body with the store's webhook signing
 * secret and sends the hex digest in X-Signature. The body must be the exact
 * bytes received: parsing and re-stringifying changes them and the check fails.
 */
export function verifySignature(rawBody, signature, secret) {
  if (!signature) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest()
  let received
  try {
    received = Buffer.from(signature, 'hex')
  } catch {
    return false
  }
  if (received.length !== expected.length) return false
  return timingSafeEqual(expected, received)
}

const PLAN_OF_VARIANT = new Map()

/** Build the variant-id -> plan table from the VARIANT_* environment variables. */
export function configurePlans(env) {
  PLAN_OF_VARIANT.clear()
  const add = (value, plan) => {
    for (const id of (value ?? '').split(',')) {
      const trimmed = id.trim()
      if (trimmed) PLAN_OF_VARIANT.set(trimmed, plan)
    }
  }
  add(env.VARIANT_STARTUP, 'startup')
  add(env.VARIANT_BUSINESS, 'business')
  add(env.VARIANT_LIFETIME, 'lifetime')
  return PLAN_OF_VARIANT.size
}

export function planForVariant(variantId) {
  return PLAN_OF_VARIANT.get(String(variantId)) ?? null
}

const isoDate = (value) => new Date(value).toISOString().slice(0, 10)

/**
 * Decide what a webhook should mint, or null to acknowledge and do nothing.
 *
 * Subscriptions are handled entirely through the subscription events, because
 * those carry the variant, the buyer and the paid-through date in one object;
 * `order_created` for a subscription is skipped so the same purchase is not
 * minted twice. Lifetime purchases are one-time orders and come only from
 * `order_created`.
 *
 * The licence id is derived from the Lemon Squeezy object, so a renewal
 * re-mints the *same* licence with a later `updatesUntil` rather than issuing
 * an unrelated key, and a replayed webhook maps onto the existing record.
 */
export function intentFor(body) {
  const event = body?.meta?.event_name
  const data = body?.data
  const attrs = data?.attributes
  if (!event || !attrs) return null
  const company = body?.meta?.custom_data?.company?.trim()

  if (event === 'order_created') {
    if (attrs.status === 'refunded') return null
    const plan = planForVariant(attrs.first_order_item?.variant_id)
    // Subscription orders are minted from subscription_created instead.
    if (plan !== 'lifetime') return null
    return {
      licenseId: `ls_order_${data.id}`,
      plan,
      email: attrs.user_email,
      company: company || attrs.user_name || attrs.user_email,
      issued: isoDate(attrs.created_at),
      // Lifetime covers every release, now and later.
      updatesUntil: null,
      orderId: String(data.id),
    }
  }

  if (event === 'subscription_created' || event === 'subscription_updated') {
    // Only a subscription that is paid up should extend a key. A cancelled one
    // keeps its existing key: it stays valid for everything released inside the
    // window already paid for, which is the whole point of offline keys.
    if (!['active', 'on_trial', 'cancelled'].includes(attrs.status)) return null
    const plan = planForVariant(attrs.variant_id)
    if (!plan) return null
    // `renews_at` is the paid-through date and moves forward on each renewal;
    // `ends_at` is set once a cancellation is scheduled.
    const paidThrough = attrs.renews_at ?? attrs.ends_at
    if (!paidThrough) return null
    return {
      licenseId: `ls_sub_${data.id}`,
      plan,
      email: attrs.user_email,
      company: company || attrs.user_name || attrs.user_email,
      issued: isoDate(attrs.created_at ?? Date.now()),
      updatesUntil: isoDate(paidThrough),
      orderId: String(attrs.order_id ?? data.id),
    }
  }

  return null
}
