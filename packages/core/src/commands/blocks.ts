import {
  lift as pmLift,
  setBlockType as pmSetBlockType,
  wrapIn as pmWrapIn,
} from 'prosemirror-commands'
import { wrapInList as pmWrapInList } from 'prosemirror-schema-list'
import type { Attrs, NodeType } from 'prosemirror-model'
import type { Command } from './chain'

function nodeType(name: string, schema: { nodes: Record<string, NodeType | undefined> }):
  | NodeType
  | null {
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
  return ({ state, dispatch, view }) =>
    pmLift(state, dispatch ?? undefined, view ?? undefined)
}

export function wrapInList(name: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch }) => {
    const type = nodeType(name, state.schema)
    if (!type) return false
    return pmWrapInList(type, attrs ?? null)(state, dispatch ?? undefined)
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

export function toggleBlockType(
  name: string,
  fallbackName: string,
  attrs?: Attrs | null,
): Command {
  return ({ state, dispatch, view }) => {
    const type = nodeType(name, state.schema)
    const fallback = nodeType(fallbackName, state.schema)
    if (!type || !fallback) return false
    const { $from } = state.selection
    const isActive =
      $from.parent.type === type &&
      (!attrs ||
        Object.entries(attrs).every(([k, v]) => $from.parent.attrs[k] === v))
    const target = isActive ? fallback : type
    return pmSetBlockType(target, isActive ? null : attrs ?? null)(
      state,
      dispatch ?? undefined,
      view ?? undefined,
    )
  }
}
