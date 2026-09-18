import { Children, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { MoreIcon } from '../icons'
import { Popover } from './Popover'

/** Fallback width for the "more" button before it has been rendered once. */
const MORE_FALLBACK_WIDTH = 40

export interface ToolbarOverflowProps {
  children: ReactNode
  className?: string
  moreTitle?: string
}

/**
 * A single toolbar row that keeps to one line: the children that fit stay in
 * place and the rest move into a "more" popover at the end of the row.
 *
 * Measuring happens in two passes. While `measuring` is true every child is
 * rendered so its width can be read, then the row re-renders with the count
 * that actually fits. Both passes run inside `useLayoutEffect`, so the
 * overflowing pass never reaches the screen.
 */
export function ToolbarOverflow({ children, className, moreTitle = 'More' }: ToolbarOverflowProps) {
  const items = Children.toArray(children)
  const count = items.length
  const rowRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)
  const moreWidth = useRef(MORE_FALLBACK_WIDTH)
  const measuredWidth = useRef(-1)
  const [visible, setVisible] = useState(count)
  const [measuring, setMeasuring] = useState(true)
  const [measuredCount, setMeasuredCount] = useState(count)

  // Any change to the children invalidates the widths we cached. Adjusting
  // state during render (rather than in an effect) keeps this from firing on
  // mount, where it would race the first measuring pass and leave the row
  // stuck in `measuring`.
  if (measuredCount !== count) {
    setMeasuredCount(count)
    setMeasuring(true)
  }

  useLayoutEffect(() => {
    if (moreRef.current) moreWidth.current = moreRef.current.offsetWidth || moreWidth.current
    if (!measuring) return
    const row = rowRef.current
    if (!row) return

    const available = row.clientWidth
    measuredWidth.current = available
    const kids = Array.from(row.children) as HTMLElement[]
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0

    let used = 0
    let fits = 0
    for (const kid of kids) {
      const next = used + (fits > 0 ? gap : 0) + kid.offsetWidth
      if (next > available) break
      used = next
      fits += 1
    }
    // Anything hidden needs the "more" button, which needs room of its own.
    if (fits < kids.length) {
      while (fits > 0 && used + gap + moreWidth.current > available) {
        fits -= 1
        used -= (kids[fits]?.offsetWidth ?? 0) + (fits > 0 ? gap : 0)
      }
    }

    setVisible(fits)
    setMeasuring(false)
  }, [measuring, count])

  useEffect(() => {
    const row = rowRef.current
    if (!row || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      // Re-measuring re-renders the row, which fires the observer again; only
      // a real width change is worth a second pass.
      if (rowRef.current && rowRef.current.clientWidth !== measuredWidth.current) setMeasuring(true)
    })
    ro.observe(row)
    return () => ro.disconnect()
  }, [])

  const overflowing = !measuring && visible < count
  const cls = ['tb-row', 'tb-overflow', className].filter(Boolean).join(' ')

  return (
    <div ref={rowRef} className={cls} data-measuring={measuring ? '' : undefined}>
      {measuring ? items : items.slice(0, visible)}
      {overflowing && (
        <Popover
          align="end"
          className="tb-more-panel"
          trigger={
            <button
              ref={moreRef}
              type="button"
              className="tb-btn tb-more-btn"
              title={moreTitle}
              aria-label={moreTitle}
            >
              <MoreIcon />
            </button>
          }
        >
          {() => <div className="tb-more-items">{items.slice(visible)}</div>}
        </Popover>
      )}
    </div>
  )
}
