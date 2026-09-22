import type { Editor } from '@richkitjs/core'
import { ChevronDownIcon, FontIcon, FontSizeIcon } from '../icons'
import { Popover } from './Popover'

const FONT_FAMILIES = [
  { label: 'Default', value: null },
  { label: 'Sans-serif', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
]

const FONT_SIZES = [
  { label: 'Default', value: null },
  { label: '10', value: '10px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '32', value: '32px' },
  { label: '48', value: '48px' },
]

function currentMarkAttr(editor: Editor, key: string): string | null {
  const { $from } = editor.state.selection
  const mark = editor.state.schema.marks['textStyle']
  if (!mark) return null
  const m = $from.marks().find((mk) => mk.type === mark)
  return (m?.attrs[key] as string | null) ?? null
}

export interface FontMenuProps {
  editor: Editor
  /** Show an icon instead of the current value — for compact toolbars. */
  iconOnly?: boolean
}

export function FontFamilyMenu({ editor, iconOnly = false }: FontMenuProps) {
  const current = currentMarkAttr(editor, 'fontFamily')
  const label = FONT_FAMILIES.find((f) => f.value === current)?.label ?? 'Custom'
  return (
    <Popover
      className="tb-pop-font"
      trigger={
        <button
          type="button"
          className={`tb-btn tb-font-trigger${iconOnly ? ' is-icon' : ''}`}
          title={`Font family — ${label}`}
          aria-label={`Font family — ${label}`}
        >
          {iconOnly ? <FontIcon /> : <span className="tb-font-label">{label}</span>}
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) => (
        <div className="tb-menu" role="menu">
          {FONT_FAMILIES.map((f) => (
            <button
              key={f.label}
              type="button"
              role="menuitem"
              className={`tb-menu-item ${current === f.value ? 'is-active' : ''}`}
              style={{ fontFamily: f.value ?? undefined }}
              onMouseDown={(e) => {
                e.preventDefault()
                editor.chain().call('setFontFamily', f.value).focus().run()
                close()
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}

export function FontSizeMenu({ editor, iconOnly = false }: FontMenuProps) {
  const current = currentMarkAttr(editor, 'fontSize')
  const label = FONT_SIZES.find((f) => f.value === current)?.label ?? current ?? '–'
  return (
    <Popover
      className="tb-pop-fontsize"
      trigger={
        <button
          type="button"
          className={`tb-btn tb-fontsize-trigger${iconOnly ? ' is-icon' : ''}`}
          title={`Font size — ${label}`}
          aria-label={`Font size — ${label}`}
        >
          {iconOnly ? <FontSizeIcon /> : <span>{label}</span>}
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) => (
        <div className="tb-menu" role="menu">
          {FONT_SIZES.map((f) => (
            <button
              key={f.label}
              type="button"
              role="menuitem"
              className={`tb-menu-item ${current === f.value ? 'is-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                editor.chain().call('setFontSize', f.value).focus().run()
                close()
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}
