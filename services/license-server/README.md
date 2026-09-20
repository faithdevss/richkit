# RichKit Pro licence server

Mints and emails a RichKit Pro licence key when Lemon Squeezy reports a
purchase or a renewal. Replaces running `pnpm license:mint` by hand after each
order email; that script stays for enterprise deals and one-off keys.

Nothing a customer runs ever talks to this server. Keys are ECDSA P-256
signatures verified offline in the browser against the public key baked into
the shipped build, so an outage here delays a new key — it never breaks anyone's
editor.

No dependencies: Node 18+ and the standard library. Deploy by copying the
folder.

```
POST /webhooks/lemonsqueezy   Lemon Squeezy → mint → email
POST /recover   {"email":…}   resend the latest key for an address
GET  /health                  liveness, plus how many licences are on file
```

## What it mints

| Lemon Squeezy event                             | Result                                     |
| ----------------------------------------------- | ------------------------------------------ |
| `order_created`, lifetime variant               | one key, `updatesUntil: null`              |
| `order_created`, subscription variant           | ignored — the subscription events cover it |
| `subscription_created`                          | key covering releases up to `renews_at`    |
| `subscription_updated` with a later `renews_at` | same licence id re-minted, "renewed" email |
| anything else, or a renewal that moves nothing  | acknowledged, no key                       |

A licence id (`ls_sub_…`, `ls_order_…`) is stable for the life of the customer,
so a renewal extends the same licence rather than issuing an unrelated key, and
a replayed webhook is a no-op. Every mint is appended to `orders.jsonl` before
the email goes out, so a mail failure never loses a key.

## Install

On the server, as root:

```bash
adduser --system --group --home /home/richkit richkit
mkdir -p /opt/richkit-license /var/lib/richkit-license
rsync -a services/license-server/ /opt/richkit-license/   # from your machine
chown -R richkit:richkit /opt/richkit-license /var/lib/richkit-license
```

Put the signing key in place. Either copy the existing
`~/.richkit/license-private.jwk` from the machine you minted on, or run
`pnpm license:keygen` once and paste the printed public key into
`packages/license/src/public-key.ts` before shipping any build:

```bash
install -o richkit -g richkit -m 600 license-private.jwk /home/richkit/.richkit/license-private.jwk
```

Configure and start:

```bash
cp /opt/richkit-license/.env.example /opt/richkit-license/.env
chown richkit:richkit /opt/richkit-license/.env && chmod 600 /opt/richkit-license/.env
# fill in .env, then:
cp /opt/richkit-license/richkit-license.service /etc/systemd/system/
systemctl enable --now richkit-license
journalctl -u richkit-license -f
```

Or, if the box already runs pm2:

```bash
cd /opt/richkit-license
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup
```

Keep it to one instance. The rate-limit counters and the index of issued keys
are in-process, so cluster mode would give each worker a different view.

Set `EXPECTED_PUBLIC_KEY_X` in `.env` to the `x` value in
`packages/license/src/public-key.ts`. The service then refuses to start on the
wrong key pair, instead of minting keys no build will ever accept.

## Why this is its own process

The private signing key cannot be rotated: its public half is compiled into
every RichKit build ever shipped, so a leak cannot be undone without breaking
released versions. That argues for keeping it behind as little code as
possible — this service is a few hundred lines with no dependencies and one
route that accepts input.

Folding the endpoint into the showcase app (a Next.js port, say) would put that
key in the same process as server-rendered pages, MDX and a large dependency
tree, and would trade a free CDN for a process you have to keep alive. If you
do want one hostname for site and API, route by path in the proxy instead and
leave the two processes apart:

```caddy
richkit.yourdomain.com {
	handle /api/licenses/* {
		uri strip_prefix /api/licenses
		reverse_proxy 127.0.0.1:8787
	}
	handle {
		root * /var/www/richkit
		file_server
	}
}
```

## In front of it

The service binds to `127.0.0.1:8787` and speaks plain HTTP. Terminate TLS
outside it.

Caddy:

```caddy
licenses.yourdomain.com {
	reverse_proxy 127.0.0.1:8787
}
```

nginx:

```nginx
server {
	listen 443 ssl;
	server_name licenses.yourdomain.com;
	# ssl_certificate … (certbot)

	location / {
		proxy_pass http://127.0.0.1:8787;
		proxy_set_header X-Forwarded-For $remote_addr;
	}
}
```

Firewall to 80/443 only. The Node port must not be reachable from outside.

## Lemon Squeezy

1. Settings → Webhooks → add `https://licenses.yourdomain.com/webhooks/lemonsqueezy`.
2. Subscribe to `order_created`, `subscription_created`, `subscription_updated`.
3. Copy the signing secret into `LS_WEBHOOK_SECRET`.
4. Products → each variant → copy the variant id into the matching `VARIANT_*`.
5. Leave Lemon Squeezy's own licence-key feature **off**. Its keys are random
   strings that need an API call to check; ours are signed and verify offline.
6. To capture a company name for the licence, append
   `?checkout[custom][company]=` to the checkout URL, or add a custom field at
   checkout. Without one the buyer's name is used.

Test in Lemon Squeezy's test mode first: a test-mode purchase fires the same
webhooks, and the webhook page can replay a delivery.

## Verify the whole path before going live

```bash
node --test test/smoke.mjs
```

Starts the server on a throwaway key pair, posts signed webhooks at it, and
checks the minted keys with `@richkitjs/license`'s own verifier — the same code
a customer's build runs. Requires `pnpm --filter @richkitjs/license build` once.

## Operating it

- **Back up two files**: the private JWK and `orders.jsonl`. With both, every
  key ever issued can be resent; without the JWK, no new key that existing
  builds accept can ever be minted.
- **Refunds and chargebacks cannot be revoked.** An offline key stays valid for
  the window it was minted with. That is the cost of having no licence server in
  the customer's runtime path; the annual window caps the exposure.
- **A failed mint returns 500 on purpose** so Lemon Squeezy retries. Repeats are
  safe.
- **`/recover` is rate limited** to 3 per address and 20 per IP an hour, and
  answers identically for unknown addresses so it cannot be used to find out who
  a customer is. Wire the pricing page's "lost your key" link to it.
