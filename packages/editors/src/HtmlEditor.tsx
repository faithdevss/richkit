import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import {
  EditorContent,
  Toolbar,
  Icons,
  BlockTypeMenu,
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

// getHTML() returns one line; break after block-level closing tags so the
// source pane is readable.
function formatHtml(html: string): string {
  return html.replace(/(<\/(?:p|h[1-6]|li|ul|ol|blockquote|pre|table|tr)>)(?!\n)/g, '$1\n').trim()
}

export interface HtmlEditorProps {
  /** Show the HTML source beside the editor. Defaults to true. */
  showSource?: boolean
}

/** Rich editing beside its live HTML source; edit either side. */
export const HtmlEditor = forwardRef(function HtmlEditor(
  props: AnyFieldProps & HtmlEditorProps,
  ref: AnyHandleRef,
) {
  const { showSource = true, placeholder, className, style, name, format } = props
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'dark')

  // The source pane mirrors the document — after typing, a toolbar command or
  // a new `value` alike — except while it is the one writing into it.
  const [source, setSource] = useState('')
  const fromSource = useRef(false)
  useEffect(() => {
    if (!editor) return
    const sync = () => setSource(formatHtml(editor.getHTML()))
    sync()
    return editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged && !fromSource.current) sync()
    })
  }, [editor])

  const onSourceChange = (next: string) => {
    setSource(next)
    if (!editor) return
    fromSource.current = true
    editor.setContent(next)
    fromSource.current = false
  }

  return (
    <div className={cx('rk-frame rk-html', className)} data-theme={theme} style={style}>
      {editor && (
        <Toolbar editor={editor} className="toolbar rk-toolbar">
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
        <div className="rk-scroll">
          <div className="rk-page rk-page-simple">
            <EditorContent editor={editor} className="editor" />
          </div>
        </div>
        {showSource && (
          <div className="md-source">
            <div className="md-source-label">HTML</div>
            <textarea
              className="md-source-input"
              spellCheck={false}
              aria-label="HTML source"
              value={source}
              readOnly={props.disabled || props.readOnly}
              onChange={(e) => onSourceChange(e.target.value)}
            />
          </div>
        )}
      </div>
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<HtmlEditorProps>
