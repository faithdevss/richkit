import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// Fill these in before submitting the site for Paddle's domain review. Paddle
// checks that the trading entity and contact route are real and reachable, and
// a placeholder here is the most common reason a domain gets rejected.
const ENTITY = 'FaithDevs'
const CONTACT_EMAIL = 'support@richkit.dev'
const JURISDICTION = 'Bangladesh'
const UPDATED = '18 September 2026'

// Paddle requires the merchant of record to be named in the terms. It is not a
// formality: buyers contract with Paddle for the payment, and with us for the
// licence, and the two have to be told apart.
const MOR = (
  <>
    Our order process is conducted by our online reseller{' '}
    <a href="https://www.paddle.com" target="_blank" rel="noreferrer">
      Paddle.com
    </a>
    . Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service
    inquiries and handles returns.
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
      lede={`The agreement between you and ${ENTITY} covering the RichKit packages, this website, and the commercial licence.`}
    >
      <h2>Who we are</h2>
      <p>
        RichKit is published by {ENTITY}. These terms cover the RichKit software packages, this
        website, and any commercial licence you buy from us. Contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Payments and the merchant of record</h2>
      <p>{MOR}</p>
      <p>
        This means Paddle, not {ENTITY}, is the seller for your purchase. Paddle collects payment,
        charges any applicable VAT or sales tax, issues your invoice, and handles billing support and
        refunds. We remain responsible for the software itself and for the licence you are granted.
      </p>

      <h2>What you are buying</h2>
      <p>
        A licence to use the RichKit packages commercially. There is no licence key, no activation
        call, and no telemetry — the editor never contacts us. The licence is a contract, not a
        technical lock, which also means nothing stops working if your users are offline or your
        build is air-gapped.
      </p>
      <ul>
        <li>
          <b>Noncommercial use is free</b>, under{' '}
          <a
            href="https://github.com/faithdevss/richkit/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            PolyForm Noncommercial 1.0.0
          </a>
          . Hobby projects, study, research, schools, charities and government bodies get the same
          packages, with nothing held back.
        </li>
        <li>
          <b>Commercial use requires a paid licence</b>, under{' '}
          <a
            href="https://github.com/faithdevss/richkit/blob/main/LICENSE-COMMERCIAL"
            target="_blank"
            rel="noreferrer"
          >
            LICENSE-COMMERCIAL
          </a>
          . One licence covers your whole company: every developer, every product, every client
          project.
        </li>
      </ul>
      <p>
        Commercial use means any use by or on behalf of a business, or in a product, service or
        internal tool operated for commercial advantage. If those licence files and these terms ever
        disagree, the licence files govern the software and these terms govern the purchase.
      </p>

      <h2>Evaluation</h2>
      <p>
        You may use RichKit commercially for 90 days from your first commercial use without paying,
        so you can build the real integration before deciding. No signup, no key, and no notice to us
        is required.
      </p>

      <h2>Renewal and expiry</h2>
      <p>
        The annual licence renews yearly until cancelled. If you stop paying, you keep a perpetual
        licence to the last version released while your licence was active, including in products you
        have already shipped and in new ones — you simply do not receive versions released after
        that. The lifetime licence is a single payment and does not expire.
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
        directly to Paddle. See also our <Link to="/privacy">privacy policy</Link> and{' '}
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
        The RichKit packages collect nothing. The editor makes no network calls to us, has no
        telemetry, and has no licence check to phone home with. Anything you type stays in your
        application.
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
        Checkout is handled by Paddle, our merchant of record. When you open a checkout, Paddle
        receives the information you enter — name, email address, billing address and payment details
        — and processes it as an independent controller under{' '}
        <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer">
          Paddle&rsquo;s privacy policy
        </a>
        . We never see or store your card details.
      </p>
      <p>
        From Paddle we receive the record of your purchase: your name, email address, country, and
        what you bought. We use it to know who holds a licence, to send licence and release
        information, and to answer support requests. We do not sell it or use it for advertising.
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
        sent to Paddle, who hold it.
      </p>
    </LegalPage>
  )
}

export function Refunds() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund policy"
      lede="A 30-day refund on any licence, handled by Paddle, our merchant of record."
    >
      <h2>30 days, no argument</h2>
      <p>
        If a RichKit licence is not right for you, ask for a refund within 30 days of purchase and
        you will get your money back in full. That applies to both the annual and the lifetime
        licence. You do not need to justify the request.
      </p>
      <p>
        RichKit is free to evaluate commercially for 90 days before you pay anything, so we would
        rather you tried it properly first than bought and returned it.
      </p>

      <h2>How to request one</h2>
      <p>{MOR}</p>
      <p>
        Because Paddle is the merchant of record, refunds are issued by Paddle. Request one from the
        receipt email Paddle sent you, or email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will raise it for you. Refunds
        return to the original payment method, typically within five to ten business days depending
        on your bank.
      </p>

      <h2>Renewals and cancellation</h2>
      <p>
        You can cancel an annual licence at any time to stop it renewing, and you keep the licence
        until the end of the period you have paid for. Renewal charges are refundable under the same
        30-day window as a first purchase. After a refund, your commercial licence ends, though the
        packages remain free to use noncommercially.
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
