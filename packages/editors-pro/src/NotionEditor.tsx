import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import type { Editor } from '@richkitjs/core'
import {
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
  LinkMenu,
  notify,
  selectionAnchor,
  getOutline,
  defaultSlashItems,
  ToolbarButton,
  type MentionCandidate,
  type SlashItem,
  type OutlineEntry,
} from '@richkitjs/react'
import { Image, Link } from '@richkitjs/starter-kit'
import { StarterKit } from './kit'
import { getWordCount } from '@richkitjs/extension-word-count'
import { AI, type AIComplete } from '@richkitjs/extension-ai'
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

export interface NotionEditorProps {
  /** Left side of the top bar — a breadcrumb or page title. */
  header?: ReactNode
  /** Right side of the top bar, after undo/redo and the theme toggle. */
  headerActions?: ReactNode
  /** People and pages offered after `@`. Without them `@` is plain text. */
  mentions?: MentionCandidate[]
  /**
   * The AI transport. With it, "/" gains Continue Writing and Ask AI, and the
   * selection bubble an Improve button; without it they are hidden.
   */
  ai?: AIComplete
  /** Author recorded on AI output. Defaults to "AI". */
  aiAuthor?: string
  /** Below the status bar — a hint line, a save indicator. */
  footer?: ReactNode
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

function useWordCount(editor: Editor | null) {
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
    // `transaction`, not `update`: a controlled value syncing in is silent.
    return editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged) sync()
    })
  }, [editor])
  return stats
}

function useOutline(editor: Editor | null): OutlineEntry[] {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!editor) return
    return editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged) setTick((t) => t + 1)
    })
  }, [editor])
  return useMemo(() => (editor ? getOutline(editor) : []), [editor, tick])
}

/**
 * A Notion-style page: block handle and drag to reorder, "/" commands, "@"
 * mentions, a two-row selection bubble, find and replace, an outline rail and
 * word count. Pass `ai` to switch on the AI commands.
 */
export const NotionEditor = forwardRef(function NotionEditor(
  props: AnyFieldProps & NotionEditorProps,
  ref: AnyHandleRef,
) {
  const {
    header,
    headerActions,
    mentions,
    ai,
    aiAuthor = 'AI',
    footer,
    placeholder,
    className,
    style,
    name,
    format,
  } = props
  const [theme, toggleTheme] = useTheme(props.theme, 'dark')
  const [moreRow, setMoreRow] = useState(false)
  const [ask, setAsk] = useState('')
  const [askOpen, setAskOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)

  const hasAI = Boolean(ai)
  const aiRef = useRef(ai)
  aiRef.current = ai
  const extensions = useMemo(
    () =>
      withPlaceholder(
        [
          ...StarterKit,
          // Mod+K and the image controls need a dialog; the extensions stay
          // headless and take one from the app.
          Link.configure({ onEditLink: (instance) => void notify.link({ editor: instance }) }),
          Image.configure({
            editText: ({ title, value, anchor }) =>
              notify.prompt({ title, defaultValue: value, okLabel: 'Apply', anchor }),
          }),
          // Through a ref, so a new `ai` function each render does not
          // rebuild the editor; only switching AI on or off does.
          ...(hasAI
            ? [
                AI.configure({
                  complete: (req, opts) => aiRef.current!(req, opts),
                  attributeAs: aiAuthor,
                  track: false,
                }),
              ]
            : []),
        ],
        placeholder,
      ),
    [hasAI, aiAuthor, placeholder],
  )
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const stats = useWordCount(editor)

  const outline = useOutline(editor)
  const slashItems = useMemo(
    () =>
      hasAI ? [...aiSlashItems(() => setAskOpen(true)), ...defaultSlashItems] : defaultSlashItems,
    [hasAI],
  )

  // Mod+F opens find and replace — only while focus is inside this editor, so
  // the page keeps the browser's own find everywhere else.
  const onKeyDown = (e: KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'f') return
    e.preventDefault()
    setFindOpen(true)
  }

  const addComment = useCallback(() => {
    if (!editor) return
    void notify
      .prompt({
        title: 'Comment',
        message: 'Leave a note on this text.',
        okLabel: 'Comment',
        anchor: selectionAnchor(editor),
      })
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
    <div
      className={cx('demo-frame demo-notion', className)}
      data-theme={theme}
      style={style}
      onKeyDown={onKeyDown}
    >
      <div className="notion-bar">
        <div className="notion-bar-left">{header}</div>
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
              toggleTheme()
            }}
          >
            {theme === 'dark' ? <Icons.SunIcon /> : <Icons.MoonIcon />}
          </button>
          {headerActions}
        </div>
      </div>

      <div className="notion-body">
        <div className="demo-scroll" ref={setScrollEl}>
          <div className="demo-page demo-page-notion">
            <EditorContent editor={editor} className="editor" />
            <BlockHandle editor={editor} container={scrollEl} />
            <SlashMenu editor={editor} items={slashItems} />
            {mentions && <MentionMenu editor={editor} items={mentions} />}
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
                    {hasAI && (
                      <>
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
                      </>
                    )}
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
                    <LinkMenu editor={editor} />
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

      {hasAI && askOpen && (
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

      {footer}
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<NotionEditorProps>
