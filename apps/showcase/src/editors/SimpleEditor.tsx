import { useState } from 'react'
import {
  useEditor,
  EditorContent,
  SlashMenu,
  BubbleMenu,
  Toolbar,
  Icons,
  notify,
  AlignMenu,
  BlockTypeMenu,
  BulletListMenu,
  FindReplace,
  HighlightMenu,
  ImageMenu,
  LinkMenu,
  OrderedListMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import { SIMPLE_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

export function SimpleEditor() {
  const editor = useEditor({ extensions: StarterKit, content: SIMPLE_CONTENT })
  useDevEditor(editor)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [findOpen, setFindOpen] = useState(false)

  return (
    <div className="demo-frame demo-simple" data-theme={theme}>
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
            <BulletListMenu editor={editor} />
            <OrderedListMenu editor={editor} />
            <ToolbarButton
              editor={editor}
              command="toggleTaskList"
              isActiveName="taskList"
              label={<Icons.TaskListIcon />}
              title="To-do list"
            />
          </ToolbarGroup>
          <ToolbarGroup>
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
            <ToolbarButton
              editor={editor}
              command="toggleUnderline"
              isActiveName="underline"
              label={<Icons.UnderlineIcon />}
              title="Underline"
            />
            <HighlightMenu editor={editor} />
            <LinkMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton
              editor={editor}
              command="toggleSuperscript"
              isActiveName="superscript"
              label={<Icons.SuperscriptIcon />}
              title="Superscript"
            />
            <ToolbarButton
              editor={editor}
              command="toggleSubscript"
              isActiveName="subscript"
              label={<Icons.SubscriptIcon />}
              title="Subscript"
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <AlignMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <ImageMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup className="tb-group-end">
            <button
              type="button"
              className={`tb-btn${findOpen ? ' is-active' : ''}`}
              title="Find and replace"
              onMouseDown={(e) => {
                e.preventDefault()
                setFindOpen(true)
              }}
            >
              <Icons.SearchIcon />
            </button>
            <button
              type="button"
              className="tb-btn"
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              onMouseDown={(e) => {
                e.preventDefault()
                setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
              }}
            >
              {theme === 'dark' ? <Icons.SunIcon /> : <Icons.MoonIcon />}
            </button>
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
                <button
                  type="button"
                  className={`tb-btn${editor.isActive('link') ? ' is-active' : ''}`}
                  title="Link"
                  onMouseDown={async (e) => {
                    e.preventDefault()
                    const url = await notify.prompt({
                      title: 'Link',
                      message: 'Paste a URL.',
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
      {editor && <FindReplace editor={editor} open={findOpen} onClose={() => setFindOpen(false)} />}
    </div>
  )
}
