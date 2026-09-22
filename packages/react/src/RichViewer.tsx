import type { AnyExtension } from '@richkitjs/core'
import { renderHtml, type RenderContent, type RenderHtmlOptions } from '@richkitjs/html'
import { useMemo, type HTMLAttributes } from 'react'

export interface RichViewerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'content' | 'dangerouslySetInnerHTML'
> {
  /** What `getHTML()` or `getJSON()` produced, or any HTML to show safely. */
  content: RenderContent
  /** The extensions the content was written with. Pass this or `schema`. */
  extensions?: readonly AnyExtension[]
  /** A schema you already have, such as `editor.schema`. */
  schema?: RenderHtmlOptions['schema']
  /** A DOM `document` for server rendering (jsdom, linkedom, happy-dom). */
  document?: Document
}

/**
 * Read-only display of editor content. No editor is mounted: the content is
 * run through the schema once, with unsafe tags, attributes and URLs removed,
 * and the resulting markup is rendered as-is. Give it the editor's class
 * (`className="editor"` with `@richkitjs/editors/style.css`) to match styles.
 */
export function RichViewer({
  content,
  extensions,
  schema,
  document,
  className,
  ...rest
}: RichViewerProps) {
  const html = useMemo(
    () => renderHtml(content, { extensions, schema, document }),
    [content, extensions, schema, document],
  )
  return (
    <div
      {...rest}
      className={className ? `richkit-viewer ${className}` : 'richkit-viewer'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
