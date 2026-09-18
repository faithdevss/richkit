import { forwardRef, useMemo, useState } from 'react'
import type { Editor } from '@richkitjs/core'
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
import { StarterKit } from '@richkitjs/starter-kit'
import {
  cx,
  FieldValue,
  useEditorField,
  useTheme,
  withPlaceholder,
  type AnyFieldProps,
  type AnyHandleRef,
  type FieldComponent,
} from './field'

export interface AgentEditorProps {
  /**
   * Drafts a section from the user's instruction and returns it as HTML, which
   * is appended to the document. Without it the agent dock is hidden.
   */
  onDraft?: (prompt: string, editor: Editor) => string | Promise<string>
}

/**
 * A document editor with an agent dock: the user describes a section, `onDraft`
 * writes it, and it lands in the document through the same API the toolbar uses.
 */
export const AgentEditor = forwardRef(function AgentEditor(
  props: AnyFieldProps & AgentEditorProps,
  ref: AnyHandleRef,
) {
  const { onDraft, placeholder, className, style, name, format } = props
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'light')
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!editor || !onDraft) return
    setBusy(true)
    try {
      const section = await onDraft(prompt, editor)
      editor.setContent(editor.getHTML() + section)
      setPrompt('')
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cx('demo-frame demo-agent', className)} data-theme={theme} style={style}>
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
          {onDraft && (
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
          )}
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

      {onDraft && (
        <button
          type="button"
          className="agent-fab"
          title="Ask the agent"
          onClick={() => setOpen((v) => !v)}
        >
          ✦
        </button>
      )}

      {onDraft && open && (
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
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void run()
            }}
          />
          <button
            type="button"
            className="agent-dock-run"
            disabled={busy}
            onClick={() => void run()}
          >
            {busy ? 'Drafting…' : 'Draft section'}
          </button>
        </div>
      )}
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<AgentEditorProps>
