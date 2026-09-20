import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// Fill these in before submitting the store for Lemon Squeezy's review. They
// check that the trading entity and contact route are real and reachable, and a
// placeholder here is the most common reason a store gets rejected.
const ENTITY = 'FaithDevs'
const CONTACT_EMAIL = 'support@richkit.dev'
const JURISDICTION = 'Bangladesh'
const UPDATED = '19 September 2026'

// The merchant of record has to be named in the terms. It is not a formality:
// buyers contract with Lemon Squeezy for the payment, and with us for the
// licence, and the two have to be told apart.
const MOR = (
  <>
    Our order process is conducted by our online reseller{' '}
    <a href="https://www.lemonsqueezy.com" target="_blank" rel="noreferrer">
      Lemon Squeezy
    </a>
    . Lemon Squeezy is the Merchant of Record for all our orders. Lemon Squeezy handles payment,
    billing inquiries and returns.
  </>
)

function LegalPage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string
  title: string
  lede: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <section className="shell page-head">
        <div className="page-eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-lede">{lede}</p>
      </section>
      <section className="shell section">
        <div className="legal-body">
          {children}
          <p className="legal-updated">Last updated {UPDATED}.</p>
        </div>
      </section>
    </>
  )
}

export function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of service"
      lede={`The agreement between you and ${ENTITY} covering the RichKit packages, this website, and the RichKit Pro licence.`}
    >
      <h2>Who we are</h2>
      <p>
        RichKit is published by {ENTITY}. These terms cover the RichKit software packages, this
        website, and any RichKit Pro licence you buy from us. Contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Payments and the merchant of record</h2>
      <p>{MOR}</p>
      <p>
        This means Lemon Squeezy, not {ENTITY}, is the seller for your purchase. Lemon Squeezy collects payment,
        charges any applicable VAT or sales tax, issues your invoice, and handles billing support and
        refunds. We remain responsible for the software itself and for the licence you are granted.
      </p>

      <h2>What you are buying</h2>
      <p>
        RichKit is open-core. The core editor and the basic extensions are free under the{' '}
        <a
          href="https://github.com/faithdevss/richkit/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer"
        >
          MIT licence
        </a>
        , for any use, commercial or not. What you buy is a licence to use the Pro packages —
        DOCX import and export, track changes, comments, AI and the Pro editors — in
        production, under the{' '}
        <a
          href="https://github.com/faithdevss/richkit/blob/main/LICENSE-COMMERCIAL"
          target="_blank"
          rel="noreferrer"
        >
          RichKit Pro licence
        </a>
        .
      </p>
      <p>
        Each purchase comes with a licence key, emailed to you within one business day. The key is
        checked entirely inside your application, with no network call, no activation and no
        telemetry — the editor never contacts us, so nothing breaks if your users are offline or
        your build is air-gapped. Without a valid key, Pro packages show a small &ldquo;unlicensed&rdquo;
        badge on production sites. They never stop working or block editing.
      </p>
      <p>
        Plans are priced by company size, as described on the <Link to="/pricing">pricing page</Link>{' '}
        and defined in the Pro licence. Each plan covers the whole company within its limits. If the
        licence files and these terms ever disagree, the licence files govern the software and these
        terms govern the purchase.
      </p>

      <h2>Evaluation</h2>
      <p>
        The Pro packages run on localhost and other development hosts with no key and no badge, so
        you can build the real integration before deciding. You may also run them in production
        without a key for 30 days while you evaluate; the badge shows during that time.
      </p>

      <h2>Renewal and expiry</h2>
      <p>
        Annual plans renew yearly until cancelled. If you stop paying, you keep a perpetual licence
        to every version released while your licence was active, and your key keeps working with
        those versions — in products you have already shipped and in new ones. You simply do not
        receive versions released after that. The lifetime licence is a single payment, does not
        expire, and covers every version we release. We are not obliged to keep releasing new
        versions; if we ever stop, every licence and key keeps working with the versions already
        released.
      </p>

      <h2>What you may not do</h2>
      <p>
        You may read and modify the source for your own use. You may not republish it, redistribute
        it as a competing editor toolkit, or remove copyright and licence notices.
      </p>

      <h2>Warranty and liability</h2>
      <p>
        RichKit is provided “as is”, without warranty of any kind, express or implied. To the fullest
        extent permitted by law, {ENTITY} is not liable for any indirect, incidental or consequential
        damages, and our total liability is limited to the amount you paid us in the twelve months
        before the claim. Nothing here limits liability that cannot be limited by law.
      </p>

      <h2>Changes and governing law</h2>
      <p>
        We may update these terms; the date below shows when they last changed, and material changes
        apply from the date they are published. These terms are governed by the laws of{' '}
        {JURISDICTION}. Questions go to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, and billing questions can also go
        directly to Lemon Squeezy. See also our <Link to="/privacy">privacy policy</Link> and{' '}
        <Link to="/refunds">refund policy</Link>.
      </p>
    </LegalPage>
  )
}

