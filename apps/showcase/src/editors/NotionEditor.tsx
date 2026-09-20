import { useEffect, useRef, useState } from 'react'
import type { MentionCandidate } from '@richkitjs/react'
import type { AICompleteOptions, AICompletionRequest } from '@richkitjs/extension-ai'
import { NotionEditor as Notion } from '@richkitjs/editors-pro'
import { NOTION_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

const DRAFT_KEY = 'richkit:notion-draft'

/** Stand-in directory for the demo — a real app passes its own people here. */
const MENTIONS: MentionCandidate[] = [
  { id: 'ada', label: 'Ada Lovelace', kind: 'user', detail: 'Engineering' },
  { id: 'grace', label: 'Grace Hopper', kind: 'user', detail: 'Engineering' },
  { id: 'alan', label: 'Alan Turing', kind: 'user', detail: 'Research' },
  { id: 'radia', label: 'Radia Perlman', kind: 'user', detail: 'Networking' },
  { id: 'roadmap', label: 'Product roadmap', kind: 'page', detail: 'Docs' },
  { id: 'changelog', label: 'Changelog', kind: 'page', detail: 'Docs' },
]

// Demo transport — no network. Streams a canned continuation back word by
// word so the AI extension's real streaming path drives the document.
const CANNED: { match: RegExp; text: string }[] = [
  {
    match: /improve|rewrite|polish|professional/i,
    text: 'Every block in this document is a node in a ProseMirror schema, so the same commands your toolbar calls are the ones an integration, a macro, or an agent can call. Nothing is hidden behind the UI.',
  },
  {
    match: /shorter|concise/i,
    text: 'Blocks are schema nodes; the toolbar, macros, and agents all drive them through one command API.',
  },
  {
    match: /continue|write|draft/i,
    text: 'Pick a block, press the handle in the gutter, and drag it anywhere in the page. Type "/" for the command menu, or select text to bring up formatting. Everything you reach for while writing docs is one keystroke away, and none of it is locked to this template.',
  },
]

async function* demoComplete(
  req: AICompletionRequest,
  opts: AICompleteOptions,
): AsyncIterable<string> {
  const canned =
    CANNED.find((c) => c.match.test(req.prompt))?.text ??
    `Here is a draft on “${req.prompt.slice(0, 60)}”. RichKit streams it in as it arrives, and every word lands in the document as an ordinary transaction you can undo.`
  for (const word of canned.split(' ')) {
    if (opts.signal.aborted) return
    await new Promise((resolve) => setTimeout(resolve, 26))
    yield `${word} `
  }
}

function readDraft(): string | null {
  try {
    return window.localStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

/** Keeps the demo's content across a reload, the way a real app would. */
function useAutosave(html: string): void {
  const first = useRef(true)
  useEffect(() => {
    // The value it loaded with is already saved.
    if (first.current) {
      first.current = false
      return
    }
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, html)
      } catch {
        // storage can be off; the editor keeps working without a draft
      }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [html])
}

export function NotionEditor() {
  const [html, setHtml] = useState(() => readDraft() ?? NOTION_CONTENT)
  useAutosave(html)

  return (
    <Notion
      value={html}
      onChange={setHtml}
      mentions={MENTIONS}
      ai={demoComplete}
      aiAuthor="RichKit AI"
      onEditorReady={exposeEditor}
      header={
        <>
          <span className="notion-crumb">Docs</span>
          <span className="notion-crumb-sep">/</span>
          <span className="notion-crumb is-current">Writing with blocks</span>
        </>
      }
      headerActions={
        <span className="notion-avatar" aria-hidden>
          🧑🏽‍🦰
        </span>
      }
      footer={
        <p className="notion-hint">
          Hover a block for the <kbd>⠿</kbd> handle, drag to reorder, or type <kbd>/</kbd> for the
          command menu. <kbd>@</kbd> mentions a person or page, and <kbd>⌘F</kbd> opens find and
          replace.
        </p>
      }
    />
  )
}
