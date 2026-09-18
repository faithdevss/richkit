import {
  useEffect,
  useImperativeHandle,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
} from 'react'
import type { AnyExtension, Editor } from '@richkitjs/core'
import { Placeholder } from '@richkitjs/extension-placeholder'
import {
  getEditorValue,
  toEditorContent,
  useControlledEditor,
  type EditorValue,
  type ValueFormat,
} from '@richkitjs/react'

export type Theme = 'light' | 'dark'

/**
 * The props every ready-made editor shares — the contract of a form input, so
 * one can be dropped into a `<form>`, a react-hook-form `Controller`
 * (`{...field}` spreads straight on), Formik or plain `useState`.
 */
export interface EditorFieldProps<F extends ValueFormat = 'html'> {
  /** The content, in `format`. Passing it makes the editor controlled. */
  value?: EditorValue<F>
  /** Starting content for an uncontrolled editor, in `format`. */
  defaultValue?: EditorValue<F>
  /** Called with the new content after every edit. An empty document reads as `''`. */
  onChange?: (value: EditorValue<F>) => void
  /** `'html'` (default), `'markdown'`, `'text'` or `'json'`. */
  format?: F
  onFocus?: () => void
  onBlur?: () => void
  /** Renders a hidden input with this name, so a native form submit carries the value. */
  name?: string
  disabled?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  /** Shown while the document is empty. */
  placeholder?: string
  /** Colour scheme. Editors with a theme toggle start from it. */
  theme?: Theme
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-invalid'?: boolean
  /** The live `Editor`, once mounted — for commands the UI does not expose. */
  onEditorReady?: (editor: Editor) => void
}

/** What a ref on a ready-made editor gets. `focus()` is what form libraries call on error. */
export interface EditorHandle<F extends ValueFormat = 'html'> {
  editor: Editor | null
  focus: () => void
  blur: () => void
  getValue: () => EditorValue<F>
  /** Replaces the content without firing `onChange`. */
  setValue: (value: EditorValue<F>) => void
  clear: () => void
}

/**
 * A ready-made editor's public type: generic over `format`, so `value` and
 * `onChange` are strings by default and document JSON with `format="json"`.
 */
export type FieldComponent<P, D extends ValueFormat = 'html'> = <F extends ValueFormat = D>(
  props: P & EditorFieldProps<F> & RefAttributes<EditorHandle<F>>,
) => ReactElement | null

/** Props as a component body sees them: any format. */
export type AnyFieldProps = EditorFieldProps<ValueFormat>
export type AnyHandleRef = ForwardedRef<EditorHandle<ValueFormat>>

/**
 * The editor behind a ready-made component: controlled/uncontrolled value in
 * `format`, focus/blur, disabled/read-only, the ref handle and ARIA state.
 */
export function useEditorField(
  props: AnyFieldProps,
  ref: AnyHandleRef,
  extensions: AnyExtension[],
  options: { deps?: ReadonlyArray<unknown>; defaultFormat?: ValueFormat } = {},
): Editor | null {
  const format = props.format ?? options.defaultFormat ?? 'html'
  const editor = useControlledEditor(
    {
      extensions,
      value: props.value,
      defaultValue: props.defaultValue,
      onChange: props.onChange,
      format,
      disabled: props.disabled,
      readOnly: props.readOnly,
      autofocus: props.autoFocus,
      onFocus: () => props.onFocus?.(),
      onBlur: () => props.onBlur?.(),
    },
    options.deps,
  )

  useImperativeHandle(
    ref,
    () => ({
      editor,
      focus: () => editor?.focus(),
      blur: () => (editor?.view.dom as HTMLElement | undefined)?.blur(),
      getValue: () => (editor ? getEditorValue(editor, format) : (props.value ?? '')),
      setValue: (value) =>
        editor?.setContent(toEditorContent(value, format), { emitUpdate: false }),
      clear: () => editor?.setContent('', { emitUpdate: false }),
    }),
    [editor, format, props.value],
  )

  const { onEditorReady } = props
  useEffect(() => {
    // Once per editor instance; a new callback identity is not a new editor.
    if (editor) onEditorReady?.(editor)
  }, [editor])

  const label = props['aria-label']
  const invalid = props['aria-invalid']
  useEffect(() => {
    const dom = editor?.view.dom
    if (!dom) return
    if (label) dom.setAttribute('aria-label', label)
    else dom.removeAttribute('aria-label')
    if (invalid) dom.setAttribute('aria-invalid', 'true')
    else dom.removeAttribute('aria-invalid')
    dom.setAttribute('aria-disabled', String(Boolean(props.disabled)))
  }, [editor, label, invalid, props.disabled])

  return editor
}

/** The hidden input that carries an editor's value in a native form submit. */
export function FieldValue({
  editor,
  name,
  format = 'html',
}: {
  editor: Editor | null
  name?: string
  format?: ValueFormat
}) {
  if (!name) return null
  const value = editor ? getEditorValue(editor, format) : ''
  return (
    <input
      type="hidden"
      name={name}
      value={typeof value === 'string' ? value : JSON.stringify(value)}
    />
  )
}

/** A theme that follows the `theme` prop but can also be flipped from inside. */
export function useTheme(prop: Theme | undefined, fallback: Theme) {
  const [theme, setTheme] = useState<Theme>(prop ?? fallback)
  useEffect(() => {
    if (prop) setTheme(prop)
  }, [prop])
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return [theme, toggle] as const
}

/**
 * `extensions` with a Placeholder showing `text` — replacing any Placeholder
 * already there (StarterKit carries one), since two would register the plugin
 * twice. Without `text` the list is returned untouched.
 */
export function withPlaceholder(extensions: AnyExtension[], text?: string): AnyExtension[] {
  if (!text) return extensions
  return [
    ...extensions.filter((e) => e.name !== 'placeholder'),
    Placeholder.configure({ placeholder: text }),
  ]
}

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ')
