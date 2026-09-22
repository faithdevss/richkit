import type { Editor } from '@richkitjs/core'
import { ChevronDownIcon, EmojiIcon, LineHeightIcon, OmegaIcon } from '../icons'
import { Popover } from './Popover'

const LINE_HEIGHTS = [
  { label: 'Default', value: null },
  { label: '1.0', value: '1.0' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2.0' },
  { label: '2.5', value: '2.5' },
]

export function LineHeightMenu({ editor }: { editor: Editor }) {
  return (
    <Popover
      trigger={
        <button
          type="button"
          className="tb-btn tb-btn-split"
          title="Line height"
          aria-label="Line height"
        >
          <LineHeightIcon />
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) => (
        <div className="tb-menu" role="menu">
          {LINE_HEIGHTS.map((lh) => (
            <button
              key={lh.label}
              type="button"
              role="menuitem"
              className="tb-menu-item"
              onMouseDown={(e) => {
                e.preventDefault()
                editor.chain().call('setLineHeight', lh.value).focus().run()
                close()
              }}
            >
              {lh.label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}

const EMOJI = [
  '😀',
  '😂',
  '😍',
  '😎',
  '🤔',
  '👍',
  '👏',
  '🙌',
  '🎉',
  '🎊',
  '❤️',
  '🔥',
  '✨',
  '⭐',
  '🌟',
  '🚀',
  '💡',
  '✅',
  '❌',
  '⚠️',
  '📌',
  '📎',
  '🔗',
  '📝',
]

export function EmojiMenu({ editor }: { editor: Editor }) {
  return (
    <Popover
      trigger={
        <button type="button" className="tb-btn" title="Insert emoji" aria-label="Insert emoji">
          <EmojiIcon />
        </button>
      }
    >
      {(close) => (
        <div className="tb-emoji-grid">
          {EMOJI.map((e) => (
            <button
              key={e}
              type="button"
              className="tb-emoji-btn"
              onMouseDown={(ev) => {
                ev.preventDefault()
                editor.view.dispatch(editor.view.state.tr.insertText(e))
                editor.focus()
                close()
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}

const SPECIAL = [
  '©',
  '®',
  '™',
  '§',
  '¶',
  '†',
  '‡',
  '°',
  '±',
  '×',
  '÷',
  '≈',
  '≠',
  '≤',
  '≥',
  '∞',
  '√',
  'π',
  'Σ',
  'Δ',
  '∂',
  '∫',
  '→',
  '←',
  '↑',
  '↓',
  '↔',
  '⇒',
  '⇐',
  '⇔',
  '—',
  '–',
  '…',
  '«',
  '»',
  '"',
  '"',
  "'",
  "'",
]

export function SpecialCharsMenu({ editor }: { editor: Editor }) {
  return (
    <Popover
      trigger={
        <button
          type="button"
          className="tb-btn"
          title="Special characters"
          aria-label="Special characters"
        >
          <OmegaIcon />
        </button>
      }
    >
      {(close) => (
        <div className="tb-char-grid">
          {SPECIAL.map((c, i) => (
            <button
              key={`${c}-${i}`}
              type="button"
              className="tb-char-btn"
              onMouseDown={(ev) => {
                ev.preventDefault()
                editor.view.dispatch(editor.view.state.tr.insertText(c))
                editor.focus()
                close()
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}
