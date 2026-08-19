type Variant = 'simple' | 'notion' | 'docx' | 'agent'

const LINE = 'rgba(255, 255, 255, 0.34)'
const FAINT = 'rgba(255, 255, 255, 0.16)'
const CHROME = 'rgba(255, 255, 255, 0.1)'
const SHEET = 'rgba(255, 255, 255, 0.92)'
const INK = 'rgba(18, 18, 30, 0.34)'
const ACCENT = 'rgba(139, 92, 255, 0.85)'
const TEAL = 'rgba(0, 214, 200, 0.8)'

/**
 * Wireframes, not screenshots — they stay sharp at any density, follow the
 * theme, and can't drift out of date the way a captured image would.
 */
export function TemplatePreview({ variant }: { variant: Variant }) {
  return (
    <svg
      className="template-preview-art"
      viewBox="0 0 260 150"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-hidden="true"
    >
      {variant === 'simple' && <Simple />}
      {variant === 'notion' && <Notion />}
      {variant === 'docx' && <Docx />}
      {variant === 'agent' && <Agent />}
    </svg>
  )
}

/** Toolbar across the top, plain prose underneath. */
function Simple() {
  return (
    <g>
      <rect x="26" y="20" width="208" height="22" rx="7" fill={CHROME} />
      {[35, 49, 63, 81, 95, 113, 127].map((x, i) => (
        <rect key={x} y="27" x={x} width={i === 2 ? 10 : 8} height="8" rx="2.5" fill={LINE} />
      ))}
      <rect x="26" y="56" width="120" height="9" rx="4.5" fill={LINE} />
      <rect x="26" y="76" width="208" height="6" rx="3" fill={FAINT} />
      <rect x="26" y="90" width="190" height="6" rx="3" fill={FAINT} />
      {/* a selected run, mid-sentence */}
      <rect x="26" y="104" width="64" height="6" rx="3" fill={ACCENT} />
      <rect x="94" y="104" width="104" height="6" rx="3" fill={FAINT} />
      <rect x="26" y="118" width="140" height="6" rx="3" fill={FAINT} />
    </g>
  )
}

/** Block handles down the gutter, with the slash menu open. */
function Notion() {
  return (
    <g>
      {[30, 52, 74].map((y) => (
        <g key={y} fill={FAINT}>
          <circle cx="22" cy={y} r="1.6" />
          <circle cx="28" cy={y} r="1.6" />
          <circle cx="22" cy={y + 6} r="1.6" />
          <circle cx="28" cy={y + 6} r="1.6" />
        </g>
      ))}
      <rect x="42" y="26" width="96" height="9" rx="4.5" fill={LINE} />
      <rect x="42" y="48" width="150" height="6" rx="3" fill={FAINT} />
      <rect x="42" y="70" width="128" height="6" rx="3" fill={FAINT} />
      {/* the "/" that opened the menu */}
      <rect x="42" y="92" width="7" height="7" rx="2" fill={ACCENT} />
      <rect x="56" y="93" width="26" height="5" rx="2.5" fill={FAINT} />
      <g>
        <rect x="42" y="106" width="150" height="34" rx="8" fill="rgba(10, 10, 18, 0.82)" />
        <rect x="42" y="106" width="150" height="34" rx="8" fill="none" stroke={CHROME} />
        <rect x="50" y="113" width="6" height="6" rx="2" fill={ACCENT} />
        <rect x="62" y="114" width="58" height="4" rx="2" fill={LINE} />
        <rect x="50" y="127" width="6" height="6" rx="2" fill={FAINT} />
        <rect x="62" y="128" width="44" height="4" rx="2" fill={FAINT} />
      </g>
    </g>
  )
}

/** A paper sheet with real margins, and the next page starting below. */
function Docx() {
  return (
    <g>
      <rect x="66" y="12" width="128" height="118" rx="4" fill={SHEET} />
      <rect x="82" y="28" width="64" height="7" rx="3.5" fill={INK} />
      {[46, 58, 70, 82].map((y) => (
        <rect
          key={y}
          x="82"
          y={y}
          width={y === 82 ? 62 : 96}
          height="4"
          rx="2"
          fill="rgba(18, 18, 30, 0.18)"
        />
      ))}
      <rect x="82" y="98" width="96" height="4" rx="2" fill="rgba(18, 18, 30, 0.18)" />
      <rect x="82" y="110" width="72" height="4" rx="2" fill="rgba(18, 18, 30, 0.18)" />
      {/* page break, then the top edge of page two */}
      <line
        x1="66"
        y1="136"
        x2="194"
        y2="136"
        stroke={TEAL}
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      <rect x="66" y="142" width="128" height="8" rx="4" fill="rgba(255, 255, 255, 0.5)" />
    </g>
  )
}

/** Prose with an AI-drafted block landing as a tracked suggestion. */
function Agent() {
  return (
    <g>
      <rect x="26" y="22" width="118" height="8" rx="4" fill={LINE} />
      <rect x="26" y="42" width="208" height="6" rx="3" fill={FAINT} />
      <rect x="26" y="56" width="182" height="6" rx="3" fill={FAINT} />
      <rect x="20" y="74" width="4" height="46" rx="2" fill={ACCENT} />
      <rect x="34" y="78" width="150" height="6" rx="3" fill="rgba(139, 92, 255, 0.5)" />
      <rect x="34" y="92" width="196" height="6" rx="3" fill="rgba(139, 92, 255, 0.35)" />
      <rect x="34" y="106" width="120" height="6" rx="3" fill="rgba(139, 92, 255, 0.35)" />
      <rect x="26" y="128" width="46" height="12" rx="6" fill="rgba(0, 214, 200, 0.22)" />
      <rect x="80" y="128" width="46" height="12" rx="6" fill={CHROME} />
    </g>
  )
}
