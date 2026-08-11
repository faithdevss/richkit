import type { Editor } from '@richkit/core'
import { ChevronDownIcon } from '../icons'
import { Popover } from './Popover'

export interface BlockTypeMenuProps {
  editor: Editor
}

const ITEMS: {
  label: string
  cmd: string
  args?: unknown[]
  active: string
  attrs?: Record<string, unknown>
  preview: string
}[] = [
  { label: 'Paragraph', cmd: 'setParagraph', active: 'paragraph', preview: 'Normal text' },
  {
    label: 'Heading 1',
    cmd: 'setHeading',
    args: [{ level: 1 }],
    active: 'heading',
    attrs: { level: 1 },
    preview: 'H1',
  },
  {
    label: 'Heading 2',
    cmd: 'setHeading',
    args: [{ level: 2 }],
    active: 'heading',
    attrs: { level: 2 },
    preview: 'H2',
  },
  {
    label: 'Heading 3',
    cmd: 'setHeading',
    args: [{ level: 3 }],
    active: 'heading',
    attrs: { level: 3 },
    preview: 'H3',
  },
  {
    label: 'Heading 4',
    cmd: 'setHeading',
    args: [{ level: 4 }],
    active: 'heading',
    attrs: { level: 4 },
    preview: 'H4',
  },
]

function currentLabel(editor: Editor): string {
  for (const item of ITEMS) {
    if (editor.isActive(item.active, item.attrs ?? null)) return item.label
  }
  return 'Paragraph'
}

export function BlockTypeMenu({ editor }: BlockTypeMenuProps) {
  return (
    <Popover
      className="tb-pop-blocktype"
      trigger={
        <button type="button" className="tb-btn tb-blocktype-trigger" title="Block type">
          <span>{currentLabel(editor)}</span>
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) => (
        <div className="tb-menu" role="menu">
          {ITEMS.map((item) => {
            const active = editor.isActive(item.active, item.attrs ?? null)
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`tb-menu-item ${active ? 'is-active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor
                    .chain()
                    .call(item.cmd, ...(item.args ?? []))
                    .focus()
                    .run()
                  close()
                }}
              >
                <span className={`tb-menu-preview tb-preview-${item.preview.toLowerCase()}`}>
                  {item.preview}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </Popover>
  )
}
