import { useRef, useState } from 'react'
import {
  useEditor,
  EditorContent,
  Toolbar,
  Icons,
  BlockTypeMenu,
  LinkMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import { docToMarkdown, markdownToHtml } from '@richkitjs/markdown'
import { MARKDOWN_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

export function MarkdownEditor() {
  const [source, setSource] = useState(MARKDOWN_CONTENT)
  // Set while the source pane is writing into the editor, so the editor's own
  // update doesn't re-serialise and overwrite what the user is typing.
  const fromSource = useRef(false)

  const editor = useEditor({
    extensions: StarterKit,
    content: markdownToHtml(MARKDOWN_CONTENT),
    onUpdate: ({ editor }) => {
      if (fromSource.current) return
      setSource(docToMarkdown(editor.state.doc))
    },
  })
  useDevEditor(editor)

  const onSourceChange = (value: string) => {
    setSource(value)
    if (!editor) return
    fromSource.current = true
    editor.setContent(markdownToHtml(value))
    fromSource.current = false
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/markdown' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'release-notes.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="demo-frame demo-markdown" data-theme="dark">
      {editor && (
        <Toolbar editor={editor} className="toolbar demo-toolbar">
          <ToolbarGroup>
            <ToolbarButton editor={editor} command="undo" label={<Icons.UndoIcon />} title="Undo" />
            <ToolbarButton editor={editor} command="redo" label={<Icons.RedoIcon />} title="Redo" />
          </ToolbarGroup>
          <ToolbarGroup>
            <BlockTypeMenu editor={editor} iconOnly />
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
              command="toggleCode"
              isActiveName="code"
              label={<Icons.CodeIcon />}
              title="Inline code"
            />
            <LinkMenu editor={editor} />
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
            <ToolbarButton
              editor={editor}
              command="toggleBlockquote"
              isActiveName="blockquote"
              label={<Icons.BlockquoteIcon />}
              title="Blockquote"
            />
            <ToolbarButton
              editor={editor}
              command="toggleCodeBlock"
              isActiveName="codeBlock"
              label={<Icons.CodeBlockIcon />}
              title="Code block"
            />
          </ToolbarGroup>
          <ToolbarGroup className="tb-group-end">
            <button
              type="button"
              className="tb-btn"
              title="Download .md"
              onMouseDown={(e) => {
                e.preventDefault()
                download()
              }}
            >
              <Icons.FileExportIcon />
            </button>
          </ToolbarGroup>
        </Toolbar>
      )}
      <div className="md-split">
        <div className="demo-scroll">
          <div className="demo-page demo-page-simple">
            <EditorContent editor={editor} className="editor" />
          </div>
        </div>
        <div className="md-source">
          <div className="md-source-label">Markdown</div>
          <textarea
            className="md-source-input"
            spellCheck={false}
            aria-label="Markdown source"
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
