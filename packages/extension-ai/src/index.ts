import { requirePro } from '@richkitjs/license'
import { Extension, type Command } from '@richkitjs/core'
import { trackKey } from '@richkitjs/extension-track-changes'
import type { EditorState } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import { aiKey, aiPlugin, type AIMeta, type AIRange } from './plugin'

/** What the editor hands the transport for a single run. */
export interface AICompletionRequest {
  /** The user's instruction, or the resolved text of a preset. */
  prompt: string
  /** Text of the selected range. Empty string when inserting at a cursor. */
  selection: string
  /** Plain text of the whole document, for context. */
  documentText: string
}

export interface AICompleteOptions {
  /** Aborted when the run is cancelled. Transports must honour it. */
  signal: AbortSignal
}

/**
 * The transport. Yields text chunks as they arrive.
 *
 * The core never talks to a provider itself — this is the only seam, which is
 * what keeps the extension vendor-neutral. See `@richkitjs/ai-openai` for one.
 */
export type AIComplete = (
  req: AICompletionRequest,
  opts: AICompleteOptions,
) => AsyncIterable<string>

export interface AIOptions extends Record<string, unknown> {
  complete: AIComplete | null
  /** Author recorded on suggestions this extension produces. */
  attributeAs: string
  /**
   * Route output through `@richkitjs/extension-track-changes` so every edit
   * becomes an accept/reject-able suggestion. Silently inert when that
   * extension is not installed in the editor.
   */
  track: boolean
  /**
   * Your RichKit Pro licence key, as an alternative to calling
   * `setLicenseKey` at startup. One registration covers every Pro package.
   */
  licenseKey?: string
}

