import { RichViewer, sanitizeHtml } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import { useMemo, useState } from 'react'

const UNTRUSTED = `<h2 onmouseover="alert('xss')">Release notes</h2>
<p>Read the <a href="javascript:alert('xss')">changelog</a> or the
<a href="https://github.com/faithdevss/richkit">source</a>.</p>
<img src="x" onerror="alert('xss')">
<script>alert('xss')</script>
<p style="position:fixed;inset:0">Only <strong>schema-shaped</strong> markup survives.</p>
<iframe src="javascript:alert('xss')"></iframe>
<ul><li>Lists stay</li><li>Handlers go</li></ul>`

/** Untrusted HTML in, sanitized HTML and a RichViewer out, updated as you type. */
export function SanitizeDemo() {
  const [input, setInput] = useState(UNTRUSTED)
  const clean = useMemo(() => sanitizeHtml(input, { extensions: StarterKit }), [input])

  return (
    <div className="sanitize-demo">
      <label className="sanitize-demo-pane">
        <span className="sanitize-demo-label">Untrusted HTML — edit me</span>
        <textarea
          className="sanitize-demo-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
      </label>
      <div className="sanitize-demo-pane">
        <span className="sanitize-demo-label">sanitizeHtml() output</span>
        <pre className="docs-pre sanitize-demo-output">
          <code>{clean}</code>
        </pre>
      </div>
      <div className="sanitize-demo-pane sanitize-demo-wide">
        <span className="sanitize-demo-label">&lt;RichViewer /&gt;</span>
        <div className="editor-shell">
          <RichViewer className="editor" extensions={StarterKit} content={input} />
        </div>
      </div>
    </div>
  )
}
