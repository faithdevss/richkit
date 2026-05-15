import type { Editor } from '@rich-editor/core'
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from '../icons'

export interface AlignMenuProps {
  editor: Editor
}

function activeBlockAlign(editor: Editor): string | null {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth)
    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
      return (node.attrs.textAlign as string | null) ?? 'left'
    }
  }
  return null
}

const ITEMS = [
  { value: 'left', Icon: AlignLeftIcon, label: 'Align left' },
  { value: 'center', Icon: AlignCenterIcon, label: 'Align center' },
  { value: 'right', Icon: AlignRightIcon, label: 'Align right' },
  { value: 'justify', Icon: AlignJustifyIcon, label: 'Justify' },
] as const

export function AlignMenu({ editor }: AlignMenuProps) {
  const current = activeBlockAlign(editor)
  return (
    <>
      {ITEMS.map(({ value, Icon, label }) => {
        const active = current === value || (current === 'left' && value === 'left')
        return (
          <button
            key={value}
            type="button"
            className={`tb-btn ${active ? 'is-active' : ''}`}
            title={label}
            aria-pressed={active}
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().call('setTextAlign', value === 'left' ? null : value).focus().run()
            }}
          >
            <Icon />
          </button>
        )
      })}
    </>
  )
}
