import { forwardRef, useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  EditorContent,
  BubbleMenu,
  Toolbar,
  Icons,
  notify,
  printEditor,
  AlignMenu,
  BlockTypeMenu,
  BulletListMenu,
  FontFamilyMenu,
  FontSizeMenu,
  HighlightMenu,
  ImageMenu,
  LineHeightMenu,
  LinkMenu,
  OrderedListMenu,
  SpecialCharsMenu,
  TableMenu,
  TextColorMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import { StarterKit } from './kit'
import { downloadDocx, importDocxFile } from '@richkitjs/docx'
import {
  cx,
  FieldValue,
  useEditorField,
  useTheme,
  withPlaceholder,
  type AnyProFieldProps,
  type AnyHandleRef,
  type ProFieldComponent,
} from './field'

const ZOOM_STEPS = [50, 75, 90, 100, 125, 150, 200]

export interface DocxEditorProps {
  /** The document's title: shown above the page and used when printing. */
  title?: string
  /** Name of the exported file. Defaults to "document.docx". */
  filename?: string
  /** Shown opposite the title above the page — a logo or product name. */
  brand?: ReactNode
}

/**
 * A word-processor page: fonts, sizes, colours, tables, zoom, print and .docx
 * import/export.
 */
export const DocxEditor = forwardRef(function DocxEditor(
  props: AnyProFieldProps & DocxEditorProps,
  ref: AnyHandleRef,
) {
  const {
    title,
    filename = 'document.docx',
    brand,
    placeholder,
    className,
    style,
    name,
    format,
  } = props
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [zoom, setZoom] = useState(100)
  const [theme, toggleTheme] = useTheme(props.theme, 'dark')

  const stepZoom = useCallback((dir: 1 | -1) => {
    setZoom((current) => {
      const index = ZOOM_STEPS.indexOf(current)
      const next = index === -1 ? 3 : index + dir
      return ZOOM_STEPS[Math.min(Math.max(next, 0), ZOOM_STEPS.length - 1)] ?? current
    })
  }, [])

  const onExport = useCallback(async () => {
    if (!editor) return
    try {
      await downloadDocx(editor, { filename })
    } catch (err) {
      notify.toast.error(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [editor, filename])

  const onImport = useCallback(() => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.docx'
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      try {
        const warnings = await importDocxFile(editor, f)
        if (warnings.length) notify.toast.warn(`DOCX import: ${warnings[0]}`)
      } catch (err) {
        notify.toast.error(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    input.click()
  }, [editor])

  return (
    <div className={cx('demo-frame demo-docx', className)} data-theme={theme} style={style}>
      {editor && (
        <Toolbar editor={editor} className="toolbar demo-toolbar">
          <ToolbarGroup>
            <ToolbarButton editor={editor} command="undo" label={<Icons.UndoIcon />} title="Undo" />
            <ToolbarButton editor={editor} command="redo" label={<Icons.RedoIcon />} title="Redo" />
          </ToolbarGroup>
          <ToolbarGroup>
            <button
              type="button"
              className="tb-btn"
              title="Zoom out"
              onMouseDown={(e) => {
                e.preventDefault()
                stepZoom(-1)
              }}
            >
              <Icons.MinusIcon />
            </button>
            <span className="docx-zoom-value">{zoom}%</span>
            <button
              type="button"
              className="tb-btn"
              title="Zoom in"
              onMouseDown={(e) => {
                e.preventDefault()
                stepZoom(1)
              }}
            >
              <Icons.PlusIcon />
            </button>
          </ToolbarGroup>
          <ToolbarGroup>
            <BlockTypeMenu editor={editor} iconOnly />
          </ToolbarGroup>
          <ToolbarGroup>
            <FontFamilyMenu editor={editor} iconOnly />
            <FontSizeMenu editor={editor} iconOnly />
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
            <TextColorMenu editor={editor} />
            <HighlightMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <LinkMenu editor={editor} />
            <ImageMenu editor={editor} />
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
            <AlignMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <LineHeightMenu editor={editor} />
            <TableMenu editor={editor} />
            <SpecialCharsMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup className="tb-group-end">
            <button
              type="button"
              className="tb-btn"
              title="Import .docx"
              onMouseDown={(e) => {
                e.preventDefault()
                onImport()
              }}
            >
              <Icons.FileImportIcon />
            </button>
            <button
              type="button"
              className="tb-btn"
              title="Export .docx"
              onMouseDown={(e) => {
                e.preventDefault()
                void onExport()
              }}
            >
              <Icons.FileExportIcon />
            </button>
            <button
              type="button"
              className="tb-btn"
              title="Print"
              onMouseDown={(e) => {
                e.preventDefault()
                printEditor(editor, { title: title ?? filename.replace(/\.docx$/i, '') })
              }}
            >
              <Icons.PrintIcon />
            </button>
            <button
              type="button"
              className="tb-btn"
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              onMouseDown={(e) => {
                e.preventDefault()
                toggleTheme()
              }}
            >
              {theme === 'dark' ? <Icons.SunIcon /> : <Icons.MoonIcon />}
            </button>
          </ToolbarGroup>
        </Toolbar>
      )}
      <div className="demo-scroll demo-scroll-docx">
        <div
          className="demo-page demo-page-docx"
          style={{ zoom: zoom === 100 ? undefined : `${String(zoom)}%` }}
        >
          {(title || brand) && (
            <div className="docx-page-header">
              <span className="docx-page-title">{title}</span>
              {brand && <span className="docx-brand">{brand}</span>}
            </div>
          )}
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
                <ToolbarButton
                  editor={editor}
                  command="toggleUnderline"
                  isActiveName="underline"
                  label={<Icons.UnderlineIcon />}
                  title="Underline"
                />
              </>
            )}
          </BubbleMenu>
        </div>
      </div>
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as ProFieldComponent<DocxEditorProps>
