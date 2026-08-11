import type { Editor } from '@richkitjs/core'
import { ChevronDownIcon, HighlightIcon, TextColorIcon } from '../icons'
import { Popover } from './Popover'

const TEXT_COLORS = [
  '#000000',
  '#374151',
  '#6b7280',
  '#9ca3af',
  '#d1d5db',
  '#dc2626',
  '#ea580c',
  '#d97706',
  '#16a34a',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#c026d3',
  '#db2777',
  '#be123c',
]

const HIGHLIGHT_COLORS = [
  '#fff59d',
  '#fde68a',
  '#fed7aa',
  '#fecaca',
  '#fbcfe8',
  '#e9d5ff',
  '#bfdbfe',
  '#a7f3d0',
  '#bbf7d0',
  '#fef3c7',
]

export function TextColorMenu({ editor }: { editor: Editor }) {
  return (
    <Popover
      className="tb-pop-color"
      trigger={
        <button type="button" className="tb-btn tb-btn-split" title="Text color">
          <TextColorIcon />
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) => (
        <div className="tb-color-panel">
          <div className="tb-color-label">Text color</div>
          <div className="tb-swatches">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="tb-swatch"
                style={{ background: c }}
                title={c}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor.chain().call('setColor', c).focus().run()
                  close()
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="tb-btn-ghost tb-color-reset"
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().call('unsetColor').focus().run()
              close()
            }}
          >
            Reset
          </button>
        </div>
      )}
    </Popover>
  )
}

export function HighlightMenu({ editor }: { editor: Editor }) {
  return (
    <Popover
      className="tb-pop-color"
      trigger={
        <button type="button" className="tb-btn tb-btn-split" title="Highlight">
          <HighlightIcon />
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) => (
        <div className="tb-color-panel">
          <div className="tb-color-label">Highlight</div>
          <div className="tb-swatches">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="tb-swatch"
                style={{ background: c }}
                title={c}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor.chain().call('setHighlight', c).focus().run()
                  close()
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="tb-btn-ghost tb-color-reset"
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().call('unsetHighlight').focus().run()
              close()
            }}
          >
            Remove highlight
          </button>
        </div>
      )}
    </Popover>
  )
}
