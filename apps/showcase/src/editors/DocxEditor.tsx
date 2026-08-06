import { useCallback } from 'react'
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  Toolbar,
  Icons,
  notify,
  AlignMenu,
  BlockTypeMenu,
  FontFamilyMenu,
  FontSizeMenu,
  ImageMenu,
  LinkMenu,
  TableMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkit/react'
import { StarterKit } from '@richkit/starter-kit'
import { downloadDocx, importDocxFile } from '@richkit/docx'
import { DOCX_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

export function DocxEditor() {
  const editor = useEditor({ extensions: StarterKit, content: DOCX_CONTENT })
  useDevEditor(editor)

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
    <div className="demo-frame demo-docx" data-theme="dark">
      {editor && (
        <Toolbar editor={editor} className="toolbar demo-toolbar">
          <ToolbarGroup>
            <BlockTypeMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <FontFamilyMenu editor={editor} />
            <FontSizeMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton editor={editor} command="toggleBold" isActiveName="bold" label={<Icons.BoldIcon />} title="Bold" />
            <ToolbarButton editor={editor} command="toggleItalic" isActiveName="italic" label={<Icons.ItalicIcon />} title="Italic" />
            <ToolbarButton editor={editor} command="toggleStrike" isActiveName="strike" label={<Icons.StrikeIcon />} title="Strikethrough" />
            <ToolbarButton editor={editor} command="toggleCode" isActiveName="code" label={<Icons.CodeIcon />} title="Inline code" />
          </ToolbarGroup>
          <ToolbarGroup>
            <LinkMenu editor={editor} />
            <ImageMenu editor={editor} />
            <ToolbarButton editor={editor} command="toggleBulletList" isActiveName="bulletList" label={<Icons.BulletListIcon />} title="Bullet list" />
            <ToolbarButton editor={editor} command="toggleOrderedList" isActiveName="orderedList" label={<Icons.OrderedListIcon />} title="Numbered list" />
          </ToolbarGroup>
          <ToolbarGroup>
            <AlignMenu editor={editor} />
            <TableMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <button type="button" className="tb-btn" title="Import .docx" onMouseDown={(e) => { e.preventDefault(); onImport() }}>
              <Icons.UndoIcon />
            </button>
            <button type="button" className="demo-export-btn" onMouseDown={(e) => { e.preventDefault(); onExport() }}>
              Export .docx
            </button>
          </ToolbarGroup>
        </Toolbar>
      )}
      <div className="demo-scroll demo-scroll-docx">
        <div className="demo-page demo-page-docx">
          <div className="docx-page-header">
            <span className="docx-page-title">Non-disclosure agreement</span>
            <span className="docx-brand">▤ RichKit <em>DOCX EDITOR</em></span>
          </div>
          <EditorContent editor={editor} className="editor" />
          <BubbleMenu editor={editor} className="bubble-menu">
            {editor && (
              <>
                <ToolbarButton editor={editor} command="toggleBold" isActiveName="bold" label={<Icons.BoldIcon />} title="Bold" />
                <ToolbarButton editor={editor} command="toggleItalic" isActiveName="italic" label={<Icons.ItalicIcon />} title="Italic" />
                <ToolbarButton editor={editor} command="toggleUnderline" isActiveName="underline" label={<Icons.UnderlineIcon />} title="Underline" />
              </>
            )}
          </BubbleMenu>
        </div>
      </div>
    </div>
  )
}
