import { Mark, type Command } from '@richkit/core'
import type { Attrs, MarkType } from 'prosemirror-model'

function setTextStyleAttrs(patch: Partial<Attrs>): Command {
  return ({ state, tr, dispatch }) => {
    const mark: MarkType | undefined = state.schema.marks['textStyle']
    if (!mark) return false
    const { from, to, empty, $from } = state.selection

    let existing: Attrs | null = null
    if (empty) {
      const stored = state.storedMarks?.find((m) => m.type === mark)
      const atCursor = $from.marks().find((m) => m.type === mark)
      existing = stored?.attrs ?? atCursor?.attrs ?? null
    } else {
      state.doc.nodesBetween(from, to, (node) => {
        if (existing) return false
        if (node.isText) {
          const m = node.marks.find((mk) => mk.type === mark)
          if (m) existing = m.attrs
        }
        return true
      })
    }
    const base = existing ?? { color: null, fontFamily: null, fontSize: null }
    const next = { ...base, ...patch }
    const allNull = Object.values(next).every((v) => v == null)

    if (dispatch) {
      if (empty) {
        tr.removeStoredMark(mark)
        if (!allNull) tr.addStoredMark(mark.create(next))
      } else {
        tr.removeMark(from, to, mark)
        if (!allNull) tr.addMark(from, to, mark.create(next))
      }
      dispatch(tr)
    }
    return true
  }
}

export const TextStyle = Mark.create({
  name: 'textStyle',
  attrs: {
    color: { default: null },
    fontFamily: { default: null },
    fontSize: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'span',
      getAttrs: (node) => {
        const el = node as HTMLElement
        const color = el.style.color || null
        const fontFamily = el.style.fontFamily || null
        const fontSize = el.style.fontSize || null
        if (!color && !fontFamily && !fontSize) return false
        return { color, fontFamily, fontSize }
      },
    },
  ],
  renderHTML: (mark) => {
    const parts: string[] = []
    if (mark.attrs.color) parts.push(`color: ${mark.attrs.color}`)
    if (mark.attrs.fontFamily) parts.push(`font-family: ${mark.attrs.fontFamily}`)
    if (mark.attrs.fontSize) parts.push(`font-size: ${mark.attrs.fontSize}`)
    return ['span', { style: parts.join('; ') }, 0]
  },
  addCommands: () => ({
    setColor:
      (...args: unknown[]): Command => {
        const [color] = args as [string | null]
        return setTextStyleAttrs({ color })
      },
    unsetColor: (): Command => setTextStyleAttrs({ color: null }),
    setFontFamily:
      (...args: unknown[]): Command => {
        const [fontFamily] = args as [string | null]
        return setTextStyleAttrs({ fontFamily })
      },
    unsetFontFamily: (): Command => setTextStyleAttrs({ fontFamily: null }),
    setFontSize:
      (...args: unknown[]): Command => {
        const [fontSize] = args as [string | null]
        return setTextStyleAttrs({ fontSize })
      },
    unsetFontSize: (): Command => setTextStyleAttrs({ fontSize: null }),
  }),
})
