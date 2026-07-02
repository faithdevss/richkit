export type EmbedProvider = 'youtube' | 'vimeo' | 'video' | 'generic'

export interface NormalizedEmbed {
  src: string
  provider: EmbedProvider
  aspect: string
}

const YOUTUBE_RE =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{6,})/
const VIMEO_RE = /(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/
const VIDEO_FILE_RE = /\.(mp4|webm|ogg)(\?|#|$)/i

export function normalizeEmbedUrl(url: string): NormalizedEmbed | null {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

  const href = parsed.href
  const yt = href.match(YOUTUBE_RE)
  if (yt?.[1]) {
    return {
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}`,
      provider: 'youtube',
      aspect: '16/9',
    }
  }
  const vimeo = href.match(VIMEO_RE)
  if (vimeo?.[1]) {
    return {
      src: `https://player.vimeo.com/video/${vimeo[1]}`,
      provider: 'vimeo',
      aspect: '16/9',
    }
  }
  if (VIDEO_FILE_RE.test(parsed.pathname + parsed.search)) {
    return { src: href, provider: 'video', aspect: '16/9' }
  }
  return { src: href, provider: 'generic', aspect: '16/9' }
}
