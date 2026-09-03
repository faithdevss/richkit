import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

type Heading = { id: string; text: string }

/**
 * The docs pages are MDX, so their headings only exist once React has rendered
 * them — the list is read back out of the DOM after each navigation rather than
 * parsed ahead of time.
 */
export function DocsToc() {
  const { pathname } = useLocation()
  const [items, setItems] = useState<Heading[]>([])
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const found = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('.docs-content h2[id]'),
    ).map((h) => ({ id: h.id, text: h.textContent ?? '' }))
    setItems(found)
    setActive(found[0]?.id ?? '')
  }, [pathname])

  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      // the band sits just under the sticky header, so a heading counts as
      // current from the moment it clears the nav
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )
    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  if (items.length < 2) return <div className="docs-toc" />

  return (
    <aside className="docs-toc">
      <div className="docs-toc-head">On this page</div>
      <div className="docs-toc-list">
        {items.map((h) => (
          <a key={h.id} href={`#${h.id}`} className={h.id === active ? 'is-active' : undefined}>
            {h.text}
          </a>
        ))}
      </div>
    </aside>
  )
}
