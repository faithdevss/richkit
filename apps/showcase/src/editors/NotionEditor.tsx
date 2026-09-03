import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useEditor,
  EditorContent,
  SlashMenu,
  MentionMenu,
  BubbleMenu,
  BlockHandle,
  BlockTypeMenu,
  TextColorMenu,
  HighlightMenu,
  FindReplace,
  Icons,
  notify,
  getOutline,
  defaultSlashItems,
  ToolbarButton,
  type MentionCandidate,
  type SlashItem,
  type OutlineEntry,
} from '@richkitjs/react'
import { StarterKit, Image, Link } from '@richkitjs/starter-kit'
import { getWordCount } from '@richkitjs/extension-word-count'
import { AI, type AICompleteOptions, type AICompletionRequest } from '@richkitjs/extension-ai'
import { NOTION_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

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

/** The href already on the selection, so editing a link starts from it. */
function currentLinkHref(editor: NonNullable<ReturnType<typeof useEditor>>): string {
  const mark = editor.state.schema.marks['link']
  if (!mark) return ''
  const { from, to } = editor.state.selection
  let href = ''
  editor.state.doc.nodesBetween(from, to, (node) => {
    const found = node.marks.find((m) => m.type === mark)
    if (found && typeof found.attrs['href'] === 'string') href = found.attrs['href']
  })
  return href
}

async function promptForLink(current: string): Promise<string | null> {
  return notify.prompt({
    title: 'Link',
    message: 'Paste a URL.',
    placeholder: 'https://example.com',
    okLabel: 'Apply',
    defaultValue: current,
  })
}

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

/** The AI section the reference Notion editors put at the top of "/". */
function aiSlashItems(onAsk: () => void): SlashItem[] {
  return [
    {
      id: 'ai-continue',
      label: 'Continue Writing',
      keywords: 'ai continue writing draft generate',
      group: 'AI',
      icon: <Icons.SparkleIcon className="slash-menu-ai-icon" />,
      run: (editor, range) => {
        editor.view.dispatch(editor.view.state.tr.delete(range.from, range.to))
        editor.chain().call('aiPrompt', { prompt: 'Continue writing from here.' }).focus().run()
      },
    },
    {
      id: 'ai-ask',
      label: 'Ask AI',
      keywords: 'ai ask prompt assistant',
      group: 'AI',
      icon: <Icons.SparkleIcon className="slash-menu-ai-icon" />,
      run: (editor, range) => {
        editor.view.dispatch(editor.view.state.tr.delete(range.from, range.to))
        onAsk()
      },
    },
  ]
}

function readDraft(): string | null {
  try {
    return window.localStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

/** Keeps the demo's content across a reload, the way a real app would. */
function useAutosave(editor: ReturnType<typeof useEditor>): void {
  useEffect(() => {
    if (!editor) return
    let timer: number | undefined
    const off = editor.on('update', () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        try {
          window.localStorage.setItem(DRAFT_KEY, editor.getHTML())
        } catch {
          // storage can be off; the editor keeps working without a draft
        }
      }, 300)
    })
    return () => {
      window.clearTimeout(timer)
      off()
    }
  }, [editor])
}

function useWordCount(editor: ReturnType<typeof useEditor>) {
  const [stats, setStats] = useState(() => ({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    readingTimeMinutes: 0,
  }))
  useEffect(() => {
    if (!editor) return
    const sync = () => setStats(getWordCount(editor.state.doc))
    sync()
    return editor.on('update', sync)
  }, [editor])
  return stats
}

function useOutline(editor: ReturnType<typeof useEditor>): OutlineEntry[] {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!editor) return
    return editor.on('update', () => setTick((t) => t + 1))
  }, [editor])
  return useMemo(() => (editor ? getOutline(editor) : []), [editor, tick])
}

