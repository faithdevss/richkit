import { useState } from 'react'
import { AgentEditor as Agent } from '@richkitjs/editors-pro'
import { LICENSE_KEY } from '../license'
import { AGENT_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

// Demo assistant — no network. Expands a short instruction into a drafted
// section and appends it to the document, showing how an agent can drive the
// editor through the same public API a user's toolbar uses.
function draftSection(prompt: string): string {
  const topic = prompt.trim() || 'Background & Significance'
  return `
<h2>${escapeHtml(topic)}</h2>
<p>Cognitive aging is driven by the interaction of vascular, metabolic, and
inflammatory processes. Prior work demonstrates that single-domain interventions
yield modest, often transient effects. This section motivates a multi-modal design.</p>
<ul>
  <li>Aerobic exercise increases BDNF expression and cerebral blood flow.</li>
  <li>Structured cognitive training strengthens executive-control networks.</li>
  <li>Dietary modulation reduces systemic inflammatory markers.</li>
</ul>
<p><em>Drafted by the demo assistant — edit inline or ask for a revision.</em></p>
`
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  )
}

export function AgentEditor() {
  const [html, setHtml] = useState(AGENT_CONTENT)
  return (
    <Agent
      value={html}
      onChange={setHtml}
      // A real app calls its model here and returns the section as HTML.
      onDraft={(prompt) =>
        new Promise<string>((resolve) =>
          window.setTimeout(() => resolve(draftSection(prompt)), 550),
        )
      }
      licenseKey={LICENSE_KEY}
      onEditorReady={exposeEditor}
    />
  )
}