export function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      lede="What this site collects, what the editor collects, and who handles your payment details."
    >
      <h2>The short version</h2>
      <p>
        The RichKit packages collect nothing. The editor makes no network calls to us and has no
        telemetry. The Pro licence key is verified locally, inside your application, and is never
        sent anywhere. Anything you type stays in your application.
      </p>

      <h2>This website</h2>
      <p>
        This site is a static bundle served by GitHub Pages. We run no analytics and set no tracking
        cookies of our own. GitHub logs requests, including IP addresses, as part of serving the
        site; see{' '}
        <a
          href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement"
          target="_blank"
          rel="noreferrer"
        >
          GitHub&rsquo;s privacy statement
        </a>
        .
      </p>

      <h2>Buying a licence</h2>
      <p>
        Checkout is handled by Lemon Squeezy, our merchant of record. When you open a checkout, Lemon Squeezy
        receives the information you enter — name, email address, billing address and payment details
        — and processes it as an independent controller under{' '}
        <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noreferrer">
          Lemon Squeezy&rsquo;s privacy policy
        </a>
        . We never see or store your card details.
      </p>
      <p>
        From Lemon Squeezy we receive the record of your purchase: your name, email address, country,
        and what you bought. We use it to issue your licence key, to know who holds a licence, to
        send licence and release information, and to answer support requests. Your company name and
        email are written into the licence key itself. We do not sell it or use it for advertising.
      </p>

      <h2>Support and email</h2>
      <p>
        If you email us or open a GitHub issue, we keep that correspondence so we can follow up. On
        GitHub, whatever you post is public and governed by GitHub&rsquo;s own policies.
      </p>

      <h2>Retention and your rights</h2>
      <p>
        We keep purchase records for as long as needed to support the licence and to meet tax and
        accounting obligations. You can ask us for a copy of what we hold, ask us to correct it, or
        ask us to delete it where we are not required to keep it — write to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Requests about payment data are best
        sent to Lemon Squeezy, who hold it.
      </p>
    </LegalPage>
  )
}

export function Refunds() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund policy"
      lede="A 30-day refund on any licence, handled by Lemon Squeezy, our merchant of record."
    >
      <h2>30 days, no argument</h2>
      <p>
        If a RichKit licence is not right for you, ask for a refund within 30 days of purchase and
        you will get your money back in full. That applies to both the annual and the lifetime
        licence, on every plan. You do not need to justify the request.
      </p>
      <p>
        The Pro packages run without a key on development hosts, so we would rather you tried them
        properly first than bought and returned them.
      </p>

      <h2>How to request one</h2>
      <p>{MOR}</p>
      <p>
        Because Lemon Squeezy is the merchant of record, refunds are issued by Lemon Squeezy. Request
        one from the receipt email Lemon Squeezy sent you, or email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will raise it for you. Refunds
        return to the original payment method, typically within five to ten business days depending
        on your bank.
      </p>

      <h2>Renewals and cancellation</h2>
      <p>
        You can cancel an annual licence at any time to stop it renewing, and you keep the licence
        until the end of the period you have paid for. Renewal charges are refundable under the same
        30-day window as a first purchase. After a refund, your Pro licence and its key end, though the
        MIT core remains free to use.
      </p>

      <h2>When we may decline</h2>
      <p>
        We may decline a refund where the request falls outside the 30-day window, or where the
        licence has been resold or redistributed in breach of the{' '}
        <Link to="/terms">terms of service</Link>. Nothing in this policy affects statutory rights
        you have under consumer law in your country.
      </p>
    </LegalPage>
  )
}