export function NotionEditor() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [moreRow, setMoreRow] = useState(false)
  const [ask, setAsk] = useState('')
  const [askOpen, setAskOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)

  const editor = useEditor({
    extensions: [
      ...StarterKit,
      // Mod+K and the image controls need a dialog; the extensions stay
      // headless and take one from the app.
      Link.configure({
        onEditLink: (instance) => {
          void promptForLink(currentLinkHref(instance)).then((url) => {
            if (url === null) return
            if (url === '') instance.chain().call('unsetLink').focus().run()
            else instance.chain().call('setLink', { href: url }).focus().run()
          })
        },
      }),
      Image.configure({
        editText: ({ title, value }) =>
          notify.prompt({ title, defaultValue: value, okLabel: 'Apply' }),
      }),
      AI.configure({ complete: demoComplete, attributeAs: 'RichKit AI', track: false }),
    ],
    content: readDraft() ?? NOTION_CONTENT,
  })
  useDevEditor(editor)
  useAutosave(editor)
  const stats = useWordCount(editor)

  const outline = useOutline(editor)
  const slashItems = useMemo(
    () => [...aiSlashItems(() => setAskOpen(true)), ...defaultSlashItems],
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'f') return
      e.preventDefault()
      setFindOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const editLink = useCallback(() => {
    if (!editor) return
    void promptForLink(currentLinkHref(editor)).then((url) => {
      if (url === null) return
      if (url === '') editor.chain().call('unsetLink').focus().run()
      else editor.chain().call('setLink', { href: url }).focus().run()
    })
  }, [editor])

  const addComment = useCallback(() => {
    if (!editor) return
    void notify
      .prompt({ title: 'Comment', message: 'Leave a note on this text.', okLabel: 'Comment' })
      .then((body) => {
        if (body) editor.chain().call('addComment', { body }).focus().run()
      })
  }, [editor])

  const runAI = (prompt: string) => {
    editor?.chain().call('aiPrompt', { prompt }).focus().run()
  }

  const goToHeading = (entry: OutlineEntry) => {
    if (!editor) return
    const dom = editor.view.domAtPos(entry.pos + 1).node
    const el = dom.nodeType === 1 ? (dom as HTMLElement) : dom.parentElement
    el?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  return (
    <div className="demo-frame demo-notion" data-theme={theme}>
      <div className="notion-bar">
        <div className="notion-bar-left">
          <span className="notion-crumb">Docs</span>
          <span className="notion-crumb-sep">/</span>
          <span className="notion-crumb is-current">Writing with blocks</span>
        </div>
        <div className="notion-bar-right">
          <button
            type="button"
            className="tb-btn"
            title="Undo"
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().call('undo').focus().run()
            }}
          >
            <Icons.UndoIcon />
          </button>
          <button
            type="button"
            className="tb-btn"
            title="Redo"
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().call('redo').focus().run()
            }}
          >
            <Icons.RedoIcon />
          </button>
          <span className="notion-bar-divider" />
          <button
            type="button"
            className="tb-btn"
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            onMouseDown={(e) => {
              e.preventDefault()
              setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
            }}
          >
            {theme === 'dark' ? <Icons.SunIcon /> : <Icons.MoonIcon />}
          </button>
          <span className="notion-avatar" aria-hidden>
            🧑🏽‍🦰
          </span>
        </div>
      </div>

      <div className="notion-body">
        <div className="demo-scroll" ref={setScrollEl}>
          <div className="demo-page demo-page-notion">
            <EditorContent editor={editor} className="editor" />
            <BlockHandle editor={editor} container={scrollEl} />
            <SlashMenu editor={editor} items={slashItems} />
            <MentionMenu editor={editor} items={MENTIONS} />
            <BubbleMenu editor={editor} className="notion-bubble">
              {editor && (
                <>
                  {moreRow && (
                    <div className="bubble-row bubble-row-secondary">
                      <ToolbarButton
                        editor={editor}
                        command="toggleSuperscript"
                        isActiveName="superscript"
                        label={<Icons.SuperscriptIcon />}
                        title="Superscript"
                      />
                      <ToolbarButton
                        editor={editor}
                        command="toggleSubscript"
                        isActiveName="subscript"
                        label={<Icons.SubscriptIcon />}
                        title="Subscript"
                      />
                      <span className="bubble-sep" />
                      <ToolbarButton
                        editor={editor}
                        command="setTextAlign"
                        args={[null]}
                        label={<Icons.AlignLeftIcon />}
                        title="Align left"
                      />
                      <ToolbarButton
                        editor={editor}
                        command="setTextAlign"
                        args={['center']}
                        label={<Icons.AlignCenterIcon />}
                        title="Align centre"
                      />
                      <ToolbarButton
                        editor={editor}
                        command="setTextAlign"
                        args={['right']}
                        label={<Icons.AlignRightIcon />}
                        title="Align right"
                      />
                      <ToolbarButton
                        editor={editor}
                        command="setTextAlign"
                        args={['justify']}
                        label={<Icons.AlignJustifyIcon />}
                        title="Justify"
                      />
                      <span className="bubble-sep" />
                      <ToolbarButton
                        editor={editor}
                        command="liftListItem"
                        label={<Icons.IndentOutIcon />}
                        title="Decrease indent"
                      />
                      <ToolbarButton
                        editor={editor}
                        command="sinkListItem"
                        label={<Icons.IndentInIcon />}
                        title="Increase indent"
                      />
                      <span className="bubble-sep" />
                      <ToolbarButton
                        editor={editor}
                        command="clearFormatting"
                        label={<Icons.ClearFormatIcon />}
                        title="Clear formatting"
                      />
                    </div>
                  )}
                  <div className="bubble-row">
                    <button
                      type="button"
                      className="notion-improve"
                      title="Improve this text with AI"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        runAI('Improve the writing. Keep the meaning.')
                      }}
                    >
                      <Icons.SparkleIcon />
                      <span>Improve</span>
                    </button>
                    <span className="bubble-sep" />
                    <BlockTypeMenu editor={editor} />
                    <span className="bubble-sep" />
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
                      command="toggleUnderline"
                      isActiveName="underline"
                      label={<Icons.UnderlineIcon />}
                      title="Underline"
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
                      command="toggleCode"
                      isActiveName="code"
                      label={<Icons.CodeIcon />}
                      title="Inline code"
                    />
                    <button
                      type="button"
                      className={`tb-btn${editor.isActive('link') ? ' is-active' : ''}`}
                      title="Link"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        editLink()
                      }}
                    >
                      <Icons.LinkIcon />
                    </button>
                    <button
                      type="button"
                      className="tb-btn"
                      title="Comment"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        addComment()
                      }}
                    >
                      <Icons.CommentIcon />
                    </button>
                    <TextColorMenu editor={editor} />
                    <HighlightMenu editor={editor} />
                    <span className="bubble-sep" />
                    <button
                      type="button"
                      className={`tb-btn${moreRow ? ' is-active' : ''}`}
                      title="More formatting"
                      aria-expanded={moreRow}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setMoreRow((v) => !v)
                      }}
                    >
                      <Icons.MoreIcon />
                    </button>
                  </div>
                </>
              )}
            </BubbleMenu>
          </div>
        </div>

        {outline.length > 0 && (
          <nav className="notion-rail" aria-label="Document outline">
            {outline.map((entry) => (
              <button
                key={`${String(entry.pos)}-${entry.text}`}
                type="button"
                className={`notion-rail-tick lvl-${String(Math.min(entry.level, 3))}`}
                title={entry.text}
                onClick={() => goToHeading(entry)}
              >
                <span className="notion-rail-label">{entry.text}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      {askOpen && (
        <div className="notion-ask" role="dialog" aria-label="Ask AI">
          <Icons.SparkleIcon className="notion-ask-icon" />
          <input
            autoFocus
            className="notion-ask-input"
            value={ask}
            placeholder="Ask AI to write, edit, or explain…"
            onChange={(e) => setAsk(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setAskOpen(false)
              if (e.key !== 'Enter' || !ask.trim()) return
              runAI(ask.trim())
              setAsk('')
              setAskOpen(false)
            }}
          />
          <button type="button" className="notion-ask-close" onClick={() => setAskOpen(false)}>
            Esc
          </button>
        </div>
      )}

      {editor && <FindReplace editor={editor} open={findOpen} onClose={() => setFindOpen(false)} />}

      <div className="notion-status" role="status">
        <span>{stats.words} words</span>
        <span>{stats.characters} characters</span>
        <span>{stats.readingTimeMinutes} min read</span>
      </div>

      <p className="notion-hint">
        Hover a block for the <kbd>⠿</kbd> handle, drag to reorder, or type <kbd>/</kbd> for the
        command menu. <kbd>@</kbd> mentions a person or page, and <kbd>⌘F</kbd> opens find and
        replace.
      </p>
    </div>
  )
}
