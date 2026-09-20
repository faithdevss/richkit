import { Link } from 'react-router-dom'
import { ComparisonTable } from '../../components/ComparisonTable'
import { COMPARISON_CHECKED, COMPARISON_SOURCES } from '../../data/comparison'

const TIPTAP_POINTS: { title: string; body: string }[] = [
  {
    title: 'The editor is open source. The document features are the product.',
    body: 'Tiptap ships an MIT core and, since June 2025, eight more formerly-Pro extensions under MIT too — that part is genuinely open. What sits behind a plan is the layer most document apps actually need: DOCX conversion, comments, document history, AI, and managed collaboration.',
  },
  {
    title: 'RichKit charges once, for all of it.',
    body: 'Track changes, comments, AI and DOCX import/export are ordinary packages in this repo, and the commercial license covers every one of them for $99 a year. No per-seat maths, no add-on shopping, no bundle that only unlocks when your documents live in someone else’s cloud.',
  },
  {
    title: 'Nothing calls home.',
    body: 'DOCX conversion runs in the browser. There is no license key to provision, no activation check, and no document that has to leave your infrastructure for a feature to switch on. You can read and patch every line you ship.',
  },
  {
    title: 'Where Tiptap is still ahead — plainly.',
    body: 'It is years older, far more battle-tested, and has a real company behind support and SLAs. Managed collaboration is a solved problem there and unshipped here. Its core is MIT, which RichKit’s is not. If you want someone to page at 3am, pay them.',
  },
]

export function Comparison() {
  return (
    <div className="docs-prose cmp-page">
      <h1>How RichKit compares</h1>
      <p>
        Every rich text editor is cheap until you need the document features. Track changes,
        comments, DOCX round-tripping and AI are where the invoices start, and they are the reason
        most teams end up on a four-figure plan. This page shows what each editor charges for them,
        with the vendors’ own pricing pages as the source.
      </p>

      <div className="cmp-claim">
        <span className="cmp-claim-head">The short version</span>
        <p>
          RichKit&rsquo;s core is MIT. The premium layer — track changes, comments, DOCX, AI — is
          RichKit Pro, <strong>from $99 a year</strong>, self-hosted, with no per-document fees.
          The same feature set runs roughly $500–$1,200 a month elsewhere.
        </p>
      </div>

      <h2>Feature and licensing comparison</h2>
      <ComparisonTable />

      <p className="cmp-legend">
        <span className="cmp-mark is-open">✓</span> included in the base price ·{' '}
        <span className="cmp-mark is-paid">$</span> paid plan or add-on on top ·{' '}
        <span className="cmp-mark is-partial">~</span> partial, conditional or self-assembled ·{' '}
        <span className="cmp-mark is-none">–</span> not available
      </p>

      <h2>On Tiptap specifically</h2>
      <p>
        Tiptap is the closest comparison, and the fairest one — RichKit and Tiptap are both
        headless, extension-driven, ProseMirror-shaped toolkits. The difference is what the document
        layer costs once you need it.
      </p>

      {TIPTAP_POINTS.map((p) => (
        <div className="cmp-point" key={p.title}>
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </div>
      ))}

      <h2>Pick RichKit when</h2>
      <ul>
        <li>You need track changes, comments, DOCX or AI and a line item under $100 a year.</li>
        <li>You are shipping closed-source and do not want a GPL obligation.</li>
        <li>Your documents cannot leave your infrastructure.</li>
        <li>You would rather patch the editor yourself than file a ticket.</li>
        <li>You want one price that does not move when the team or the traffic grows.</li>
      </ul>

      <h2>Pick something else when</h2>
      <ul>
        <li>
          You need an OSI-approved license for the premium features too — the RichKit core is MIT,
          but the Pro packages are source-available under a commercial licence.
        </li>
        <li>You need managed real-time collaboration today — RichKit has not shipped it.</li>
        <li>You need a vendor SLA, certifications, or paid support.</li>
        <li>You want a decade of production hardening behind every edge case.</li>
      </ul>

      <p>
        If the first list is yours, start at <Link to="/docs/installation">Installation</Link>,
        browse the <Link to="/docs/extensions">extensions reference</Link>, or see{' '}
        <Link to="/pricing">what a license costs</Link>. Every company gets 90 days of free
        commercial use before it has to buy.
      </p>

      <h2>Sources</h2>
      <p className="cmp-sources-note">
        Competitor claims come from vendor documentation, last checked {COMPARISON_CHECKED}. Pricing
        and licensing change — if something here is out of date, please open an issue.
      </p>
      <ul>
        {COMPARISON_SOURCES.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
