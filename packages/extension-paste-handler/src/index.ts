import { Extension } from '@richkitjs/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { cleanPastedHTML, type CleanOptions } from './clean'

export interface PasteHandlerOptions extends CleanOptions {
  [key: string]: unknown
}

export const pasteHandlerKey = new PluginKey('pasteHandler')

export function pasteHandlerPlugin(options: PasteHandlerOptions): Plugin {
  let plainNext = false
  return new Plugin({
    key: pasteHandlerKey,
    props: {
      transformPastedHTML(html) {
        return cleanPastedHTML(html, options)
      },
      handleKeyDown(_view, event) {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'v') {
          plainNext = true
          // let the native paste event fire; handlePaste consumes the flag
        }
        return false
      },
      handlePaste(view, event) {
        if (!plainNext) return false
        plainNext = false
        const text = event.clipboardData?.getData('text/plain')
        if (!text) return false
        view.dispatch(view.state.tr.insertText(text).scrollIntoView())
        return true
      },
    },
  })
}

export const PasteHandler = Extension.create<PasteHandlerOptions>({
  name: 'pasteHandler',
  addOptions: () => ({ cleanWord: true, cleanGoogleDocs: true }),
  addProseMirrorPlugins: ({ options }) => [pasteHandlerPlugin(options)],
})

export { cleanPastedHTML } from './clean'
export type { CleanOptions } from './clean'
