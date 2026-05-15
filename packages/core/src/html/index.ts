import { DOMParser, DOMSerializer, type Node as PMNode, type Schema } from 'prosemirror-model'

export function htmlToDoc(html: string, schema: Schema): PMNode {
  const container = document.createElement('div')
  container.innerHTML = html
  return DOMParser.fromSchema(schema).parse(container)
}

export function docToHtml(doc: PMNode, schema: Schema): string {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(doc.content)
  const container = document.createElement('div')
  container.appendChild(fragment)
  return container.innerHTML
}
