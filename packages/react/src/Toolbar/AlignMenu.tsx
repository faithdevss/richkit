import type { Editor } from '@richkitjs/core'
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ChevronDownIcon,
} from '../icons'
import { Popover } from './Popover'

export interface AlignMenuProps {
  editor: Editor
  /** Collapse the four buttons into one dropdown — for compact toolbars. */
  dropdown?: boolean
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

export function AlignMenu({ editor, dropdown = false }: AlignMenuProps) {
  const current = activeBlockAlign(editor)
  const apply = (value: string) =>
    editor
      .chain()
      .call('setTextAlign', value === 'left' ? null : value)
      .focus()
      .run()

  if (dropdown) {
    const active = ITEMS.find((i) => i.value === current) ?? ITEMS[0]
    return (
      <Popover
        className="tb-pop-align"
        trigger={
          <button
            type="button"
            className="tb-btn tb-btn-split"
            title={active.label}
            aria-label={active.label}
          >
            <active.Icon />
            <ChevronDownIcon className="tb-caret" />
          </button>
        }
      >
        {(close) => (
          <div className="tb-menu tb-align-menu" role="menu">
            {ITEMS.map(({ value, Icon, label }) => (
              <button
                key={value}
                type="button"
                role="menuitem"
                className={`tb-btn ${current === value ? 'is-active' : ''}`}
                title={label}
                aria-label={label}
                onMouseDown={(e) => {
                  e.preventDefault()
                  apply(value)
                  close()
                }}
              >
                <Icon />
              </button>
            ))}
          </div>
        )}
      </Popover>
    )
  }

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
            aria-label={label}
            aria-pressed={active}
            onMouseDown={(e) => {
              e.preventDefault()
              apply(value)
            }}
          >
            <Icon />
          </button>
        )
      })}
    </>
  )
}
