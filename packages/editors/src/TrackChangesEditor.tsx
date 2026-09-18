import { forwardRef, useEffect, useMemo } from 'react'
import {
  EditorContent,
  SuggestionSidebar,
  Toolbar,
  Icons,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
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

export interface TrackChangesEditorProps {
  /** Who new suggestions are attributed to. Defaults to "You". */
  author?: string
  /** Record edits as suggestions. Defaults to true; false edits directly. */
  trackChanges?: boolean
}

/** Suggesting mode: edits land as accept/reject-able suggestions in a sidebar. */
export const TrackChangesEditor = forwardRef(function TrackChangesEditor(
  props: AnyFieldProps & TrackChangesEditorProps,
  ref: AnyHandleRef,
) {
  const { author = 'You', trackChanges = true, placeholder, className, style, name, format } = props
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'light')

  // Every edit lands as a suggestion attributed to `author`, next to the ones
  // already in the document.
  useEffect(() => {
    if (!editor) return
    if (trackChanges) editor.chain().call('enableTrackChanges', author).run()
    else editor.chain().call('disableTrackChanges').run()
  }, [editor, author, trackChanges])

  return (
    <div className={cx('demo-frame demo-track', className)} data-theme={theme} style={style}>
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
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<TrackChangesEditorProps>
