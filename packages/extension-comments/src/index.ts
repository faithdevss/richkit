import { Mark, type Command } from '@rich-editor/core'
import { commentsKey, commentsPlugin, getCommentsState, newId, type Thread } from './store'

export const Comment = Mark.create({
  name: 'comment',
  attrs: {
    id: { default: null },
    resolved: { default: false },
  },
  inclusive: false,
  excludes: '',
  parseHTML: () => [
    {
      tag: 'span[data-comment-id]',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return {
          id: el.getAttribute('data-comment-id'),
          resolved: el.getAttribute('data-comment-resolved') === 'true',
        }
      },
    },
  ],
  renderHTML: (mark) => {
    const id = mark.attrs.id as string | null
    const resolved = mark.attrs.resolved as boolean
    return [
      'span',
      {
        'data-comment-id': id ?? '',
        'data-comment-resolved': resolved ? 'true' : 'false',
        class: resolved ? 'comment-mark comment-resolved' : 'comment-mark',
      },
      0,
    ]
  },
  addCommands: () => ({
    addComment:
      (...args: unknown[]): Command => {
        const [opts] = args as [
          { body: string; author?: string; id?: string; from?: number; to?: number }?,
        ]
        if (!opts || !opts.body) {
          return () => false
        }
        const id = opts.id ?? newId()
        const author = opts.author ?? 'You'
        return ({ state, dispatch, view }) => {
          const markType = state.schema.marks['comment']
          if (!markType) return false
          let from: number
          let to: number
          if (typeof opts.from === 'number' && typeof opts.to === 'number' && opts.to > opts.from) {
            from = Math.max(0, Math.min(opts.from, state.doc.content.size))
            to = Math.max(0, Math.min(opts.to, state.doc.content.size))
          } else {
            const sel = state.selection
            if (sel.empty) return false
            from = sel.from
            to = sel.to
          }
          if (from >= to) return false
          let tr = state.tr.addMark(from, to, markType.create({ id, resolved: false }))
          const thread: Thread = {
            id,
            body: opts.body,
            author,
            createdAt: Date.now(),
            resolved: false,
            replies: [],
          }
          tr = tr.setMeta(commentsKey, { upsert: thread })
          if (dispatch) dispatch(tr)
          void view
          return true
        }
      },
    resolveComment:
      (...args: unknown[]): Command => {
        const [id] = args as [string]
        return ({ state, dispatch }) => {
          if (!id) return false
          const markType = state.schema.marks['comment']
          if (!markType) return false
          let tr = state.tr
          state.doc.descendants((node, pos) => {
            const mark = node.marks.find((m) => m.type === markType && m.attrs.id === id)
            if (!mark) return
            tr = tr.removeMark(pos, pos + node.nodeSize, mark)
            tr = tr.addMark(pos, pos + node.nodeSize, markType.create({ id, resolved: true }))
          })
          tr = tr.setMeta(commentsKey, { resolve: id })
          if (dispatch) dispatch(tr)
          return true
        }
      },
    reopenComment:
      (...args: unknown[]): Command => {
        const [id] = args as [string]
        return ({ state, dispatch }) => {
          if (!id) return false
          const markType = state.schema.marks['comment']
          if (!markType) return false
          let tr = state.tr
          state.doc.descendants((node, pos) => {
            const mark = node.marks.find((m) => m.type === markType && m.attrs.id === id)
            if (!mark) return
            tr = tr.removeMark(pos, pos + node.nodeSize, mark)
            tr = tr.addMark(pos, pos + node.nodeSize, markType.create({ id, resolved: false }))
          })
          tr = tr.setMeta(commentsKey, { reopen: id })
          if (dispatch) dispatch(tr)
          return true
        }
      },
    removeComment:
      (...args: unknown[]): Command => {
        const [id] = args as [string]
        return ({ state, dispatch }) => {
          if (!id) return false
          const markType = state.schema.marks['comment']
          if (!markType) return false
          let tr = state.tr
          state.doc.descendants((node, pos) => {
            const mark = node.marks.find((m) => m.type === markType && m.attrs.id === id)
            if (!mark) return
            tr = tr.removeMark(pos, pos + node.nodeSize, mark)
          })
          tr = tr.setMeta(commentsKey, { remove: id })
          if (dispatch) dispatch(tr)
          return true
        }
      },
    addCommentReply:
      (...args: unknown[]): Command => {
        const [opts] = args as [{ id: string; body: string; author?: string }?]
        return ({ state, dispatch }) => {
          if (!opts || !opts.id || !opts.body) return false
          const tr = state.tr
            .setMeta(commentsKey, {
              addReply: {
                id: opts.id,
                reply: {
                  id: newId(),
                  body: opts.body,
                  author: opts.author ?? 'You',
                  createdAt: Date.now(),
                },
              },
            })
            .setSelection(state.selection)
          if (dispatch) dispatch(tr)
          return true
        }
      },
  }),
  addProseMirrorPlugins: () => [commentsPlugin()],
})

export { commentsKey, commentsPlugin, getCommentsState, newId } from './store'
export type { Thread, Reply, CommentsState, CommentsMeta } from './store'

export function findCommentRange(
  state: import('prosemirror-state').EditorState,
  id: string,
): { from: number; to: number } | null {
  const markType = state.schema.marks['comment']
  if (!markType) return null
  let from = -1
  let to = -1
  state.doc.descendants((node, pos) => {
    const mark = node.marks.find((m) => m.type === markType && m.attrs.id === id)
    if (!mark) return
    if (from < 0) from = pos
    to = pos + node.nodeSize
  })
  return from < 0 ? null : { from, to }
}
