import { useEffect } from 'react'
import type { Editor } from '@richkitjs/core'
import { useEditorField as useFieldEditor } from '@richkitjs/editors'
import { requirePro } from '@richkitjs/license'

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

/** Report Pro use once the editor exists. Shows the unlicensed badge if needed. */
export function useRequirePro(editor: Editor | null): void {
  useEffect(() => {
    if (editor) requirePro('editors-pro')
  }, [editor])
}

/** The free field hook, plus the Pro licence check. */
export function useEditorField(...args: Parameters<typeof useFieldEditor>): Editor | null {
  const editor = useFieldEditor(...args)
  useRequirePro(editor)
  return editor
}
