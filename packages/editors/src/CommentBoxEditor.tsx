import { forwardRef, useEffect, useMemo, useState, type ReactNode } from 'react'
import { EditorContent, Icons, ToolbarButton } from '@richkitjs/react'
import { Bold, History, Italic, Link, Paragraph } from '@richkitjs/starter-kit'
import { getWordCount } from '@richkitjs/extension-word-count'
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

const EXTENSIONS = [Paragraph, Bold, Italic, Link, History]

export interface CommentBoxEditorProps {
  /** Character limit; the count turns red past it and posting stops. Defaults to 280. */
  limit?: number
  /** Called with the reply's HTML when it is posted. The box then clears. */
  onSubmit?: (html: string) => void
  /** The post button's label. Defaults to "Reply". */
  submitLabel?: string
  /** Rendered above the box — the thread being replied to. */
  children?: ReactNode
}

const EMPTY = { words: 0, characters: 0, charactersNoSpaces: 0, readingTimeMinutes: 0 }

/**
 * A compact reply box: bold, italic and links, a live word and character count
 * against a limit, and a post button.
 */
export const CommentBoxEditor = forwardRef(function CommentBoxEditor(
  props: AnyFieldProps & CommentBoxEditorProps,
  ref: AnyHandleRef,
) {
  const {
    limit = 280,
    onSubmit,
    submitLabel = 'Reply',
    children,
    placeholder = 'Add a reply…',
    className,
    style,
    name,
    format,
  } = props
  const extensions = useMemo(() => withPlaceholder(EXTENSIONS, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'dark')
  const [stats, setStats] = useState(EMPTY)

  useEffect(() => {
    if (!editor) return
    const sync = () => setStats(getWordCount(editor.state.doc))
    sync()
    return editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged) sync()
    })
  }, [editor])

  const left = limit - stats.characters
  const over = left < 0
  const canPost = stats.words > 0 && !over && !props.disabled && !props.readOnly

  const post = () => {
    if (!editor || !canPost) return
    // getHTML() is the editor's own serialisation, so typed text arrives escaped.
    onSubmit?.(editor.getHTML())
    // Through a normal update, so a controlled parent hears the box empty out.
    editor.setContent('<p></p>')
  }

  return (
    <div className={cx('rk-frame rk-reply', className)} data-theme={theme} style={style}>
      <div className="rk-scroll">
        <div className="reply-card">
          {children}
          <div className={`reply-box${over ? ' is-over' : ''}`}>
            <EditorContent editor={editor} className="editor reply-input" />
            <div className="reply-foot">
              {editor && (
                <div className="reply-tools">
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
                </div>
              )}
              <span className="reply-count" aria-live="polite">
                {stats.words} {stats.words === 1 ? 'word' : 'words'} ·{' '}
                <b>{over ? `${-left} over` : `${left} left`}</b>
              </span>
              <button type="button" className="reply-post-btn" disabled={!canPost} onClick={post}>
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<CommentBoxEditorProps>
