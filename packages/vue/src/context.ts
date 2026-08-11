import type { Editor } from '@richkitjs/core'
import { inject, provide, shallowRef, type InjectionKey, type ShallowRef } from 'vue'

export const editorInjectionKey: InjectionKey<ShallowRef<Editor | null>> = Symbol('richkit')

/** Makes the editor available to descendant components via inject. */
export function provideEditor(editor: ShallowRef<Editor | null>): void {
  provide(editorInjectionKey, editor)
}

/** Reads the editor provided by an ancestor component. */
export function useEditorContext(): ShallowRef<Editor | null> {
  return inject(editorInjectionKey, () => shallowRef<Editor | null>(null), true)
}
