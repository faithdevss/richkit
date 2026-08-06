import { useEditor, EditorContent, SlashMenu, BubbleMenu, Toolbar, Icons, notify } from '@richkit/react'
import { StarterKit } from '@richkit/starter-kit'
import {
  AlignMenu,
  BlockTypeMenu,
  HighlightMenu,
  ImageMenu,
  LinkMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkit/react'
import { SIMPLE_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

export function SimpleEditor() {
  const editor = useEditor({ extensions: StarterKit, content: SIMPLE_CONTENT })
  useDevEditor(editor)

  return (
    <div className="demo-frame demo-simple" data-theme="dark">
      {editor && (
        <Toolbar editor={editor} className="toolbar demo-toolbar">
          <ToolbarGroup>
            <ToolbarButton editor={editor} command="undo" label={<Icons.UndoIcon />} title="Undo" />
            <ToolbarButton editor={editor} command="redo" label={<Icons.RedoIcon />} title="Redo" />
          </ToolbarGroup>
          <ToolbarGroup>
            <BlockTypeMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton editor={editor} command="toggleBulletList" isActiveName="bulletList" label={<Icons.BulletListIcon />} title="Bullet list" />
            <ToolbarButton editor={editor} command="toggleOrderedList" isActiveName="orderedList" label={<Icons.OrderedListIcon />} title="Numbered list" />
            <ToolbarButton editor={editor} command="toggleBlockquote" isActiveName="blockquote" label={<Icons.BlockquoteIcon />} title="Blockquote" />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton editor={editor} command="toggleBold" isActiveName="bold" label={<Icons.BoldIcon />} title="Bold" />
            <ToolbarButton editor={editor} command="toggleItalic" isActiveName="italic" label={<Icons.ItalicIcon />} title="Italic" />
            <ToolbarButton editor={editor} command="toggleStrike" isActiveName="strike" label={<Icons.StrikeIcon />} title="Strikethrough" />
            <ToolbarButton editor={editor} command="toggleCode" isActiveName="code" label={<Icons.CodeIcon />} title="Inline code" />
            <ToolbarButton editor={editor} command="toggleUnderline" isActiveName="underline" label={<Icons.UnderlineIcon />} title="Underline" />
            <HighlightMenu editor={editor} />
            <LinkMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <AlignMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <ImageMenu editor={editor} />
          </ToolbarGroup>
        </Toolbar>
      )}
      <div className="demo-scroll">
        <div className="demo-page demo-page-simple">
          <EditorContent editor={editor} className="editor" />
          <SlashMenu editor={editor} />
          <BubbleMenu editor={editor} className="bubble-menu">
            {editor && (
              <>
                <ToolbarButton editor={editor} command="toggleBold" isActiveName="bold" label={<Icons.BoldIcon />} title="Bold" />
                <ToolbarButton editor={editor} command="toggleItalic" isActiveName="italic" label={<Icons.ItalicIcon />} title="Italic" />
                <ToolbarButton editor={editor} command="toggleStrike" isActiveName="strike" label={<Icons.StrikeIcon />} title="Strikethrough" />
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
    </div>
  )
}
