import { useEffect } from 'react'
import {
  useEditor,
  EditorContent,
  SuggestionSidebar,
  Toolbar,
  Icons,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import { TRACK_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

export function TrackChangesEditor() {
  const editor = useEditor({ extensions: StarterKit, content: TRACK_CONTENT })
  useDevEditor(editor)

  // Open in review mode: every edit the visitor makes lands as a suggestion
  // attributed to them, next to the ones already in the document.
  useEffect(() => {
    editor?.chain().call('enableTrackChanges', 'You').run()
  }, [editor])

  return (
    <div className="demo-frame demo-track" data-theme="light">
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
        </Toolbar>
      )}
      <div className="sidebar-split">
        <div className="demo-scroll">
          <div className="demo-page demo-page-sheet">
            <EditorContent editor={editor} className="editor" />
          </div>
        </div>
        <SuggestionSidebar editor={editor} />
      </div>
    </div>
  )
}
