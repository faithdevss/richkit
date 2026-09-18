import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import {
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

export interface MarkdownEditorProps {
  /** Name of the downloaded file. Defaults to "document.md". */
  filename?: string
  /** Show the Markdown source beside the editor. Defaults to true. */
  showSource?: boolean
}

/**
 * Rich editing beside its live Markdown source; edit either side. `value` and
 * `onChange` speak Markdown unless `format` says otherwise.
 */
export const MarkdownEditor = forwardRef(function MarkdownEditor(
  props: AnyFieldProps & MarkdownEditorProps,
  ref: AnyHandleRef,
) {
  const { filename = 'document.md', showSource = true, placeholder, className, style, name } = props
  const format = props.format ?? 'markdown'
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, {
    deps: [extensions],
    defaultFormat: 'markdown',
  })
  const [theme] = useTheme(props.theme, 'dark')

  // The source pane mirrors the document — after typing, a toolbar command or
  // a new `value` alike — except while it is the one writing into it.
  const [source, setSource] = useState('')
  const fromSource = useRef(false)
  useEffect(() => {
    if (!editor) return
    const sync = () => setSource(docToMarkdown(editor.state.doc))
    sync()
    return editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged && !fromSource.current) sync()
    })
  }, [editor])

  const onSourceChange = (next: string) => {
    setSource(next)
    if (!editor) return
    fromSource.current = true
    editor.setContent(markdownToHtml(next))
    fromSource.current = false
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/markdown' }))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cx('demo-frame demo-markdown', className)} data-theme={theme} style={style}>
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
        {showSource && (
          <div className="md-source">
            <div className="md-source-label">Markdown</div>
            <textarea
              className="md-source-input"
              spellCheck={false}
              aria-label="Markdown source"
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
}) as FieldComponent<MarkdownEditorProps, 'markdown'>
