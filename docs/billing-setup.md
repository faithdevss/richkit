# Billing setup: Lemon Squeezy + Resend

How a RichKit Pro sale turns into a licence key in the buyer's inbox, and every
dashboard field to fill in along the way. Do the whole thing in Lemon Squeezy
**test mode** first, then repeat steps 2, 3 and 6 in live mode — live mode has
its own products, variant ids, checkout URLs and webhook secret.

```
Pricing page ──► Lemon Squeezy checkout ──► buyer pays, enters email
                                               │
                         receipt (no key) ◄────┤
                                               ▼ webhook (user_email, variant_id, renews_at)
                              services/license-server  ──► signs key ──► orders.jsonl
                                               │
                                               ▼ Resend API
                              "Your RichKit Pro licence key" email ──► buyer
```

Lemon Squeezy collects the buyer's email at checkout and hands it to the licence
server in the webhook. Nobody types an email in by hand.

**Contact address: `contact.faithdevs@gmail.com`.** Buyers are sent there for
support, it gets a copy of every key email, and replies to key emails are
forwarded to it. It is never the *sender* — Gmail addresses cannot be verified
in Resend, so key emails go out from `licenses@mail.richkit.dev` (step 4).

---

## 1. Lemon Squeezy store

1. Sign up at <https://lemonsqueezy.com> and create a store.
2. Store settings → set the currency to **USD**. The pricing page shows USD, so
   a BDT store would charge different amounts from what buyers read.
3. Store settings → logo: `docs/icons/richkit-icon-rounded-1024.png`.
4. Store settings → support email: `contact.faithdevs@gmail.com`. Lemon Squeezy
   prints it on receipts and invoices.
5. Switch on **Test mode** (toggle at the bottom of the sidebar).

## 2. Products

Create three products (Store → Products → **+ New product**).

| Name                   | Pricing        | Price | Interval |
| ---------------------- | -------------- | ----- | -------- |
| RichKit Pro — Startup  | Subscription   | 99    | Yearly   |
| RichKit Pro — Business | Subscription   | 499   | Yearly   |
| RichKit Pro — Lifetime | Single payment | 3000  | —        |

Fill each one in like this:

| Section            | Field                   | Value                                                                    |
| ------------------ | ----------------------- | ------------------------------------------------------------------------ |
| General            | Name                    | from the table above                                                     |
|                    | Description             | see below                                                                |
| Pricing            | Pricing model           | Standard pricing                                                         |
|                    | Tax category            | **Software – business use** (or SaaS – business use), not personal use   |
| Media              | Images                  | `docs/icons/richkit-product-1600x1200.png`                               |
| Files              | —                       | leave empty — the code ships on npm                                      |
| Links              | —                       | optional, can leave empty                                                |
| Variants           | —                       | none; the default variant is the one the server maps                     |
| Settings           | Generate license keys   | **OFF** (see "Why not Lemon Squeezy's licence keys")                     |
|                    | Display on storefront   | your choice; the pricing page links straight to checkout                 |
| Confirmation modal | Title                   | `Thanks — you're on RichKit Pro`                                         |
|                    | Message                 | see below                                                                |
|                    | Button text             | `Set up your licence key`                                                |
|                    | Button link             | `faithdevss.github.io/rich_editor/docs/licensing`                        |
| Email receipt      | Thank you note          | see below                                                                |
|                    | Button text             | leave `View Order` (buyers get invoices there)                           |
|                    | Button link             | leave `app.lemonsqueezy.com/my-orders`                                   |

**Descriptions**

- Startup: `Every RichKit Pro package — DOCX, track changes, comments, AI and the Pro editors — for up to 3 developers and one product or internal tool. Updates for a year.`
- Business: `Every RichKit Pro package for up to 20 developers, with unlimited products and client projects, and priority email support. Updates for a year.`
- Lifetime: `Business rights bought outright. Every RichKit Pro package and every future version, with no renewal.`

**Confirmation modal message**

```
Payment done. Your RichKit Pro licence key is on its way in a separate email —
usually within a few minutes. Not there? Check spam, or email contact.faithdevs@gmail.com.
```

**Email receipt thank-you note**

```
Thanks for buying RichKit Pro. Your licence key arrives in a separate email from
licenses@mail.richkit.dev within a few minutes. Setup takes one line:
https://faithdevss.github.io/rich_editor/docs/licensing
Questions: contact.faithdevs@gmail.com
```

### Copy two values from each product

After saving, for each product:

1. **Checkout URL** — product → **Share** → copy
   `https://<store>.lemonsqueezy.com/buy/<uuid>`. Goes to the pricing page (step 6).
2. **Variant id** — the numeric id of the product's variant (product → variant
   settings, or `GET https://api.lemonsqueezy.com/v1/variants`). Goes to the
   licence server `.env` (step 5).

## 3. Webhook

Settings → **Webhooks** → **+**:

- Callback URL: `https://licenses.yourdomain.com/webhooks/lemonsqueezy`
- Signing secret: generate a long random string (`openssl rand -hex 32`) and
  keep it for `LS_WEBHOOK_SECRET`.
- Events: `order_created`, `subscription_created`, `subscription_updated`.

## 4. Resend (sends the key email)

