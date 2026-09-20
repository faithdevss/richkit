import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '@richkitjs/react'
import { EXAMPLES, type Example } from '../data/examples'

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ExampleStage({ example }: { example: Example }) {
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(example.source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <section id={example.id} className="section example-block">
      <h2 className="section-title">{example.title}</h2>
      <p className="section-sub">
        {example.blurb} <Link to={`/docs/examples/${example.id}`}>How it works →</Link>
      </p>
      <div className="stage-wrap">
        <div className="frame-bar">
          <div className="frame-dots">
            <span />
            <span />
            <span />
          </div>
          <span className="frame-title">{example.title}</span>
          {example.pro && <span className="tag is-included">Pro</span>}
          <code className="frame-pkg">{example.pkg}</code>
        </div>
        <div className="stage-actions">
          <button
            type="button"
            className={`code-icon-btn${showCode ? ' is-active' : ''}`}
            aria-pressed={showCode}
            title={showCode ? 'View demo' : 'View code'}
            onClick={() => setShowCode((v) => !v)}
          >
            <Icons.CodeIcon />
          </button>
          {showCode && (
            <button
              type="button"
              className={`code-icon-btn${copied ? ' is-active' : ''}`}
              title={copied ? 'Copied' : 'Copy code'}
              onClick={() => void copy()}
            >
              {copied ? <CheckIcon /> : <Icons.CopyIcon />}
            </button>
          )}
        </div>
        {showCode ? (
          <pre className="docs-pre code-panel">
            <code>{example.source}</code>
          </pre>
        ) : (
          <div className="stage">{example.demo()}</div>
        )}
      </div>
    </section>
  )
}

export function Examples() {
  return (
    <div className="shell page-head">
      <div className="page-eyebrow">Examples</div>
      <h1 className="page-title">Small editors, one feature each</h1>
      <p className="page-lede">
        Focused examples you can copy straight into an app. Each one is a single file under{' '}
        <code>apps/showcase/src/editors</code>. For the full editors, see the{' '}
        <Link to="/#examples">landing page demo</Link>.
      </p>
      {EXAMPLES.map((e) => (
        <ExampleStage key={e.id} example={e} />
      ))}
    </div>
  )
}
