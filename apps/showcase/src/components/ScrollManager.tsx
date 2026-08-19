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
  const { pathname, hash } = useLocation()

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
  }, [pathname, hash])

  return null
}
