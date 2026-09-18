import { useRef, useState } from 'react'
import {
  useEditor,
  EditorContent,
  Toolbar,
  Icons,
  BlockTypeMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import { HTML_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

// getHTML() returns one line; break after block-level closing tags so the
// source pane is readable.
function formatHtml(html: string): string {
  return html.replace(/(<\/(?:p|h[1-6]|li|ul|ol|blockquote|pre|table|tr)>)(?!\n)/g, '$1\n').trim()
}

export function HtmlEditor() {
  const [source, setSource] = useState(HTML_CONTENT)
  // Set while the source pane is writing into the editor, so the editor's own
  // update doesn't reformat and overwrite what the user is typing.
  const fromSource = useRef(false)

  const editor = useEditor({
    extensions: StarterKit,
    content: HTML_CONTENT,
    onUpdate: ({ editor }) => {
      if (fromSource.current) return
      setSource(formatHtml(editor.getHTML()))
    },
  })
  useDevEditor(editor)

  const onSourceChange = (value: string) => {
    setSource(value)
    if (!editor) return
    fromSource.current = true
    editor.setContent(value)
    fromSource.current = false
  }

  return (
    <div className="demo-frame demo-html" data-theme="dark">
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
              command="toggleUnderline"
              isActiveName="underline"
              label={<Icons.UnderlineIcon />}
              title="Underline"
            />
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
              command="toggleBlockquote"
              isActiveName="blockquote"
              label={<Icons.BlockquoteIcon />}
              title="Blockquote"
            />
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
          <div className="md-source-label">HTML</div>
          <textarea
            className="md-source-input"
            spellCheck={false}
            aria-label="HTML source"
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
