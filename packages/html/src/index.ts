import {
  docToHtml,
  getSchema,
  htmlToDoc,
  type AnyExtension,
  type HtmlDomOptions,
} from '@richkitjs/core'

export { htmlToDoc, docToHtml, isSafeUrl, safeUrl, getSchema } from '@richkitjs/core'
export type { HtmlDomOptions, SafeUrlOptions } from '@richkitjs/core'

type Schema = ReturnType<typeof getSchema>

export interface RenderHtmlOptions extends HtmlDomOptions {
  /**
   * The extensions whose schema decides what survives: the same list the
   * editor that wrote the content was built with. Pass this or `schema`.
   */
  extensions?: readonly AnyExtension[]
  /** A schema you already have, such as `editor.schema`. */
  schema?: Schema
}

/** Content as `getHTML()` or `getJSON()` produced it. */
export type RenderContent = string | Record<string, unknown> | null | undefined

function schemaOf(options: RenderHtmlOptions): Schema {
  if (options.schema) return options.schema
  if (options.extensions) return getSchema(options.extensions)
  throw new Error('renderHtml and sanitizeHtml need `extensions` or `schema`.')
}

/**
 * Turns stored content — an HTML string or a `getJSON()` document — into
 * HTML that is safe to put in the page, without mounting an editor.
 *
 * Everything goes through the schema: tags, attributes and inline styles the
 * extensions do not define are dropped, and `href`/`src` values that could run
 * script (`javascript:`, `vbscript:`, `data:text/html`, …) are removed. The
 * markup that comes out is the same the editor itself renders, so the
 * editor's stylesheet styles it.
 */
export function renderHtml(content: RenderContent, options: RenderHtmlOptions): string {
  if (content == null || content === '') return ''
  const schema = schemaOf(options)
  const doc =
    typeof content === 'string' ? htmlToDoc(content, schema, options) : schema.nodeFromJSON(content)
  return docToHtml(doc, schema, options)
}

/**
 * Cleans an untrusted HTML string down to what the given extensions allow.
 * Use it before storing user-submitted HTML or before rendering HTML that did
 * not come from your own editor. Same rules as {@link renderHtml}.
 *
 * ```ts
 * const clean = sanitizeHtml(untrusted, { extensions: StarterKit })
 * ```
 */
export function sanitizeHtml(html: string, options: RenderHtmlOptions): string {
  return renderHtml(html, options)
}
