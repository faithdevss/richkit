import {
  BubbleMenu,
  CommentComposer,
  CommentSidebar,
  EditorContent,
  FindReplace,
  Icons,
  Menubar,
  NotificationsHost,
  SourceCode,
  SuggestionSidebar,
  buildMenus,
  notify,
  useEditor,
} from '@rich-editor/react'
import { getTrackState } from '@rich-editor/extension-track-changes'
import { StarterKit } from '@rich-editor/starter-kit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Toolbar } from './Toolbar'

const DRAFT_KEY = 'rich-editor:draft'

const INITIAL = `
<h1>Hello rich editor</h1>
<p>Try the menubar above (File · Edit · Insert · Format · Tools · Table · Help) or the icon toolbar.</p>
<p>Type <strong>**bold**</strong>, <em>*italic*</em>, <code>\`code\`</code>, <code># heading</code>, <code>- bullet</code>, <code>1. ordered</code>, <code>&gt; quote</code>.</p>
<p>Smart typography: type <code>--</code>, <code>...</code>, <code>(c)</code>, <code>(tm)</code>, <code>-&gt;</code>, or quotes.</p>
`

export function App() {
  const [html, setHtml] = useState(INITIAL)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [spellcheck, setSpellcheck] = useState(true)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [trackOn, setTrackOn] = useState(false)
  const [composerRange, setComposerRange] = useState<{ from: number; to: number } | null>(null)

  const editor = useEditor({
    extensions: StarterKit,
    content: typeof window !== 'undefined' ? localStorage.getItem(DRAFT_KEY) || INITIAL : INITIAL,
    onUpdate: ({ editor }) => {
      const next = editor.getHTML()
      setHtml(next)
      try {
        localStorage.setItem(DRAFT_KEY, next)
      } catch {
        // ignore
      }
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.view.dom.setAttribute('spellcheck', spellcheck ? 'true' : 'false')
  }, [editor, spellcheck])

  useEffect(() => {
    if (!editor) return
    ;(window as unknown as { __editor: typeof editor }).__editor = editor
  }, [editor])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setShowFindReplace(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const restoreDraft = useCallback(() => {
    if (!editor) return
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) editor.setContent(saved)
  }, [editor])

  const importFile = useCallback(() => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.html,.htm,.txt,.md,.doc,.docx'
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      const txt = await f.text()
      editor.setContent(txt)
    }
    input.click()
  }, [editor])

  const wordCount = useCallback(() => {
    if (!editor) return
    const text = editor.getText().trim()
    const words = text ? text.split(/\s+/).length : 0
    const chars = text.length
    notify.alert({ title: 'Document statistics', message: `Words: ${words}\nCharacters: ${chars}` })
  }, [editor])

  const shortcuts = useCallback(() => {
    const lines = [
      'Mod+B / I / U      Bold / Italic / Underline',
      'Mod+Shift+S        Strikethrough',
      'Mod+E              Inline code',
      'Mod+Z / Shift+Z    Undo / Redo',
      'Mod+K              Link',
      'Mod+A              Select all',
      'Mod+F              Find & replace',
      'Mod+Alt+1..6       Heading 1..6',
      'Mod+Shift+7 / 8    Numbered / Bullet list',
      'Mod+Shift+L/E/R/J  Align L/C/R/Justify',
      'Mod+Shift+H        Highlight',
      'Mod+P              Print',
    ]
    notify.alert({ title: 'Keyboard shortcuts', message: lines.join('\n') })
  }, [])

  const addComment = useCallback(() => {
    if (!editor) return
    const { from, to, empty } = editor.state.selection
    if (empty) {
      notify.toast.warn('Select some text in the editor first.')
      return
    }
    setCommentsOpen(true)
    setComposerRange({ from, to })
  }, [editor])

  const submitComment = useCallback(
    (body: string) => {
      if (!editor || !composerRange) return
      editor
        .chain()
        .call('addComment', {
          body,
          author: 'You',
          from: composerRange.from,
          to: composerRange.to,
        })
        .focus()
        .run()
      setComposerRange(null)
    },
    [editor, composerRange],
  )

  const toggleTrackChanges = useCallback(() => {
    if (!editor) return
    const isOn = getTrackState(editor.state)?.enabled ?? false
    if (isOn) {
      editor.chain().call('disableTrackChanges').focus().run()
      setTrackOn(false)
    } else {
      editor.chain().call('enableTrackChanges', 'You').focus().run()
      setTrackOn(true)
      setSuggestionsOpen(true)
    }
  }, [editor])

  const menus = useMemo(
    () =>
      editor
        ? buildMenus(editor, {
            findReplace: () => setShowFindReplace(true),
            sourceCode: () => setShowSource(true),
            restoreDraft,
            importFile,
            wordCount,
            shortcuts,
            toggleSpellcheck: () => setSpellcheck((v) => !v),
            spellcheckOn: spellcheck,
            addComment,
            toggleComments: () => setCommentsOpen((v) => !v),
            commentsOpen,
            toggleTrackChanges,
            trackChangesOn: trackOn,
            toggleSuggestions: () => setSuggestionsOpen((v) => !v),
            suggestionsOpen,
          })
        : [],
    [editor, restoreDraft, importFile, wordCount, shortcuts, spellcheck, addComment, commentsOpen, toggleTrackChanges, trackOn, suggestionsOpen],
  )

  return (
    <main className="playground">
      <header className="ph-header">
        <h1>Rich Editor</h1>
        <p>Playground · v0.1.0</p>
      </header>
      {editor && <Menubar editor={editor} menus={menus} />}
      <Toolbar editor={editor} />
      <section className={`editor-shell${(commentsOpen || suggestionsOpen) ? ' has-comments' : ''}`}>
        <EditorContent editor={editor} className="editor" />
        <BubbleMenu editor={editor} className="bubble-menu">
          {editor && (
            <>
              <button
                type="button"
                className={`tb-btn${editor.isActive('bold') ? ' is-active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor.chain().call('toggleBold').focus().run()
                }}
                title="Bold"
              >
                <Icons.BoldIcon />
              </button>
              <button
                type="button"
                className={`tb-btn${editor.isActive('italic') ? ' is-active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor.chain().call('toggleItalic').focus().run()
                }}
                title="Italic"
              >
                <Icons.ItalicIcon />
              </button>
              <button
                type="button"
                className={`tb-btn${editor.isActive('underline') ? ' is-active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor.chain().call('toggleUnderline').focus().run()
                }}
                title="Underline"
              >
                <Icons.UnderlineIcon />
              </button>
              <button
                type="button"
                className={`tb-btn${editor.isActive('link') ? ' is-active' : ''}`}
                onMouseDown={async (e) => {
                  e.preventDefault()
                  const url = await notify.prompt({
                    title: 'Link',
                    message: 'Paste a URL (leave empty to remove).',
                    placeholder: 'https://example.com',
                    okLabel: 'Apply',
                  })
                  if (url === null) return
                  if (url === '') editor.chain().call('unsetLink').focus().run()
                  else editor.chain().call('setLink', { href: url }).focus().run()
                }}
                title="Link"
              >
                <Icons.LinkIcon />
              </button>
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => {
                  e.preventDefault()
                  addComment()
                }}
                title="Add comment"
              >
                <Icons.CommentIcon />
              </button>
            </>
          )}
        </BubbleMenu>
        {commentsOpen && editor && (
          <CommentSidebar
            editor={editor}
            onAddRequest={addComment}
            onClose={() => setCommentsOpen(false)}
          />
        )}
        {suggestionsOpen && editor && (
          <SuggestionSidebar editor={editor} onClose={() => setSuggestionsOpen(false)} />
        )}
        {editor && (
          <CommentComposer
            editor={editor}
            range={composerRange}
            onClose={() => setComposerRange(null)}
            onSubmit={submitComment}
            author="You"
          />
        )}
      </section>
      <section className="output">
        <h2>HTML output</h2>
        <pre>{html}</pre>
      </section>
      {editor && (
        <>
          <FindReplace editor={editor} open={showFindReplace} onClose={() => setShowFindReplace(false)} />
          <SourceCode editor={editor} open={showSource} onClose={() => setShowSource(false)} />
        </>
      )}
      <NotificationsHost />
    </main>
  )
}
