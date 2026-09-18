import {
  useEditor,
  EditorContent,
  BubbleMenu,
  Icons,
  notify,
  ToolbarButton,
} from '@richkitjs/react'
import { Bold, History, Italic, Link, Paragraph } from '@richkitjs/starter-kit'
import { MINIMAL_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

// Only what this editor needs. The document and text nodes come from the
// core; everything else is opt-in.
const EXTENSIONS = [Paragraph, Bold, Italic, Link, History]

export function MinimalEditor() {
  const editor = useEditor({ extensions: EXTENSIONS, content: MINIMAL_CONTENT })
  useDevEditor(editor)

  return (
    <div className="demo-frame demo-minimal" data-theme="dark">
      <div className="demo-scroll">
        <div className="demo-page demo-page-minimal">
          <EditorContent editor={editor} className="editor" />
          <BubbleMenu editor={editor} className="bubble-menu">
            {editor && (
              <>
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
                <button
                  type="button"
                  className={`tb-btn${editor.isActive('link') ? ' is-active' : ''}`}
                  title="Link"
                  onMouseDown={async (e) => {
                    e.preventDefault()
                    const url = await notify.prompt({
                      title: 'Link',
                      message: 'Paste a URL, or leave it empty to remove the link.',
                      placeholder: 'https://example.com',
                      okLabel: 'Apply',
                    })
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
    </div>
  )
}
