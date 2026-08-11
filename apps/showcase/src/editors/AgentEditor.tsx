import { useState } from 'react'
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  Toolbar,
  Icons,
  AlignMenu,
  BlockTypeMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import { AGENT_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

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
  const editor = useEditor({ extensions: StarterKit, content: AGENT_CONTENT })
  useDevEditor(editor)
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)

  const run = () => {
    if (!editor) return
    setBusy(true)
    const section = draftSection(prompt)
    // Simulate the agent "thinking" before it writes to the document.
    window.setTimeout(() => {
      editor.setContent(editor.getHTML() + section)
      setBusy(false)
      setPrompt('')
      setOpen(false)
    }, 550)
  }

  return (
    <div className="demo-frame demo-agent" data-theme="light">
      {editor && (
        <Toolbar editor={editor} className="toolbar demo-toolbar demo-toolbar-light">
          <ToolbarGroup>
            <ToolbarButton editor={editor} command="undo" label={<Icons.UndoIcon />} title="Undo" />
            <ToolbarButton editor={editor} command="redo" label={<Icons.RedoIcon />} title="Redo" />
          </ToolbarGroup>
          <ToolbarGroup>
            <BlockTypeMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton
              editor={editor}
              command="toggleBulletList"
              isActiveName="bulletList"
              label={<Icons.BulletListIcon />}
              title="Bullet list"
            />
            <ToolbarButton
              editor={editor}
              command="toggleOrderedList"
              isActiveName="orderedList"
              label={<Icons.OrderedListIcon />}
              title="Numbered list"
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton
              editor={editor}
              command="toggleBold"
              isActiveName="bold"
              label={<Icons.BoldIcon />}
              title="Bold"
            />
            <ToolbarButton
              editor={editor}
              command="toggleItalic"
              isActiveName="italic"
              label={<Icons.ItalicIcon />}
              title="Italic"
            />
            <ToolbarButton
              editor={editor}
              command="toggleStrike"
              isActiveName="strike"
              label={<Icons.StrikeIcon />}
              title="Strikethrough"
            />
            <ToolbarButton
              editor={editor}
              command="toggleUnderline"
              isActiveName="underline"
              label={<Icons.UnderlineIcon />}
              title="Underline"
            />
            <ToolbarButton
              editor={editor}
              command="clearFormatting"
              label={<Icons.ClearFormatIcon />}
              title="Clear formatting"
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <AlignMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <button
              type="button"
              className={`tb-btn demo-ai-toggle${open ? ' is-active' : ''}`}
              title="Ask the agent"
              onMouseDown={(e) => {
                e.preventDefault()
                setOpen((v) => !v)
              }}
            >
              <Icons.CommentIcon />
            </button>
          </ToolbarGroup>
        </Toolbar>
      )}
      <div className="demo-scroll">
        <div className="demo-page demo-page-agent">
          <EditorContent editor={editor} className="editor" />
          <BubbleMenu editor={editor} className="bubble-menu">
            {editor && (
              <>
                <ToolbarButton
                  editor={editor}
                  command="toggleBold"
                  isActiveName="bold"
                  label={<Icons.BoldIcon />}
                  title="Bold"
                />
                <ToolbarButton
                  editor={editor}
                  command="toggleItalic"
                  isActiveName="italic"
                  label={<Icons.ItalicIcon />}
                  title="Italic"
                />
                <ToolbarButton
                  editor={editor}
                  command="toggleStrike"
                  isActiveName="strike"
                  label={<Icons.StrikeIcon />}
                  title="Strikethrough"
                />
              </>
            )}
          </BubbleMenu>
        </div>
      </div>

      <button
        type="button"
        className="agent-fab"
        title="Ask the agent"
        onClick={() => setOpen((v) => !v)}
      >
        ✦
      </button>

      {open && (
        <div className="agent-dock">
          <div className="agent-dock-head">
            <span>✦ Agent</span>
            <button type="button" className="agent-dock-close" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <p className="agent-dock-hint">
            Describe a section. The agent drafts it and writes into the document.
          </p>
          <textarea
            className="agent-dock-input"
            placeholder="e.g. Background & Significance"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run()
            }}
          />
          <button type="button" className="agent-dock-run" disabled={busy} onClick={run}>
            {busy ? 'Drafting…' : 'Draft section'}
          </button>
        </div>
      )}
    </div>
  )
}
