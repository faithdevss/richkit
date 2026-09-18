import type { Editor, EditorOptions } from '@richkitjs/core'
import { useEffect, useRef } from 'react'
import { useEditor } from './useEditor'
import {
  getEditorValue,
  sameValue,
  toEditorContent,
  type EditorValue,
  type ValueFormat,
} from './value'

export interface ControlledEditorOptions<F extends ValueFormat = 'html'> extends Omit<
  EditorOptions,
  'content' | 'editable'
> {
  /** The content, in `format`. Passing it makes the editor controlled. */
  value?: EditorValue<F>
  /** Starting content for an uncontrolled editor, in `format`. */
  defaultValue?: EditorValue<F>
  /** Called with the new content, in `format`, after every edit. */
  onChange?: (value: EditorValue<F>) => void
  /** `'html'` (default), `'markdown'`, `'text'` or `'json'`. */
  format?: F
  /** Read-only and styled as disabled by the component around it. */
  disabled?: boolean
  /** Read-only. */
  readOnly?: boolean
}

/**
 * `useEditor` with the contract of a form input: `value`/`defaultValue` in,
 * `onChange` out, in the format the app stores.
 *
 * A `value` the editor itself just emitted is not written back, so typing never
 * resets the caret; any other `value` — a form reset, a loaded record — replaces
 * the document without firing `onChange` or landing on the undo stack.
 * `disabled`/`readOnly` flip the live editor instead of rebuilding it.
 */
export function useControlledEditor<F extends ValueFormat = 'html'>(
  options: ControlledEditorOptions<F>,
  deps: ReadonlyArray<unknown> = [],
): Editor | null {
  const {
    value,
    defaultValue,
    onChange,
    format = 'html' as F,
    disabled,
    readOnly,
    onUpdate,
    ...rest
  } = options
  const editable = !disabled && !readOnly

  // The value the document currently matches. It seeds each (re)build, so a
  // rebuild from `deps` keeps what the user typed.
  const current = useRef<EditorValue<F> | undefined>(undefined)
  if (current.current === undefined) current.current = value ?? defaultValue

  const editor = useEditor(
    {
      ...rest,
      content: toEditorContent(value ?? current.current, format),
      editable,
      onUpdate: (props) => {
        const next = getEditorValue(props.editor, format)
        current.current = next
        onChange?.(next)
        onUpdate?.(props)
      },
    },
    deps,
  )

  useEffect(() => {
    if (!editor || value === undefined || sameValue(value, current.current)) return
    current.current = value
    editor.setContent(toEditorContent(value, format), { emitUpdate: false, addToHistory: false })
  }, [editor, value, format])

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  return editor
}