function newId(): string {
  return `ai_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

function setMeta(view: EditorView, meta: AIMeta): void {
  view.dispatch(view.state.tr.setMeta(aiKey, meta))
}

/** Suggestion ids carried by `markName` marks inside `range`. */
function collectSuggestionIds(
  state: EditorState,
  range: AIRange | null,
  markName: string,
): string[] {
  if (!range || range.to <= range.from) return []
  const type = state.schema.marks[markName]
  if (!type) return []
  const ids = new Set<string>()
  state.doc.nodesBetween(range.from, range.to, (node) => {
    if (!node.isText) return true
    const mark = node.marks.find((m) => m.type === type)
    const id = mark?.attrs.id as string | undefined
    if (id) ids.add(id)
    return false
  })
  return Array.from(ids)
}

interface RunContext {
  view: EditorView
  options: AIOptions
  prompt: string
  range: AIRange
}

async function runCompletion(
  { view, options, prompt, range }: RunContext,
  controller: AbortController,
) {
  const complete = options.complete
  if (!complete) return

  const startState = view.state
  const selection = startState.doc.textBetween(range.from, range.to, ' ')
  const documentText = startState.doc.textBetween(0, startState.doc.content.size, '\n', ' ')

  const tracking = trackKey.getState(startState)
  const useTrack = options.track && tracking !== undefined
  const previousTracking = tracking

  // Turn tracking on as the AI author so appendTransaction marks what we write.
  if (useTrack) {
    view.dispatch(
      view.state.tr.setMeta(trackKey, { setEnabled: true, setAuthor: options.attributeAs }),
    )
  }

  let replaced: AIRange | null = null
  let insertAt = range.to

  // Rewrite mode: keep the original text but mark it deleted, so the user can
  // still reject back to it. Without tracking there is nothing to fall back to,
  // so the text is removed outright.
  if (range.to > range.from) {
    if (useTrack) {
      const delType = view.state.schema.marks['deletion']
      if (delType) {
        const tr = view.state.tr.addMark(
          range.from,
          range.to,
          delType.create({ id: newId(), author: options.attributeAs, createdAt: Date.now() }),
        )
        tr.setMeta(trackKey, { skip: true })
        view.dispatch(tr)
        replaced = { from: range.from, to: range.to }
        insertAt = range.to
      }
    } else {
      view.dispatch(view.state.tr.delete(range.from, range.to))
      insertAt = range.from
    }
  }

  const written: AIRange = { from: insertAt, to: insertAt }
  setMeta(view, {
    status: 'streaming',
    prompt,
    error: null,
    range: written,
    replaced,
  })

  try {
    for await (const chunk of complete(
      { prompt, selection, documentText },
      { signal: controller.signal },
    )) {
      if (controller.signal.aborted) break
      if (!chunk) continue
      const at = aiKey.getState(view.state)?.range?.to ?? insertAt
      const tr = view.state.tr.insertText(chunk, at)
      view.dispatch(tr)
    }
    if (controller.signal.aborted) return
    setMeta(view, { status: 'idle', error: null })
  } catch (err) {
    if (controller.signal.aborted) return
    setMeta(view, {
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    })
  } finally {
    // Never leave global tracking flipped on behind the user's back.
    if (useTrack && previousTracking) {
      view.dispatch(
        view.state.tr.setMeta(trackKey, {
          setEnabled: previousTracking.enabled,
          setAuthor: previousTracking.author,
        }),
      )
    }
  }
}

export const AI = Extension.create<AIOptions>({
  name: 'ai',
  addOptions: () => ({
    complete: null,
    attributeAs: 'AI Assistant',
    track: true,
  }),
  addProseMirrorPlugins: (ctx) => {
    requirePro('ai', ctx.options.licenseKey)
    return [aiPlugin()]
  },
  addCommands: (ctx) => {
    let run: AbortController | null = null

    const cancel = (view: EditorView | null): boolean => {
      if (!run) return false
      run.abort()
      run = null
      if (view) setMeta(view, { status: 'idle' })
      return true
    }

    const start = (view: EditorView, prompt: string, range: AIRange): boolean => {
      if (!ctx.options.complete) return false
      run?.abort()
      const controller = new AbortController()
      run = controller
      void runCompletion({ view, options: ctx.options, prompt, range }, controller).finally(() => {
        if (run === controller) run = null
      })
      return true
    }

    return {
      aiPrompt:
        (...args: unknown[]): Command =>
        ({ state, view }) => {
          const [opts] = args as [{ prompt: string; range?: AIRange }?]
          if (!opts?.prompt || !view) return false
          if (aiKey.getState(state)?.status === 'streaming') return false
          const sel = state.selection
          const range = opts.range ?? { from: sel.from, to: sel.to }
          return start(view, opts.prompt, range)
        },

      aiCancel:
        (): Command =>
        ({ view }) =>
          cancel(view),

      aiRetry:
        (): Command =>
        ({ state, view }) => {
          if (!view) return false
          const s = aiKey.getState(state)
          if (!s?.prompt) return false
          // Drop the previous attempt before trying again.
          const range = s.range
          if (range && range.to > range.from) {
            view.dispatch(view.state.tr.delete(range.from, range.to))
          }
          const target = s.replaced ?? {
            from: view.state.selection.from,
            to: view.state.selection.to,
          }
          return start(view, s.prompt, target)
        },

      /** Keep the AI text: drop replaced text, strip the suggestion marks. */
      aiAccept:
        (): Command =>
        ({ state, view }) => {
          if (!view) return false
          const s = aiKey.getState(state)
          if (!s) return false
          const ids = [
            ...collectSuggestionIds(state, s.replaced, 'deletion'),
            ...collectSuggestionIds(state, s.range, 'insertion'),
          ]
          for (const id of ids) ctx.editor.commands.acceptSuggestion?.(id)
          setMeta(view, { status: 'idle', range: null, replaced: null, error: null })
          return true
        },

      /** Discard the AI text and restore whatever it replaced. */
      aiReject:
        (): Command =>
        ({ state, view }) => {
          if (!view) return false
          const s = aiKey.getState(state)
          if (!s) return false
          const ids = [
            ...collectSuggestionIds(state, s.replaced, 'deletion'),
            ...collectSuggestionIds(state, s.range, 'insertion'),
          ]
          if (ids.length > 0) {
            for (const id of ids) ctx.editor.commands.rejectSuggestion?.(id)
          } else if (s.range && s.range.to > s.range.from) {
            // Untracked run — nothing to reject through, so remove the text.
            view.dispatch(view.state.tr.delete(s.range.from, s.range.to))
          }
          setMeta(view, { status: 'idle', range: null, replaced: null, error: null })
          return true
        },
    }
  },
})

export { aiKey, aiPlugin, getAIState, isAIStreaming } from './plugin'
export type { AIState, AIStatus, AIRange, AIMeta } from './plugin'
