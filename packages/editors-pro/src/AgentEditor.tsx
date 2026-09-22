import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import type { Editor } from '@richkitjs/core'
import type { AIComplete } from '@richkitjs/extension-ai'
import { markdownToHtml } from '@richkitjs/markdown'
import {
  EditorContent,
  BubbleMenu,
  Toolbar,
  Icons,
  AlignMenu,
  BlockTypeMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import { StarterKit } from './kit'
import {
  cx,
  FieldValue,
  useEditorField,
  useTheme,
  withPlaceholder,
  type AnyProFieldProps,
  type AnyHandleRef,
  type ProFieldComponent,
} from './field'

const MOD_KEY =
  typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.platform) ? '⌘' : 'Ctrl'

export interface AgentEditorProps {
  /**
   * Drafts a section from the user's instruction and returns it as HTML, which
   * is appended to the document. Use it for full control over the model call.
   */
  onDraft?: (prompt: string, editor: Editor) => string | Promise<string>
  /**
   * A streaming AI transport — the same one `@richkitjs/extension-ai` takes,
   * e.g. `anthropicComplete({ endpoint: '/api/ai' })` from
   * `@richkitjs/ai-anthropic`. The model is asked for Markdown, and the section
   * renders into the document as it streams. Takes precedence over `onDraft`.
   *
   * Without `complete` or `onDraft` the agent dock is hidden.
   */
  complete?: AIComplete
}

/** What the model is asked for, around the user's instruction. */
export function agentDraftPrompt(instruction: string): string {
  return (
    'Write one new section to append to the end of the document. ' +
    'Format it as Markdown: start with a "## " heading, then paragraphs and ' +
    'lists as needed. Reply with the section only — no preamble, no code fences.\n\n' +
    `Section to write: ${instruction.trim()}`
  )
}

/** Drop a code fence a model wraps its whole reply in, even mid-stream. */
function stripFence(markdown: string): string {
  return markdown.replace(/^\s*```[a-z]*\n?/i, '').replace(/\n?```\s*$/, '')
}

/**
 * A document editor with an agent dock: the user describes a section, `onDraft`
 * writes it, and it lands in the document through the same API the toolbar uses.
 */
export const AgentEditor = forwardRef(function AgentEditor(
  props: AnyProFieldProps & AgentEditorProps,
  ref: AnyHandleRef,
) {
  const { onDraft, complete, placeholder, className, style, name, format } = props
  // A read-only or disabled document can't take a draft, so the agent is hidden.
  const editable = !props.readOnly && !props.disabled
  const canDraft = Boolean(complete || onDraft) && editable
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'light')
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)

  // A stream still running when the editor goes away has nowhere to write.
  useEffect(() => () => controller.current?.abort(), [])

  // Going read-only or disabled mid-draft stops the stream and closes the dock.
  useEffect(() => {
    if (editable) return
    controller.current?.abort()
    setOpen(false)
  }, [editable])

  const stream = async (editor: Editor, complete: AIComplete) => {
    const base = editor.getHTML()
    const abort = new AbortController()
    controller.current = abort
    let markdown = ''
    let frame = 0

    // While streaming, redraw the draft silently and outside undo history, at
    // most once a frame. The finished section is committed once below, so it
    // is a single onChange and a single undo step.
    const paint = () => {
      frame = 0
      editor.setContent(base + markdownToHtml(stripFence(markdown), { html: true }), {
        emitUpdate: false,
        addToHistory: false,
      })
    }

    try {
      for await (const chunk of complete(
        { prompt: agentDraftPrompt(prompt), selection: '', documentText: editor.getText() },
        { signal: abort.signal },
      )) {
        if (abort.signal.aborted) break
        markdown += chunk
        frame ||= requestAnimationFrame(paint)
      }
    } finally {
      cancelAnimationFrame(frame)
      if (controller.current === abort) controller.current = null
      // Drop the live draft whatever happened — a failed or stopped stream
      // must not leave half a section behind.
      editor.setContent(base, { emitUpdate: false, addToHistory: false })
    }

    const section = stripFence(markdown).trim()
    if (section && editor.isEditable) {
      editor.setContent(base + markdownToHtml(section, { html: true }))
    }
    return !abort.signal.aborted
  }

  const run = async () => {
    // A model needs an instruction; an `onDraft` callback may supply its own default.
    if (!editor || !canDraft || !editor.isEditable || (complete && !prompt.trim())) return
    setBusy(true)
    setError(null)
    try {
      const finished = complete
        ? await stream(editor, complete)
        : (editor.setContent(editor.getHTML() + (await onDraft!(prompt, editor))), true)
      if (finished) {
        setPrompt('')
        setOpen(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const stop = () => controller.current?.abort()

  return (
    <div className={cx('rk-frame rk-agent', className)} data-theme={theme} style={style}>
      {editor && (
        <Toolbar editor={editor} className="toolbar rk-toolbar rk-toolbar-light">
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
          {canDraft && (
            <ToolbarGroup>
              <button
                type="button"
                className={`tb-btn rk-ai-toggle${open ? ' is-active' : ''}`}
                title="Ask the agent"
                aria-label="Ask the agent"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setOpen((v) => !v)
                }}
              >
                <Icons.CommentIcon />
              </button>
            </ToolbarGroup>
          )}
        </Toolbar>
      )}
      <div className="rk-scroll">
        <div className="rk-page rk-page-agent">
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

      {canDraft && (
        <button
          type="button"
          className="agent-fab"
          title="Ask the agent"
          aria-label="Ask the agent"
          onClick={() => setOpen((v) => !v)}
        >
          ✦
        </button>
      )}

      {canDraft && open && (
        <div className="agent-dock">
          <div className="agent-dock-head">
            <span>✦ Agent</span>
            <button
              type="button"
              className="agent-dock-close"
              aria-label="Close agent"
              title="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <p className="agent-dock-hint">
            Describe a section. The agent drafts it and writes into the document.{' '}
            <kbd>{MOD_KEY}</kbd>+<kbd>Enter</kbd> drafts.
          </p>
          <textarea
            className="agent-dock-input"
            aria-label="Section to draft"
            aria-keyshortcuts="Control+Enter Meta+Enter"
            placeholder="e.g. Background & Significance"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void run()
            }}
          />
          {error && (
            <p className="agent-dock-error" role="alert">
              {error}
            </p>
          )}
          {busy && complete ? (
            <button type="button" className="agent-dock-run" onClick={stop}>
              Stop
            </button>
          ) : (
            <button
              type="button"
              className="agent-dock-run"
              disabled={busy || (Boolean(complete) && !prompt.trim())}
              onClick={() => void run()}
            >
              {busy ? 'Drafting…' : 'Draft section'}
            </button>
          )}
        </div>
      )}
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as ProFieldComponent<AgentEditorProps>
