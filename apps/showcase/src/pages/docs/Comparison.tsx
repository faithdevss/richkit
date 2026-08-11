import { Link } from 'react-router-dom'
import { ComparisonTable } from '../../components/ComparisonTable'
import { COMPARISON_CHECKED, COMPARISON_SOURCES } from '../../data/comparison'

const TIPTAP_POINTS: { title: string; body: string }[] = [
  {
    title: 'The editor is open source. The document features are the product.',
    body: 'Tiptap ships an MIT core and, since June 2025, eight more formerly-Pro extensions under MIT too — that part is genuinely open. What sits behind a plan is the layer most document apps actually need: DOCX conversion, comments, document history, AI, and managed collaboration.',
  },
  {
    title: 'RichKit puts those same features in npm, under MIT.',
    body: 'Track changes, comments, and DOCX import/export are ordinary packages in this repo. Read the source, fork them, ship them in a closed-source product. No plan, no seat count, no conversion endpoint.',
  },
  {
    title: 'Nothing calls home.',
    body: 'DOCX conversion runs in the browser. There is no API key to provision and no document that has to live in someone else’s cloud for a feature to switch on.',
  },
  {
    title: 'Where Tiptap is still ahead — plainly.',
    body: 'It is years older, far more battle-tested, and has a real company behind support and SLAs. Managed collaboration is a solved problem there and unshipped here. If you want someone to page at 3am, pay them.',
  },
]

export function Comparison() {
  return (
    <div className="docs-prose cmp-page">
      <h1>How RichKit compares</h1>
      <p>
        Every rich text editor calls itself open source. The question worth asking is narrower:{' '}
        <em>which parts</em> are open, and what does the rest cost once you need it? This page
        answers that for RichKit and the editors teams usually weigh it against.
      </p>

      <div className="cmp-claim">
        <span className="cmp-claim-head">The short version</span>
        <p>
          RichKit is MIT end to end. Track changes, comments, and DOCX round-tripping are the
          features other editors put on a paid plan — here they are packages you install, read, and
          fork.
        </p>
      </div>

      <h2>Feature and licensing comparison</h2>
      <ComparisonTable />

      <p className="cmp-legend">
        <span className="cmp-mark is-open">✓</span> open source ·{' '}
        <span className="cmp-mark is-paid">$</span> paid plan or add-on ·{' '}
        <span className="cmp-mark is-partial">~</span> partial or self-assembled ·{' '}
        <span className="cmp-mark is-none">–</span> not available
      </p>

      <h2>On Tiptap specifically</h2>
      <p>
        Tiptap is the closest comparison, and the fairest one — RichKit and Tiptap are both
        headless, extension-driven, ProseMirror-shaped toolkits. The difference is where the line
        between free and paid falls.
      </p>

      {TIPTAP_POINTS.map((p) => (
        <div className="cmp-point" key={p.title}>
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </div>
      ))}

      <h2>Pick RichKit when</h2>
      <ul>
        <li>You need track changes, comments, or DOCX and a $0 line item.</li>
        <li>You are shipping closed-source and do not want a GPL obligation.</li>
        <li>Your documents cannot leave your infrastructure.</li>
        <li>You want to patch the editor yourself instead of filing a ticket.</li>
      </ul>

      <h2>Pick something else when</h2>
      <ul>
        <li>You need managed real-time collaboration today — RichKit has not shipped it.</li>
        <li>You need a vendor SLA, certifications, or paid support.</li>
        <li>You want a decade of production hardening behind every edge case.</li>
      </ul>

      <p>
        If the first list is yours, start at <Link to="/docs/installation">Installation</Link> or
        browse the <Link to="/docs/extensions">extensions reference</Link>.
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
