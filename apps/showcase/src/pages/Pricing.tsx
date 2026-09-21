import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/SiteIcons'
import {
  CHECKOUT_BUSINESS,
  CHECKOUT_LIFETIME,
  CHECKOUT_STARTUP,
  lemonConfigured,
  useLemonCheckout,
} from '../lib/lemonsqueezy'

// Where "talk to a human" goes — purchase orders, signed agreements, SLAs.
const CONTACT = 'https://github.com/faithdevss/richkit/issues/new?title=License%20enquiry'

type Plan = {
  tag: string
  price: string
  per?: string
  note: string
  includes: string[]
  checkout?: string
  cta: string
  primary?: boolean
}

const FREE_INCLUDES = [
  'MIT licence — any use, commercial or not',
  'Core editor, React and Vue bindings',
  'Starter kit and every basic extension',
  'Tables, images, links, lists, markdown, HTML',
  'Minimal, HTML, Markdown and Mentions editors',
  'Pro packages on localhost, no key needed',
]

const PLANS: Plan[] = [
  {
    tag: 'Startup',
    price: '$99',
    per: '/ year',
    note: 'Up to 3 developers, one product or internal tool.',
    includes: [
      'Every Pro package',
      'One product or internal tool',
      'Updates while the licence is active',
      'Keep every version you paid for, forever',
    ],
    checkout: CHECKOUT_STARTUP,
    cta: 'Buy Startup',
  },
  {
    tag: 'Business',
    price: '$499',
    per: '/ year',
    note: 'Up to 20 developers, for your whole company.',
    includes: [
      'Every Pro package',
      'Unlimited products and client projects',
      'Priority email support',
      'Keep every version you paid for, forever',
    ],
    checkout: CHECKOUT_BUSINESS,
    cta: 'Buy Business',
    primary: true,
  },
  {
    tag: 'Lifetime',
    price: '$3,000',
    per: 'once',
    note: 'Business rights, bought outright. Survives budget cycles and procurement freezes.',
    includes: [
      'Everything in Business',
      'Never expires',
      'Every future version, no renewal',
      'One invoice, one purchase order, done',
    ],
    checkout: CHECKOUT_LIFETIME,
    cta: 'Buy lifetime',
  },
]

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'What is free and what is Pro?',
    a: 'Free (MIT): the core editor, React and Vue bindings, the starter kit, every basic extension, and the Minimal, HTML, Markdown, Mentions, Comment box and Find & replace editors. Pro: DOCX import and export, track changes, comments, the AI extensions, and the Simple, Notion, Classic, Question, Comments, Track changes, DOCX and Agent editors.',
  },
  {
    q: 'How does the licence key work?',
    a: (
      <>
        You get a signed key by email after purchase, then either call{' '}
        <code>setLicenseKey(key)</code> once at startup or pass it as the <code>licenseKey</code>{' '}
        prop on any Pro editor. It is checked inside your app — no network call, no activation, no
        telemetry. See the <Link to="/docs/licensing">licensing docs</Link>.
      </>
    ),
  },
  {
    q: 'I lost my key — can you resend it?',
    a: (
      <>
        Email <a href="mailto:support@richkit.dev">support@richkit.dev</a> from the address you
        bought with. We check the order and resend the same key to that address — nothing is
        revoked, so a live build keeps working meanwhile. Keys can also be locked to your own
        domains on request; see the <Link to="/docs/licensing">licensing docs</Link>.
      </>
    ),
  },
  {
    q: 'What happens without a key?',
    a: 'On localhost and development hosts, nothing — Pro runs clean. On a production site, Pro packages show a small “unlicensed” badge. They never stop working, never block editing, and never lose content.',
  },
  {
    q: 'What happens if I stop paying?',
    a: 'Your key keeps working, forever, with every version released while your licence was active — in products already shipped and in new ones. You just do not get versions released after that.',
  },
  {
    q: 'What if RichKit Pro is ever discontinued?',
    a: 'Nothing breaks. Keys are checked offline, with no server of ours involved, so every key keeps working with every version it covers, for ever. You also have the full source. Lifetime covers every version we release, for as long as we release them.',
  },
  {
    q: 'Which plan do I need?',
    a: 'Startup if you have up to three developers working on one product. Business for up to 20 developers and any number of products. Bigger than that, or need an SLA or invoicing? Talk to us about Enterprise.',
  },
  {
    q: 'Can I read and modify the source?',
    a: (
      <>
        Yes. The full source, Pro included, is on{' '}
        <a href="https://github.com/faithdevss/richkit" target="_blank" rel="noreferrer">
          GitHub
        </a>
        . You may modify it for your own use, but not republish the Pro packages or remove the
        licence check.
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
  const { openCheckout } = useLemonCheckout()

  // Forks and local clones ship without buy URLs. Rather than render a button
  // that does nothing, those builds fall back to the enquiry link.
  function BuyButton({ checkout, label }: { checkout?: string; label: string }) {
    if (!lemonConfigured || !checkout) {
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
        onClick={() => openCheckout(checkout)}
      >
        <Icon name="plus" size={17} />
        {label}
      </button>
    )
  }

  return (
    <>
      <section className="shell page-head">
        <div className="page-eyebrow">Pricing</div>
        <h1 className="page-title">Free core. Pro, priced for your size.</h1>
        <p className="page-lede">
          The editor is MIT and free forever. Track changes, comments, DOCX round-tripping and AI
          cost four figures a month almost everywhere else. Here they are Pro, from $99 a year,
          self-hosted, with no per-document fees and no usage metering.
        </p>
      </section>

      <section className="shell price-section">
        <div className="price-grid">
          <div className="price-card">
            <div className="price-card-head">
              <span className="tag">Community</span>
              <div className="price-amount">
                <b>$0</b>
              </div>
              <p className="price-note">MIT. Free forever, for everyone.</p>
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
              <Icon name="code" size={17} />
              Start building
            </Link>
          </div>

          {PLANS.map((plan) => (
            <div className={`price-card${plan.primary ? ' is-primary' : ''}`} key={plan.tag}>
              <div className="price-card-head">
                <span className={`tag${plan.primary ? ' is-included' : ''}`}>{plan.tag}</span>
                <div className="price-amount">
                  <b>{plan.price}</b>
                  {plan.per && <span>{plan.per}</span>}
                </div>
                <p className="price-note">{plan.note}</p>
              </div>
              <ul className="price-list">
                {plan.includes.map((f) => (
                  <li key={f}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <BuyButton checkout={plan.checkout} label={plan.cta} />
            </div>
          ))}
        </div>

        <p className="price-legal">
          <b>Enterprise</b> — more than 20 developers, an SLA, invoicing or a signed agreement?{' '}
          <a href={CONTACT} target="_blank" rel="noreferrer">
            Get in touch
          </a>
          . The full terms are in{' '}
          <a
            href="https://github.com/faithdevss/richkit/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            LICENSE
          </a>{' '}
          (MIT) and{' '}
          <a
            href="https://github.com/faithdevss/richkit/blob/main/LICENSE-COMMERCIAL"
            target="_blank"
            rel="noreferrer"
          >
            LICENSE-COMMERCIAL
          </a>{' '}
          (Pro).
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
            {
              name: 'RichKit Pro',
              cost: 'from $99 / yr',
              sub: 'self-hosted, no per-document fees',
              win: true,
            },
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
