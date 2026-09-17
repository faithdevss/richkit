/**
 * Line icons for the site chrome. Every glyph is the same 24×24 stroked grid,
 * so they sit on one optical weight next to the nav and card type.
 */
export const ICON_PATHS = {
  platform: ['M4 6h16', 'M8 12h12', 'M12 18h8'],
  book: [
    'M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    'M8 3v18',
    'M16 3v18',
  ],
  compare: [
    'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M3 10h18',
    'M3 16h18',
    'M9 4v16',
    'M15 4v16',
  ],
  docs: ['M14 4H9a4 4 0 0 0 0 8h5', 'M14 4v16', 'M18 4v16'],
  plus: ['M12 5v14', 'M5 12h14'],
  type: ['M5 7V4.5h14V7', 'M12 4.5v15', 'M9 19.5h6'],
  sparkle: [
    'M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z',
    'M18.5 3.5 19 5.4l1.9.6-1.9.6-.5 1.9-.5-1.9L16 5.9l2-.5z',
  ],
  convert: [
    'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z',
    'M14 3v5h5',
    'M9.5 15 12 17.5 14.5 15',
    'M12 11v6.5',
  ],
  collab: [
    'M17 2.5 20.5 6 17 9.5',
    'M3.5 12V9a3 3 0 0 1 3-3h14',
    'M7 21.5 3.5 18 7 14.5',
    'M20.5 12v3a3 3 0 0 1-3 3h-14',
  ],
  comment: ['M21 12a8 8 0 0 1-8 8H7l-4 3v-9a8 8 0 0 1 8-8h2a8 8 0 0 1 8 6z'],
  price: [
    'M3 3.5h7.6a2 2 0 0 1 1.4.6l8 8a2 2 0 0 1 0 2.8l-5.1 5.1a2 2 0 0 1-2.8 0l-8-8a2 2 0 0 1-.6-1.4z',
    'M7.2 7.2h.01',
  ],
} as const

export type IconName = keyof typeof ICON_PATHS

export function Icon({ name, size = 15 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.92-.88-2.92-2.9 0-.58.2-1.06.54-1.43-.05-.2-.24-.87.05-1.63 0 0 .66-.21 2.16.8a5.6 5.6 0 0 1 2.95 0c1.5-1.01 2.16-.8 2.16-.8.29.76.1 1.43.05 1.63.34.37.54.85.54 1.43 0 2.03-1.15 2.7-2.93 2.9.3.26.56.76.56 1.53l-.01 2.28c0 .21.14.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  )
}
