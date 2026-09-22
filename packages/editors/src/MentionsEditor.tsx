import { forwardRef, useMemo, type KeyboardEvent, type ReactNode } from 'react'
import { EditorContent, MentionMenu, type MentionCandidate } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import { getMentionState } from '@richkitjs/extension-mention'
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

export interface MentionsEditorProps {
  /** Who and what can be mentioned after `@`. The editor stores only id and label. */
  mentions?: MentionCandidate[]
  /** Called with the message's HTML on Enter or the send button. The box then clears. */
  onSubmit?: (html: string) => void
  /** Rendered in the bar above the log — a channel name, a hint. */
  header?: ReactNode
  /** The message log above the composer. */
  children?: ReactNode
}

/**
 * A chat composer: `@` mentions, Enter sends, Shift+Enter breaks the line.
 * Put the conversation in `children` to get the log above it.
 */
export const MentionsEditor = forwardRef(function MentionsEditor(
  props: AnyFieldProps & MentionsEditorProps,
  ref: AnyHandleRef,
) {
  const {
    mentions = [],
    onSubmit,
    header,
    children,
    placeholder = 'Type @ to mention someone',
    className,
    style,
    name,
    format,
  } = props
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'dark')

  const send = () => {
    if (!editor || editor.isEmpty || !editor.isEditable) return
    // getHTML() is the editor's own serialisation: typed text is escaped and
    // mentions carry only the id and label picked from `mentions`.
    onSubmit?.(editor.getHTML())
    editor.setContent('<p></p>')
    editor.focus()
  }

  // Capture phase, so this runs before the editor turns Enter into a new
  // paragraph. While the mention menu is open, Enter picks a person instead.
  const onKeyDownCapture = (e: KeyboardEvent) => {
    if (!editor || e.key !== 'Enter' || e.shiftKey) return
    if (getMentionState(editor.state)?.active) return
    e.preventDefault()
    e.stopPropagation()
    send()
  }

  return (
    <div className={cx('rk-frame rk-chat', className)} data-theme={theme} style={style}>
      {header && <div className="chat-head">{header}</div>}
      {children && <div className="chat-log">{children}</div>}
      <div className="chat-composer" onKeyDownCapture={onKeyDownCapture}>
        <EditorContent editor={editor} className="editor chat-input" />
        <button type="button" className="chat-send" title="Send" aria-label="Send" onClick={send}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
        <MentionMenu editor={editor} items={mentions} />
      </div>
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<MentionsEditorProps>
