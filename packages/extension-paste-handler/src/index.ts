import { Extension } from '@richkitjs/core'
import { markdownToHtml } from '@richkitjs/markdown'
import { Plugin, PluginKey } from 'prosemirror-state'
import { cleanPastedHTML, type CleanOptions } from './clean'
import { looksLikeMarkdown, looksLikeUrl, pasteMarkdown, pasteUrl } from './smart'

export interface PasteHandlerOptions extends CleanOptions {
  /**
   * Turns pasted Markdown into blocks and a pasted URL into a link. Plain
   * text that is neither still pastes as plain text.
   */
  smartPaste: boolean
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
        const text = event.clipboardData?.getData('text/plain')
        if (plainNext) {
          plainNext = false
          if (!text) return false
          view.dispatch(view.state.tr.insertText(text).scrollIntoView())
          return true
        }
        if (!options.smartPaste || !text) return false
        // real HTML on the clipboard is richer than anything inferred from
        // the plain-text flavour, so leave those pastes alone
        if (event.clipboardData?.getData('text/html')) return false
        if (view.state.selection.$from.parent.type.spec.code) return false
        if (looksLikeUrl(text)) return pasteUrl(view, text)
        if (looksLikeMarkdown(text))
          return pasteMarkdown(view, markdownToHtml(text, { html: true }))
        return false
      },
    },
  })
}

export const PasteHandler = Extension.create<PasteHandlerOptions>({
  name: 'pasteHandler',
  addOptions: () => ({ cleanWord: true, cleanGoogleDocs: true, smartPaste: true }),
  addProseMirrorPlugins: ({ options }) => [pasteHandlerPlugin(options)],
})

export { cleanPastedHTML } from './clean'
export type { CleanOptions } from './clean'
export { looksLikeMarkdown, looksLikeUrl, pasteMarkdown, pasteUrl } from './smart'
