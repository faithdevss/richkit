import { useEffect } from 'react'
import type { Editor } from '@richkitjs/core'
import { useEditorField as useFieldEditor, type AnyFieldProps } from '@richkitjs/editors'
import { requirePro } from '@richkitjs/license'
import type { FieldComponent, ValueFormat } from '@richkitjs/editors'

export {
  cx,
  FieldValue,
  useTheme,
  withPlaceholder,
  type AnyFieldProps,
  type AnyHandleRef,
  type EditorFieldProps,
  type EditorHandle,
  type FieldComponent,
  type Theme,
} from '@richkitjs/editors'

/** What every Pro editor accepts on top of the shared field props. */
export interface ProFieldProps {
  /**
   * Your RichKit Pro licence key, as an alternative to calling
   * `setLicenseKey` at startup. The key is global to the page, so passing it
   * on one editor licenses every Pro package; with several editors mounted,
   * the last non-empty key wins.
   */
  licenseKey?: string
}

/** Props as a Pro editor's body sees them: any format, plus `licenseKey`. */
export type AnyProFieldProps = AnyFieldProps & ProFieldProps

/** A Pro editor's public type: the free field contract plus `licenseKey`. */
export type ProFieldComponent<P, D extends ValueFormat = 'html'> = FieldComponent<
  P & ProFieldProps,
  D
>

/**
 * Report Pro use once the editor exists, registering a `licenseKey` prop on
 * the way. Shows the unlicensed badge if needed.
 */
export function useRequirePro(editor: Editor | null, licenseKey?: string): void {
  useEffect(() => {
    if (editor) requirePro('editors-pro', licenseKey)
  }, [editor, licenseKey])
}

/** The free field hook, plus the Pro licence check. */
export function useEditorField(
  props: AnyProFieldProps,
  ...rest: Rest<Parameters<typeof useFieldEditor>>
): Editor | null {
  const editor = useFieldEditor(props, ...rest)
  useRequirePro(editor, props.licenseKey)
  return editor
}

type Rest<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never
