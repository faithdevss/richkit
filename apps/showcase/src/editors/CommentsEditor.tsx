import { useCallback, useEffect, useState } from 'react'
import type { Editor } from '@richkitjs/core'
import {
  useEditor,
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
import { StarterKit } from '@richkitjs/starter-kit'
import { COMMENTS_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

type Range = { from: number; to: number }

// Document position of the first match of `text`, so the demo can open with
// threads already anchored to real sentences.
function findText(editor: Editor, text: string): Range | null {
  let found: Range | null = null
  editor.state.doc.descendants((node, pos) => {
    if (found || !node.isText) return !found
    const at = node.text!.indexOf(text)
    if (at >= 0) found = { from: pos + at, to: pos + at + text.length }
    return false
  })
  return found
}

function seedThreads(editor: Editor) {
  const { doc, schema } = editor.state
  const mark = schema.marks['comment']
  if (!mark || doc.rangeHasMark(0, doc.content.size, mark)) return
  const first = findText(editor, '10%')
  if (first) {
    editor
      .chain()
      .call('addComment', {
        ...first,
        id: 'seed-1',
        author: 'Priya',
        body: 'Can we start at 5%? The last rollout hit a billing edge case at 10%.',
      })
      .run()
    editor
      .chain()
      .call('addCommentReply', {
        id: 'seed-1',
        author: 'Marcus',
        body: 'Fair. 5% for the first two days, then double.',
      })
      .run()
  }
  const second = findText(editor, 'Marketing holds the announcement')
  if (second) {
    editor
      .chain()
      .call('addComment', {
        ...second,
        id: 'seed-2',
        author: 'Lena',
        body: 'Marketing is fine with this — confirmed in Monday’s sync.',
      })
      .run()
  }
}

export function CommentsEditor() {
  const editor = useEditor({ extensions: StarterKit, content: COMMENTS_CONTENT })
  useDevEditor(editor)
  const [composer, setComposer] = useState<Range | null>(null)

  useEffect(() => {
    if (editor) seedThreads(editor)
  }, [editor])

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
      .call('addComment', { body, ...composer })
      .focus()
      .run()
    setComposer(null)
  }

  return (
    <div className="demo-frame demo-comments" data-theme="light">
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
        <CommentSidebar editor={editor} onAddRequest={openComposer} />
      </div>
      <CommentComposer editor={editor} range={composer} onClose={closeComposer} onSubmit={submit} />
    </div>
  )
}
