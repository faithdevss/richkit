export interface SafeUrlOptions {
  /**
   * The URL points at a resource the document carries — an image, video,
   * audio or attached file — rather than a page to navigate to. `blob:` and
   * `data:` URLs are then accepted too, as long as the data is not a type a
   * browser would run script from (HTML, XML, SVG, JavaScript).
   */
  media?: boolean
}

const SAFE_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel'])
const ACTIVE_DATA = /^data:[^,;]*(?:html|xml|svg|script)/i
// Browsers drop ASCII whitespace and control characters anywhere in a URL
// before reading its scheme, so `java\tscript:` is still `javascript:`.
// eslint-disable-next-line no-control-regex
const IGNORED = /[\u0000- \u007f-\u009f]/g

/**
 * Whether `url` is safe to put in an `href` or `src`. Relative URLs, fragments
 * and `http(s)`, `mailto` and `tel` pass; `javascript:`, `vbscript:`, `data:`
 * and every other scheme do not, unless `media` lets `data:` and `blob:` in.
 */
export function isSafeUrl(url: unknown, options: SafeUrlOptions = {}): url is string {
  if (typeof url !== 'string') return false
  const compact = url.replace(IGNORED, '')
  if (!compact) return false
  // Anything before the first `/`, `?` or `#` that ends in `:` is a scheme.
  const scheme = /^([^/?#]*?):/.exec(compact)?.[1]?.toLowerCase()
  if (scheme === undefined) return true
  if (SAFE_PROTOCOLS.has(scheme)) return true
  if (!options.media) return false
  if (scheme === 'blob') return true
  return scheme === 'data' && !ACTIVE_DATA.test(compact)
}

/** `url`, trimmed, when it is safe; otherwise `null`. */
export function safeUrl(url: unknown, options?: SafeUrlOptions): string | null {
  return isSafeUrl(url, options) ? url.trim() : null
}
