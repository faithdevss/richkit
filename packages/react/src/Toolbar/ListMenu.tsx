import type { Editor } from '@richkitjs/core'
import type { ComponentType, SVGProps } from 'react'
import { BulletListIcon, ChevronDownIcon, OrderedListIcon } from '../icons'
import { Popover } from './Popover'

export interface ListMenuProps {
  editor: Editor
}

const BULLET_STYLES: { value: string; label: string; markers: string[] }[] = [
  { value: 'disc', label: 'Disc', markers: ['●', '●', '●'] },
  { value: 'circle', label: 'Circle', markers: ['○', '○', '○'] },
  { value: 'square', label: 'Square', markers: ['■', '■', '■'] },
]

const ORDERED_STYLES: { value: string; label: string; markers: string[] }[] = [
  { value: 'decimal', label: 'Decimal', markers: ['1.', '2.', '3.'] },
  { value: 'decimal-leading-zero', label: 'Leading zero', markers: ['01.', '02.', '03.'] },
  { value: 'lower-alpha', label: 'Lower alpha', markers: ['a.', 'b.', 'c.'] },
  { value: 'upper-alpha', label: 'Upper alpha', markers: ['A.', 'B.', 'C.'] },
  { value: 'lower-roman', label: 'Lower roman', markers: ['i.', 'ii.', 'iii.'] },
  { value: 'upper-roman', label: 'Upper roman', markers: ['I.', 'II.', 'III.'] },
]

/** The listStyle of the closest list ancestor of `nodeName`, if any. */
function currentListStyle(editor: Editor, nodeName: string): string | null {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth)
    if (node.type.name === nodeName) return (node.attrs.listStyle as string | null) ?? null
  }
  return null
}

interface SplitProps {
  editor: Editor
  nodeName: string
  toggleCmd: string
  styleCmd: string
  styles: { value: string; label: string; markers: string[] }[]
  defaultStyle: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
}

/**
 * A list button in two halves: the left half toggles the list, the caret opens
 * the marker-style picker — the shape every desktop editor uses for lists.
 */
function ListSplitButton({
  editor,
  nodeName,
  toggleCmd,
  styleCmd,
  styles,
  defaultStyle,
  Icon,
  title,
}: SplitProps) {
  const active = editor.isActive(nodeName)
  const current = currentListStyle(editor, nodeName) ?? defaultStyle
  return (
    <span className="tb-split">
      <button
        type="button"
        className={`tb-btn tb-split-main${active ? ' is-active' : ''}`}
        title={title}
        aria-label={title}
        aria-pressed={active}
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().call(toggleCmd).focus().run()
        }}
      >
        <Icon />
      </button>
      <Popover
        className="tb-pop-list"
        trigger={
          <button
            type="button"
            className={`tb-btn tb-split-caret${active ? ' is-active' : ''}`}
            title={`${title} style`}
            aria-label={`${title} style`}
          >
            <ChevronDownIcon className="tb-caret" />
          </button>
        }
      >
        {(close) => (
          <div className="tb-list-styles" role="menu">
            {styles.map((s) => (
              <button
                key={s.value}
                type="button"
                role="menuitem"
                className={`tb-list-style${active && current === s.value ? ' is-active' : ''}`}
                title={s.label}
                aria-label={s.label}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor.chain().call(styleCmd, s.value).focus().run()
                  close()
                }}
              >
                {s.markers.map((m, i) => (
                  <span className="tb-list-row" key={i}>
                    <span className="tb-list-marker">{m}</span>
                    <span className="tb-list-line" />
                  </span>
                ))}
                <span className="tb-list-caption">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </Popover>
    </span>
  )
}

export function BulletListMenu({ editor }: ListMenuProps) {
  return (
    <ListSplitButton
      editor={editor}
      nodeName="bulletList"
      toggleCmd="toggleBulletList"
      styleCmd="setBulletListStyle"
      styles={BULLET_STYLES}
      defaultStyle="disc"
      Icon={BulletListIcon}
      title="Bullet list"
    />
  )
}

export function OrderedListMenu({ editor }: ListMenuProps) {
  return (
    <ListSplitButton
      editor={editor}
      nodeName="orderedList"
      toggleCmd="toggleOrderedList"
      styleCmd="setOrderedListStyle"
      styles={ORDERED_STYLES}
      defaultStyle="decimal"
      Icon={OrderedListIcon}
      title="Numbered list"
    />
  )
}
