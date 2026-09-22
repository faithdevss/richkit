import { DOMParser, DOMSerializer, type Node as PMNode, type Schema } from 'prosemirror-model'

export { isSafeUrl, safeUrl } from './url'
export type { SafeUrlOptions } from './url'

export interface HtmlDomOptions {
  /**
   * The document to parse and serialize with. Defaults to the global
   * `document`; pass one from jsdom, linkedom or happy-dom to run on a server.
   */
  document?: Document
}

function resolveDocument(options: HtmlDomOptions): Document {
  const doc = options.document ?? (typeof document === 'undefined' ? undefined : document)
  if (!doc) {
    throw new Error(
      'RichKit needs a DOM to read and write HTML. Outside the browser, pass `document` from jsdom, linkedom or happy-dom.',
    )
  }
  return doc
}

export function htmlToDoc(html: string, schema: Schema, options: HtmlDomOptions = {}): PMNode {
  // Parse inside a document with no browsing context. A <div> owned by the
  // live page starts loading `<img src onerror>` the moment innerHTML is set,
  // which runs the handler before the schema ever sees the markup.
  const dom = resolveDocument(options)
  const inert = dom.implementation?.createHTMLDocument?.('') ?? dom
  const container = inert.createElement('div')
  container.innerHTML = html
  return DOMParser.fromSchema(schema).parse(container)
}

export function docToHtml(doc: PMNode, schema: Schema, options: HtmlDomOptions = {}): string {
  const dom = resolveDocument(options)
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
    document: dom,
  })
  const container = dom.createElement('div')
  container.appendChild(fragment)
  return container.innerHTML
}
