import {
  lift as pmLift,
  setBlockType as pmSetBlockType,
  wrapIn as pmWrapIn,
} from 'prosemirror-commands'
import { liftListItem, wrapInList as pmWrapInList } from 'prosemirror-schema-list'
import { Fragment, type Attrs, type Node as PMNode, type NodeType } from 'prosemirror-model'
import { Selection } from 'prosemirror-state'
import type { Command } from './chain'

function nodeType(
  name: string,
  schema: { nodes: Record<string, NodeType | undefined> },
): NodeType | null {
  return schema.nodes[name] ?? null
}

export function setBlockType(name: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch, view }) => {
    const type = nodeType(name, state.schema)
    if (!type) return false
    return pmSetBlockType(type, attrs ?? null)(state, dispatch ?? undefined, view ?? undefined)
  }
}

export function wrapIn(name: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch, view }) => {
    const type = nodeType(name, state.schema)
    if (!type) return false
    return pmWrapIn(type, attrs ?? null)(state, dispatch ?? undefined, view ?? undefined)
  }
}

export function lift(): Command {
  return ({ state, dispatch, view }) => pmLift(state, dispatch ?? undefined, view ?? undefined)
}

export function wrapInList(name: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch }) => {
    const type = nodeType(name, state.schema)
    if (!type) return false
    return pmWrapInList(type, attrs ?? null)(state, dispatch ?? undefined)
  }
}

function isList(node: PMNode): boolean {
  return (node.type.spec.group ?? '').split(' ').includes('list')
}

/**
 * Toggles a list of type `name` around the selection. Inside a list of that
 * type the selected items are lifted back out; inside a list of another type
 * that list is converted in place (items retyped when the target list wants a
 * different item node, e.g. taskList → taskItem); outside any list the
 * selection is wrapped.
 */
export function toggleList(name: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch }) => {
    const type = nodeType(name, state.schema)
    if (!type) return false
    const { $from, $to } = state.selection
    const range = $from.blockRange($to, isList)
    if (!range) return pmWrapInList(type, attrs ?? null)(state, dispatch ?? undefined)

    const list = range.parent
    if (list.type === type) {
      const itemType = list.child(range.startIndex).type
      return liftListItem(itemType)(state, dispatch ?? undefined)
    }

    const itemType = type.contentMatch.defaultType
    if (!itemType) return false
    const items: PMNode[] = []
    let valid = true
    list.forEach((item) => {
      if (item.type !== itemType && !itemType.validContent(item.content)) valid = false
      items.push(item.type === itemType ? item : itemType.create(null, item.content, item.marks))
    })
    const converted = type.create(attrs ?? null, Fragment.from(items), list.marks)
    if (!valid || !type.validContent(converted.content)) return false
    if (dispatch) {
      const pos = range.$from.before(range.depth)
      const tr = state.tr.replaceWith(pos, pos + list.nodeSize, converted)
      // The replacement has the same shape, so every position inside it is
      // unchanged — restore the selection instead of letting it collapse.
      tr.setSelection(Selection.fromJSON(tr.doc, state.selection.toJSON()))
      dispatch(tr.scrollIntoView())
    }
    return true
  }
}

export function toggleWrap(name: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch, view }) => {
    const type = nodeType(name, state.schema)
    if (!type) return false
    const { $from } = state.selection
    for (let depth = $from.depth; depth >= 0; depth--) {
      if ($from.node(depth).type === type) {
        return pmLift(state, dispatch ?? undefined, view ?? undefined)
      }
    }
    return pmWrapIn(type, attrs ?? null)(state, dispatch ?? undefined, view ?? undefined)
  }
}

export function toggleBlockType(name: string, fallbackName: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch, view }) => {
    const type = nodeType(name, state.schema)
    const fallback = nodeType(fallbackName, state.schema)
    if (!type || !fallback) return false
    const { $from } = state.selection
    const isActive =
      $from.parent.type === type &&
      (!attrs || Object.entries(attrs).every(([k, v]) => $from.parent.attrs[k] === v))
    const target = isActive ? fallback : type
    return pmSetBlockType(target, isActive ? null : (attrs ?? null))(
      state,
      dispatch ?? undefined,
      view ?? undefined,
    )
  }
}
