import {
  useEditor,
  EditorContent,
  SlashMenu,
  BubbleMenu,
  Icons,
  notify,
  ToolbarButton,
} from '@richkit/react'
import { StarterKit } from '@richkit/starter-kit'
import { NOTION_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

export function NotionEditor() {
  const editor = useEditor({ extensions: StarterKit, content: NOTION_CONTENT })
  useDevEditor(editor)

  return (
    <div className="demo-frame demo-notion" data-theme="dark">
      <div className="notion-bar">
        <div className="notion-bar-left">
          <button type="button" className="tb-btn" title="Undo" onMouseDown={(e) => { e.preventDefault(); editor?.chain().call('undo').focus().run() }}>
            <Icons.UndoIcon />
          </button>
          <button type="button" className="tb-btn" title="Redo" onMouseDown={(e) => { e.preventDefault(); editor?.chain().call('redo').focus().run() }}>
            <Icons.RedoIcon />
          </button>
        </div>
        <div className="notion-bar-right">
          <span className="notion-avatar" aria-hidden>🧑🏽‍🦰</span>
        </div>
      </div>
      <div className="demo-scroll">
        <div className="demo-page demo-page-notion">
          <EditorContent editor={editor} className="editor" />
          <SlashMenu editor={editor} />
          <BubbleMenu editor={editor} className="bubble-menu">
            {editor && (
              <>
                <ToolbarButton editor={editor} command="toggleBold" isActiveName="bold" label={<Icons.BoldIcon />} title="Bold" />
                <ToolbarButton editor={editor} command="toggleItalic" isActiveName="italic" label={<Icons.ItalicIcon />} title="Italic" />
                <ToolbarButton editor={editor} command="toggleStrike" isActiveName="strike" label={<Icons.StrikeIcon />} title="Strikethrough" />
                <ToolbarButton editor={editor} command="toggleCode" isActiveName="code" label={<Icons.CodeIcon />} title="Code" />
                <button
                  type="button"
                  className={`tb-btn${editor.isActive('link') ? ' is-active' : ''}`}
                  title="Link"
                  onMouseDown={async (e) => {
                    e.preventDefault()
                    const url = await notify.prompt({ title: 'Link', message: 'Paste a URL.', placeholder: 'https://example.com', okLabel: 'Apply' })
                    if (url === null) return
                    if (url === '') editor.chain().call('unsetLink').focus().run()
                    else editor.chain().call('setLink', { href: url }).focus().run()
                  }}
                >
                  <Icons.LinkIcon />
                </button>
              </>
            )}
          </BubbleMenu>
        </div>
      </div>
      <p className="notion-hint">Type <kbd>/</kbd> anywhere to open the command menu.</p>
    </div>
  )
}
