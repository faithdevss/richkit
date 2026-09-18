import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/SiteIcons'
import { PRICE_ANNUAL, PRICE_LIFETIME, paddleConfigured, usePaddle } from '../lib/paddle'


// Where "talk to a human" goes — purchase orders, signed agreements, SLAs.
const CONTACT = 'https://github.com/faithdevss/richkit/issues/new?title=License%20enquiry'

const COMMERCIAL_INCLUDES = [
  'All packages published under the @richkitjs scope',
  'Unlimited developers — no seat count, no per-dev fee',
  'Unlimited products, internal tools and client work',
  'Ship in closed-source applications',
  'Updates for as long as the licence is active',
  'Keep using the last paid version forever if you stop renewing',
]

const LIFETIME_INCLUDES = [
  'Everything in the annual licence',
  'Updates forever — no renewal, no expiry',
  'One invoice, one purchase order, done',
  'Survives budget cycles and procurement freezes',
]

const FREE_INCLUDES = [
  'Hobby projects and personal study',
  'Learning, research, experiment and testing',
  'Schools, universities and public research bodies',
  'Charities, non-profits and government institutions',
  'The same packages — nothing is held back or crippled',
]

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'What counts as commercial use?',
    a: 'Any use by or on behalf of a business, or in a product, service or internal tool operated for commercial advantage. A solo developer building something they sell is commercial use. A solo developer building something for fun is not.',
  },
  {
    q: 'Is there really no license key?',
    a: 'No key, no activation call, no telemetry. The editor never contacts us. The licence is a contract, not a technical lock — which also means nothing breaks if your users are offline or your build is air-gapped.',
  },
  {
    q: 'What happens if I stop paying?',
    a: 'You keep a perpetual licence to the last version released while you were subscribed, including in products you have already shipped and in new ones. You just do not get versions released after that.',
  },
  {
    q: 'What does lifetime actually mean?',
    a: 'One payment of $999, no renewal, and every version we ever release — not a snapshot of today. It is the same licence and the same terms as the annual one; only the billing differs.',
  },
  {
    q: 'Do I need a licence per developer or per product?',
    a: 'Neither. One licence covers your whole company: every developer, every product, every client project. That is the entire point of the flat price.',
  },
  {
    q: 'Can I evaluate it first?',
    a: 'Yes — 90 days of free commercial use, starting the first time you use RichKit commercially. No signup, no key, no notice to us. Build the real integration, then decide.',
  },
  {
    q: 'Can I read and modify the source?',
    a: (
      <>
        Yes. The full source is on{' '}
        <a href="https://github.com/faithdevss/richkit" target="_blank" rel="noreferrer">
          GitHub
        </a>
        , and the licence lets you modify it for your own use. You cannot republish it or ship it as
        a competing editor toolkit.
      </>
    ),
  },
]

function Check() {
  return (
    <svg
      className="price-check"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function Pricing() {
  const { openCheckout, ready } = usePaddle()

  // Forks and local clones ship without a Paddle token. Rather than render a
  // button that does nothing, those builds fall back to the enquiry link.
  function BuyButton({ priceId, label }: { priceId?: string; label: string }) {
    if (!paddleConfigured || !priceId) {
      return (
        <a href={CONTACT} className="btn-primary price-cta" target="_blank" rel="noreferrer">
          <Icon name="plus" size={17} />
          {label}
        </a>
      )
    }
    return (
      <button
        type="button"
        className="btn-primary price-cta"
        onClick={() => openCheckout(priceId)}
        disabled={!ready}
      >
        <Icon name="plus" size={17} />
        {ready ? label : 'Loading checkout…'}
      </button>
    )
  }

  return (
    <>
      <section className="shell page-head">
        <div className="page-eyebrow">Pricing</div>
        <h1 className="page-title">One price. Every package.</h1>
        <p className="page-lede">
          Track changes, comments, DOCX round-tripping and AI cost four figures a month almost
          everywhere else. Here they are included, for $99 a year or $999 once, with no seat count
          and no usage metering.
        </p>
      </section>

      <section className="shell price-section">
        <div className="price-grid">
          <div className="price-card">
            <div className="price-card-head">
              <span className="tag">Noncommercial</span>
              <div className="price-amount">
                <b>$0</b>
              </div>
              <p className="price-note">
                PolyForm Noncommercial 1.0.0. Free forever, for genuinely noncommercial work.
              </p>
            </div>
            <ul className="price-list">
              {FREE_INCLUDES.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/docs/installation" className="btn-secondary price-cta">
              <Icon name="docs" size={17} />
              Start building
            </Link>
          </div>

          <div className="price-card is-primary">
            <div className="price-card-head">
              <span className="tag is-included">Commercial</span>
              <div className="price-amount">
                <b>$99</b>
                <span>/ year, per company</span>
              </div>
              <p className="price-note">
                Everything below, for your whole organisation. Free for the first 90 days.
              </p>
            </div>
            <ul className="price-list">
              {COMMERCIAL_INCLUDES.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <BuyButton priceId={PRICE_ANNUAL} label="Buy a licence" />
          </div>

          <div className="price-card">
            <div className="price-card-head">
              <span className="tag">Lifetime</span>
              <div className="price-amount">
                <b>$999</b>
                <span>once, per company</span>
              </div>
              <p className="price-note">
                The same licence, bought outright. Pays for itself in year eleven — or the first
                time procurement refuses to approve a recurring line item.
              </p>
            </div>
            <ul className="price-list">
              {LIFETIME_INCLUDES.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <BuyButton priceId={PRICE_LIFETIME} label="Buy lifetime" />
          </div>
        </div>

        <p className="price-legal">
          The full terms are in{' '}
          <a
            href="https://github.com/faithdevss/richkit/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            LICENSE
          </a>{' '}
          and{' '}
          <a
            href="https://github.com/faithdevss/richkit/blob/main/LICENSE-COMMERCIAL"
            target="_blank"
            rel="noreferrer"
          >
            LICENSE-COMMERCIAL
          </a>
          . Need a purchase order, a signed agreement, or an SLA?{' '}
          <a href={CONTACT} target="_blank" rel="noreferrer">
            Get in touch
          </a>
          .
        </p>
      </section>

      <section className="shell section">
        <div className="section-head">
          <div>
            <h2 className="section-title">What the same features cost elsewhere</h2>
            <p className="section-sub">
              List prices for track changes, comments, DOCX and AI on one product — taken from each
              vendor&rsquo;s own pricing page.
            </p>
          </div>
          <Link to="/docs/comparison" className="section-link">
            Full comparison &amp; sources →
          </Link>
        </div>

        <div className="price-compare">
          {[
            { name: 'RichKit', cost: '$99 / yr', sub: 'flat — about $8.25 a month', win: true },
            { name: 'Tiptap', cost: '$588 – $11,988 / yr', sub: 'plus $588 / dev past the seats' },
            { name: 'CKEditor 5', cost: 'from ~$8,400 / yr', sub: 'plus usage past 20,000 loads' },
            { name: 'TinyMCE', cost: 'from ~$6,168 / yr', sub: 'plus usage past 20,000 loads' },
          ].map((r) => (
            <div className={`price-compare-row${r.win ? ' is-win' : ''}`} key={r.name}>
              <b>{r.name}</b>
              <span className="price-compare-cost">{r.cost}</span>
              <span className="price-compare-sub">{r.sub}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Questions</h2>
          </div>
        </div>
        <div className="price-faq">
          {FAQ.map((f) => (
            <div className="price-faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
