import { Link, Navigate, useParams } from 'react-router-dom'
import { EXAMPLES } from '../../data/examples'
import { Demo, Install } from '../../mdx-components'

// `code` spans in the notes are written with backticks, as in the MDX pages.
function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`)/)
        .map((part, i) => (part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part))}
    </>
  )
}

export function ExampleDoc() {
  const { id } = useParams()
  const example = EXAMPLES.find((e) => e.id === id)
  if (!example) return <Navigate to={`/docs/examples/${EXAMPLES[0]!.id}`} replace />

  return (
    <>
      <div className="docs-prose">
        <h1>{example.title}</h1>
        <p>{example.blurb}</p>
        <p>
          Built on <code>{example.pkg}</code>.{' '}
          <Link to={`/examples#${example.id}`}>Open it on the examples page →</Link>
        </p>

        <h2 id="install">Install</h2>
        <Install packages={example.install} />

        <h2 id="how-it-works">How it works</h2>
        <ul>
          {example.points.map((point) => (
            <li key={point}>
              <Inline text={point} />
            </li>
          ))}
        </ul>

        <h2 id="key-code">Key code</h2>
        <pre className="docs-pre">
          <code>{example.snippet}</code>
        </pre>

        <h2 id="live-demo">Live demo</h2>
      </div>

      <Demo title={example.title}>{example.demo()}</Demo>

      <div className="docs-prose">
        <h2 id="full-source">Full source</h2>
        <details className="example-source">
          <summary>
            Show <code>apps/showcase/src/editors/…</code> — {example.source.split('\n').length}{' '}
            lines
          </summary>
          <pre className="docs-pre">
            <code>{example.source}</code>
          </pre>
        </details>
      </div>
    </>
  )
}
