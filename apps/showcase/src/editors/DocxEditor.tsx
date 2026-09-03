import { useCallback, useState } from 'react'
import {
  useEditor,
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
import { StarterKit } from '@richkitjs/starter-kit'
import { downloadDocx, importDocxFile } from '@richkitjs/docx'
import { DOCX_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

const ZOOM_STEPS = [50, 75, 90, 100, 125, 150, 200]

export function DocxEditor() {
  const editor = useEditor({ extensions: StarterKit, content: DOCX_CONTENT })
  useDevEditor(editor)
  const [zoom, setZoom] = useState(100)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

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
      await downloadDocx(editor, { filename: 'non-disclosure-agreement.docx' })
    } catch (err) {
      notify.toast.error(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [editor])

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
    <div className="demo-frame demo-docx" data-theme={theme}>
      {editor && (
        <Toolbar editor={editor} className="toolbar demo-toolbar">
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
            <BlockTypeMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <FontFamilyMenu editor={editor} />
            <FontSizeMenu editor={editor} />
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
                printEditor(editor, { title: 'Non-disclosure agreement' })
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
                setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
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
          <div className="docx-page-header">
            <span className="docx-page-title">Non-disclosure agreement</span>
            <span className="docx-brand">
              ▤ RichKit <em>DOCX EDITOR</em>
            </span>
          </div>
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
    </div>
  )
}
