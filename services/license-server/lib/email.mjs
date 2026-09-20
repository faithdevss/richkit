// Delivering the key. Resend and Postmark are both a single POST, so the
// provider is whichever API key is configured.
const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  )

function body({ key, payload, renewal }) {
  const covers = payload.updatesUntil
    ? `every RichKit release published up to and including ${payload.updatesUntil}`
    : 'every RichKit release, now and in future'
  const lines = [
    renewal ? 'Your RichKit Pro licence has been renewed.' : 'Thanks for buying RichKit Pro.',
    '',
    'Your licence key:',
    '',
    key,
    '',
    'Register it once, before or after the first editor mounts:',
    '',
    "  import { setLicenseKey } from '@richkitjs/license'",
    `  setLicenseKey('${key.slice(0, 24)}…')`,
    '',
    `This key covers ${covers}. Builds you have already shipped keep working for ever — a lapsed`,
    'licence never breaks production, it only stops covering newer releases.',
    '',
    `Licence: ${payload.company} · ${payload.plan} · ref ${payload.id}`,
    'Lost the key? Reply to this email and we will resend it.',
  ]
  return lines.join('\n')
}

function html({ key, payload, renewal }) {
  return (
    `<div style="font:14px/1.6 system-ui,sans-serif;color:#111">` +
    `<p>${renewal ? 'Your RichKit Pro licence has been renewed.' : 'Thanks for buying RichKit Pro.'}</p>` +
    `<p>Your licence key:</p>` +
    `<pre style="white-space:pre-wrap;word-break:break-all;background:#f5f5f5;padding:12px;border-radius:8px;font:12px/1.5 ui-monospace,monospace">${escapeHtml(key)}</pre>` +
    `<p>Register it once with <code>setLicenseKey()</code> from <code>@richkitjs/license</code>.</p>` +
    `<p>This key covers ${payload.updatesUntil ? `every RichKit release up to and including <strong>${escapeHtml(payload.updatesUntil)}</strong>` : 'every RichKit release, now and in future'}. Builds you have already shipped keep working for ever.</p>` +
    `<p style="color:#666;font-size:12px">${escapeHtml(payload.company)} · ${escapeHtml(payload.plan)} · ref ${escapeHtml(payload.id)}</p>` +
    `</div>`
  )
}

/**
 * Send the key. Throws on a provider error so the caller can return a non-2xx
 * and let Lemon Squeezy retry; the key itself is already stored by then.
 */
export async function sendLicenseEmail(config, { to, key, payload, renewal = false }) {
  const subject = renewal
    ? 'Your RichKit Pro licence key (renewed)'
    : 'Your RichKit Pro licence key'
  if (!config.apiKey) {
    console.warn(`[email] no provider configured — key for ${to} stored but not sent`)
    return { sent: false }
  }

  const isPostmark = config.provider === 'postmark'
  const url = isPostmark ? 'https://api.postmarkapp.com/email' : 'https://api.resend.com/emails'
  const headers = isPostmark
    ? { 'X-Postmark-Server-Token': config.apiKey, 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' }
  const message = isPostmark
    ? {
        From: config.from,
        To: to,
        Bcc: config.bcc || undefined,
        Subject: subject,
        TextBody: body({ key, payload, renewal }),
        HtmlBody: html({ key, payload, renewal }),
        MessageStream: config.stream ?? 'outbound',
      }
    : {
        from: config.from,
        to,
        bcc: config.bcc || undefined,
        subject,
        text: body({ key, payload, renewal }),
        html: html({ key, payload, renewal }),
      }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    throw new Error(`mail provider ${response.status}: ${(await response.text()).slice(0, 300)}`)
  }
  return { sent: true }
}
