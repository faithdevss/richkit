import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Client-side navigation leaves the scroll position alone, and React Router
 * only handles a hash inside <ScrollRestoration />, which needs a data router.
 * Without this, every footer link -- the footer being the bottom of the page --
 * renders the next page still scrolled to the bottom, and the #pkg-* anchors
 * never reach the row they name.
 */
export function ScrollManager() {
  // `key` changes on every navigation, including one to the page already open
  // -- clicking "Introduction" from the footer of /docs/introduction has to
  // return to the top the way a real anchor would, and pathname alone is
  // unchanged there.
  const { pathname, hash, key } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      let target: HTMLElement | null = null
      try {
        target = document.getElementById(decodeURIComponent(hash.slice(1)))
      } catch {
        // a malformed escape in the hash is not worth throwing over
      }
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash, key])

  return null
}
