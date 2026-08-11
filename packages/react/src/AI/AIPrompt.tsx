import type { Editor } from '@richkitjs/core'
import { getAIState, type AIState } from '@richkitjs/extension-ai'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface AIPreset {
  id: string
  label: string
  /** Sent verbatim as the instruction. */
  prompt: string
}

export const defaultAIPresets: AIPreset[] = [
  { id: 'improve', label: 'Improve writing', prompt: 'Improve the writing. Keep the meaning.' },
  { id: 'shorten', label: 'Make shorter', prompt: 'Make this shorter without losing meaning.' },
  { id: 'expand', label: 'Expand', prompt: 'Expand this with more detail.' },
  { id: 'grammar', label: 'Fix grammar', prompt: 'Fix spelling and grammar. Change nothing else.' },
  { id: 'tone', label: 'More professional', prompt: 'Rewrite in a more professional tone.' },
  { id: 'translate', label: 'Translate to English', prompt: 'Translate this to English.' },
]

export interface AIPromptProps {
  editor: Editor | null
  presets?: AIPreset[]
  placeholder?: string
  className?: string
  /** Controlled mode — omit both to let the component manage itself via Mod+K. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const IDLE: AIState = { status: 'idle', range: null, replaced: null, prompt: '', error: null }

export function AIPrompt({
  editor,
  presets = defaultAIPresets,
  placeholder = 'Ask about this document or request a change…',
  className,
  open: openProp,
  onOpenChange,
}: AIPromptProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = openProp ?? uncontrolledOpen
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange],
  )

  const [value, setValue] = useState('')
  const [ai, setAi] = useState<AIState>(IDLE)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mirror plugin state; 'transaction' also fires for meta-only dispatches.
  useEffect(() => {
    if (!editor) return
    const sync = () => setAi(getAIState(editor.state) ?? IDLE)
    const off = editor.on('transaction', sync)
    sync()
    return off
  }, [editor])

  // Mod+K opens the prompt (uncontrolled mode only).
  useEffect(() => {
    if (!editor || openProp !== undefined) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    const dom = editor.view.dom
    dom.addEventListener('keydown', onKey)
    return () => dom.removeEventListener('keydown', onKey)
  }, [editor, openProp, setOpen])

  // The panel renders hidden until it has been positioned, and a
  // `visibility: hidden` element cannot take focus — so focusing here would
  // silently no-op. The positioning effect below focuses once it is visible.
  const pendingFocus = useRef(false)
  useEffect(() => {
    if (open) pendingFocus.current = true
  }, [open])

  // Anchor to the selection head, same approach as SlashMenu.
  useEffect(() => {
    if (!editor || !open || !ref.current) return
    const el = ref.current
    const coords = editor.view.coordsAtPos(editor.state.selection.to)
    const virtual = {
      getBoundingClientRect: () => ({
        x: coords.left,
        y: coords.top,
        width: 0,
        height: coords.bottom - coords.top,
        top: coords.top,
        left: coords.left,
        right: coords.left,
        bottom: coords.bottom,
        toJSON() {
          return this
        },
      }),
    }
    void computePosition(virtual, el, {
      placement: 'bottom-start',
      middleware: [offset(6), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.visibility = 'visible'
      if (pendingFocus.current) {
        pendingFocus.current = false
        inputRef.current?.focus()
      }
    })
  }, [editor, open, ai.status])

  if (!editor || !open) return null

  const streaming = ai.status === 'streaming'
  const hasResult = !streaming && ai.range !== null && ai.range.to > ai.range.from

  const submit = (prompt: string) => {
    if (!prompt.trim() || streaming) return
    editor.commands.aiPrompt?.({ prompt })
    setValue('')
  }

  const close = () => {
    if (streaming) editor.commands.aiCancel?.()
    setOpen(false)
  }

  const resolve = (command: 'aiAccept' | 'aiReject') => {
    editor.commands[command]?.()
    setOpen(false)
    editor.view.focus()
  }

  return (
    <div
      ref={ref}
      className={className ?? 'ai-prompt'}
      role="dialog"
      aria-label="AI assistant"
      style={{ position: 'absolute', visibility: 'hidden', zIndex: 60 }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          close()
        }
      }}
    >
      <div className="ai-prompt-row">
        <input
          ref={inputRef}
          className="ai-prompt-input"
          value={value}
          placeholder={placeholder}
          disabled={streaming}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit(value)
            }
          }}
        />
        {streaming ? (
          <button
            type="button"
            className="ai-prompt-stop"
            onClick={() => editor.commands.aiCancel?.()}
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            className="ai-prompt-send"
            aria-label="Send"
            disabled={!value.trim()}
            onClick={() => submit(value)}
          >
            ↑
          </button>
        )}
      </div>

      {ai.error && (
        <p className="ai-prompt-error" role="alert">
          {ai.error}
        </p>
      )}

      {hasResult ? (
        <div className="ai-prompt-actions">
          <button type="button" className="ai-prompt-accept" onClick={() => resolve('aiAccept')}>
            Accept
          </button>
          <button type="button" className="ai-prompt-reject" onClick={() => resolve('aiReject')}>
            Reject
          </button>
          <button
            type="button"
            className="ai-prompt-retry"
            onClick={() => editor.commands.aiRetry?.()}
          >
            Retry
          </button>
        </div>
      ) : (
        !streaming && (
          <div className="ai-prompt-presets">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="ai-prompt-preset"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => submit(preset.prompt)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  )
}
