import { Plugin, PluginKey, type EditorState } from 'prosemirror-state'

export interface Reply {
  id: string
  body: string
  author: string
  createdAt: number
}

export interface Thread {
  id: string
  body: string
  author: string
  createdAt: number
  resolved: boolean
  replies: Reply[]
}

export interface CommentsState {
  threads: Record<string, Thread>
  version: number
}

export interface CommentsMeta {
  upsert?: Thread
  addReply?: { id: string; reply: Reply }
  resolve?: string
  reopen?: string
  remove?: string
}

export const commentsKey = new PluginKey<CommentsState>('comments')

export function commentsPlugin(): Plugin<CommentsState> {
  return new Plugin<CommentsState>({
    key: commentsKey,
    state: {
      init: () => ({ threads: {}, version: 0 }),
      apply(tr, prev) {
        const meta = tr.getMeta(commentsKey) as CommentsMeta | undefined
        if (!meta) return prev
        const next: CommentsState = {
          threads: { ...prev.threads },
          version: prev.version + 1,
        }
        if (meta.upsert) {
          next.threads[meta.upsert.id] = meta.upsert
        }
        if (meta.addReply) {
          const t = next.threads[meta.addReply.id]
          if (t) next.threads[meta.addReply.id] = { ...t, replies: [...t.replies, meta.addReply.reply] }
        }
        if (meta.resolve) {
          const t = next.threads[meta.resolve]
          if (t) next.threads[meta.resolve] = { ...t, resolved: true }
        }
        if (meta.reopen) {
          const t = next.threads[meta.reopen]
          if (t) next.threads[meta.reopen] = { ...t, resolved: false }
        }
        if (meta.remove) {
          delete next.threads[meta.remove]
        }
        return next
      },
    },
  })
}

export function getCommentsState(state: EditorState): CommentsState | undefined {
  return commentsKey.getState(state)
}

export function newId(): string {
  return 'c_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