1. Sign up at <https://resend.com>. The free tier (3,000/month, 100/day) is plenty.
2. **Domains → Add domain** → `mail.richkit.dev` (a subdomain keeps this sender's
   reputation apart from your main mail).
3. Add the DNS records Resend shows — MX + SPF on `send.mail…`, DKIM on
   `resend._domainkey.mail…` — plus a DMARC TXT on `_dmarc.richkit.dev`:
   `v=DMARC1; p=none;`. On Cloudflare set them to **DNS only**, not proxied.
4. Click **Verify**; usually minutes, up to an hour.
5. **API Keys → Create** → *Sending access*, restricted to that domain. Copy the
   `re_…` value (shown once).
6. Replies: the key email says "reply to this email". Resend only sends, so
   forward `licenses@mail.richkit.dev` to `contact.faithdevs@gmail.com`
   (Cloudflare Email Routing is free; verify the Gmail address when it asks)
   or nobody will see those replies.

Smoke test before wiring the server:

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_xxx" -H "Content-Type: application/json" \
  -d '{"from":"RichKit <licenses@mail.richkit.dev>","to":"contact.faithdevs@gmail.com","subject":"test","text":"hello"}'
```

## 5. Licence server

Full install (user, systemd/pm2, Caddy/nginx) is in
[`services/license-server/README.md`](../services/license-server/README.md).
The `.env` it needs:

```bash
LS_WEBHOOK_SECRET=<from step 3>
VARIANT_STARTUP=<variant id>
VARIANT_BUSINESS=<variant id>
VARIANT_LIFETIME=<variant id>

RICHKIT_LICENSE_PRIVATE_KEY=/home/richkit/.richkit/license-private.jwk
EXPECTED_PUBLIC_KEY_X=<x from packages/license/src/public-key.ts>

MAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
MAIL_FROM=RichKit <licenses@mail.richkit.dev>
MAIL_BCC=contact.faithdevs@gmail.com   # a copy of every key you send

ORDERS_FILE=/var/lib/richkit-license/orders.jsonl
HOST=127.0.0.1
PORT=8787
```

Only `/webhooks/lemonsqueezy` is exposed through the proxy, over HTTPS.

## 6. Pricing page

GitHub → repo **Settings → Secrets and variables → Actions → Variables**:

| Variable              | Value                                              |
| --------------------- | -------------------------------------------------- |
| `LS_CHECKOUT_STARTUP` | Startup checkout URL                               |
| `LS_CHECKOUT_BUSINESS`| Business checkout URL                              |
| `LS_CHECKOUT_LIFETIME`| Lifetime checkout URL                              |
| `RICHKIT_LICENSE_KEY` | `pnpm license:mint … --domains faithdevss.github.io` |

For local dev, put the same values in `apps/showcase/.env.local` with the
`VITE_` prefix (`VITE_LS_CHECKOUT_STARTUP`, …). Unset, the buy buttons turn into
enquiry links.

## 7. Test end to end

1. `pnpm --filter @richkitjs/license build && node --test services/license-server/test/smoke.mjs`
2. Test mode: buy Startup on the pricing page with card `4242 4242 4242 4242`,
   any future expiry, any CVC.
3. Check, in order:
   - Lemon Squeezy → Settings → Webhooks → the delivery shows **200**
   - server: `journalctl -u richkit-license -f` logs the mint
   - `orders.jsonl` has a new line
   - Resend → Emails shows the send, and the key reaches the inbox (not spam)
4. Paste the key into a local app: `<SimpleEditor licenseKey="…" />` on a
   non-localhost host → no licence banner.
5. Repeat for Business and Lifetime.

Then switch to live mode, recreate the products, and redo steps 2, 3, 5 and 6
with the live values.

---

## Why not Lemon Squeezy's licence keys

Lemon Squeezy can generate keys itself, but they are random strings that are
only checked by calling `api.lemonsqueezy.com`. RichKit runs inside customers'
apps in their users' browsers, so that would mean a third-party network call on
every page load, broken editors whenever Lemon Squeezy is unreachable, and it
would break the "no network call, no telemetry" promise on the pricing page.
RichKit keys are signed and verified offline instead, which is why the toggle
stays off and the licence server exists.

## Day-to-day

- **Support mail** lands in `contact.faithdevs@gmail.com`: direct emails,
  replies to key emails (via the forward in step 4) and the BCC of every key.
  Check the sender matches an order before acting on it.
- **Where are the buyers?** Lemon Squeezy → Customers / Orders / Subscriptions,
  and `orders.jsonl` on the server.
- **Resend a key** (buyer emails "lost my key"): check the address is on an
  order, then on the server
  `curl -X POST 127.0.0.1:8787/recover -H 'content-type: application/json' -d '{"email":"buyer@acme.com"}'`
- **Renewals** re-mint the same licence automatically and email it again.
- **Refunds** cannot revoke a key; it lapses when its update window ends.
- **Back up** the private JWK and `orders.jsonl`. Lose the JWK and no new key
  will ever verify against shipped builds.
- **Enterprise / one-off keys**: `pnpm license:mint`.
- **Keys for our own projects**: edit `scripts/license/self.json` (domains,
  plan, expiry), then `pnpm license:self`. Offline; localhost needs no key at all.
