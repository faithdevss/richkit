import { Mark, setMark, unsetMark, type Command, type CommandProps } from '@richkitjs/core'

/** Canonical form so '#fff59d' and 'rgb(255, 245, 157)' (as parsed back from HTML) compare equal. */
function normalizeColor(color: unknown): string {
  const c = String(color ?? '')
    .trim()
    .toLowerCase()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(c)?.[1]
  if (!hex) return c.replace(/\s+/g, '')
  const full = hex.length === 3 ? [...hex].map((h) => h + h).join('') : hex
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  return `rgb(${r},${g},${b})`
}

/** Whether all selected text (or the cursor's marks) already has this highlight color. */
function hasHighlight(state: CommandProps['state'], color: string): boolean {
  const type = state.schema.marks['highlight']
  if (!type) return false
  const target = normalizeColor(color)
  const match = (m: { type: unknown; attrs: Record<string, unknown> }) =>
    m.type === type && normalizeColor(m.attrs.color) === target
  const { empty, from, to, $from } = state.selection
  if (empty) return (state.storedMarks ?? $from.marks()).some(match)
  let any = false
  let all = true
  state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return
    any = true
    if (!node.marks.some(match)) all = false
  })
  return any && all
}

/** Applies the highlight, or removes it when the selection already has that color. */
function toggleHighlight(color: string): Command {
  return (props) =>
    hasHighlight(props.state, color)
      ? unsetMark('highlight')(props)
      : setMark('highlight', { color })(props)
}

export const Highlight = Mark.create({
  name: 'highlight',
  attrs: {
    color: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'mark',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return { color: el.style.backgroundColor || null }
      },
    },
    {
      style: 'background-color',
      getAttrs: (value) => {
        if (!value || value === 'transparent') return false
        return { color: value as string }
      },
    },
  ],
  renderHTML: (mark) => {
    const color = mark.attrs.color as string | null
    const attrs = color ? { style: `background-color: ${color}` } : {}
    return ['mark', attrs, 0]
  },
  addCommands: () => ({
    setHighlight: (...args: unknown[]): Command => {
      const [color] = args as [string | null]
      if (!color) return unsetMark('highlight')
      return toggleHighlight(color)
    },
    unsetHighlight: (): Command => unsetMark('highlight'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-h': toggleHighlight('#fff59d'),
  }),
})
