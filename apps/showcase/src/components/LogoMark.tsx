export function LogoMark() {
  return (
    <svg
      className="site-logo-mark"
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 19V5h5.6a4.4 4.4 0 0 1 0 8.8H6" stroke="#fff" strokeWidth="2.6" />
      <path d="M11.2 13.8 15.8 19" stroke="#fff" strokeWidth="2.6" />
      {/* the teal tick is the only non-white stroke — it reads as a caret next
          to the R at nav size */}
      <path d="M18.6 9.8v4.6" stroke="#45e0c8" strokeWidth="1.8" />
    </svg>
  )
}
