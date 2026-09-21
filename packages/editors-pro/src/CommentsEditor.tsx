import { forwardRef, useCallback, useMemo, useState } from 'react'
import {
  EditorContent,
  BubbleMenu,
  CommentComposer,
  CommentSidebar,
  Toolbar,
  Icons,
  notify,
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

export interface CommentsEditorProps {
  /** Who new comments and replies are attributed to. Defaults to "You". */
  author?: string
}

type Range = { from: number; to: number }

/**
 * Comment threads anchored to text, with a sidebar to reply and resolve.
 *
 * Only the anchors are part of the document: each one is a `comment` mark
 * carrying its thread id, so it round-trips through `value`. The thread itself
 * — body, author, replies — lives in the editor's plugin state and is gone
 * when the editor is rebuilt. To keep comments, store
 * `getCommentsState(editor.state).threads` alongside the value and replay it
 * with `tr.setMeta(commentsKey, { upsert: thread })` once the editor is ready.
 */
export const CommentsEditor = forwardRef(function CommentsEditor(
  props: AnyProFieldProps & CommentsEditorProps,
  ref: AnyHandleRef,
) {
  const { author = 'You', placeholder, className, style, name, format } = props
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'light')
  const [composer, setComposer] = useState<Range | null>(null)

  const openComposer = useCallback(() => {
    if (!editor) return
    const { from, to, empty } = editor.state.selection
    if (empty) {
      notify.toast.warn('Select some text in the editor first.')
      return
    }
    setComposer({ from, to })
  }, [editor])

  const closeComposer = useCallback(() => setComposer(null), [])

  const submit = (body: string) => {
    if (!editor || !composer) return
    editor
      .chain()
      .call('addComment', { body, author, ...composer })
      .focus()
      .run()
    setComposer(null)
  }

  return (
    <div className={cx('demo-frame demo-comments', className)} data-theme={theme} style={style}>
      {editor && (
        <Toolbar editor={editor} className="toolbar demo-toolbar demo-toolbar-light">
          <ToolbarGroup>
            <ToolbarButton editor={editor} command="undo" label={<Icons.UndoIcon />} title="Undo" />
            <ToolbarButton editor={editor} command="redo" label={<Icons.RedoIcon />} title="Redo" />
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
              command="toggleUnderline"
              isActiveName="underline"
              label={<Icons.UnderlineIcon />}
              title="Underline"
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <button
              type="button"
              className="tb-btn"
              title="Add comment"
              onMouseDown={(e) => {
                e.preventDefault()
                openComposer()
              }}
            >
              <Icons.CommentIcon />
            </button>
          </ToolbarGroup>
        </Toolbar>
      )}
      <div className="sidebar-split">
        <div className="demo-scroll">
          <div className="demo-page demo-page-sheet">
            <EditorContent editor={editor} className="editor" />
            <BubbleMenu editor={editor} className="bubble-menu">
              {editor && (
                <button
                  type="button"
                  className="tb-btn"
                  title="Comment"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    openComposer()
                  }}
                >
                  <Icons.CommentIcon />
                </button>
              )}
            </BubbleMenu>
          </div>
        </div>
        <CommentSidebar editor={editor} onAddRequest={openComposer} currentUser={author} />
      </div>
      <CommentComposer editor={editor} range={composer} onClose={closeComposer} onSubmit={submit} />
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as ProFieldComponent<CommentsEditorProps>
