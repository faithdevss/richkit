/**
 * The RichKit mark: three lines of text, the last one short, drawn white on
 * the gradient tile `.site-logo` supplies. Same geometry as public/favicon.svg
 * (256 grid, 48px inset) with the tile left to CSS.
 */
export function LogoMark() {
  return (
    <svg
      className="site-logo-mark"
      viewBox="48 48 160 160"
      width="17"
      height="17"
      fill="#fff"
      aria-hidden="true"
    >
      <rect x="48" y="83" width="160" height="22" rx="11" />
      <rect x="48" y="117" width="160" height="22" rx="11" fillOpacity="0.75" />
      <rect x="48" y="151" width="86" height="22" rx="11" fillOpacity="0.45" />
    </svg>
  )
}
