import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function BoldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </svg>
  )
}

export function ItalicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="10" y1="5" x2="19" y2="5" />
      <line x1="5" y1="19" x2="14" y2="19" />
      <line x1="14" y1="5" x2="10" y2="19" />
    </svg>
  )
}

export function UnderlineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4v8a5 5 0 0 0 10 0V4" />
      <line x1="5" y1="20" x2="19" y2="20" />
    </svg>
  )
}

export function StrikeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M8 8a4 4 0 0 1 4-3 4 4 0 0 1 4 3" />
      <path d="M8 16a4 4 0 0 0 4 3 4 4 0 0 0 4-3" />
    </svg>
  )
}

export function CodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

export function CodeBlockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <polyline points="10 10 8 12 10 14" />
      <polyline points="14 10 16 12 14 14" />
    </svg>
  )
}

export function ParagraphIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4H9a4 4 0 0 0 0 8h5" />
      <line x1="14" y1="4" x2="14" y2="20" />
      <line x1="18" y1="4" x2="18" y2="20" />
    </svg>
  )
}

export function HeadingIcon(props: SVGProps<SVGSVGElement> & { level?: 1 | 2 | 3 }) {
  const { level, ...rest } = props
  return (
    <svg {...base} {...rest}>
      <line x1="6" y1="5" x2="6" y2="19" />
      <line x1="14" y1="5" x2="14" y2="19" />
      <line x1="6" y1="12" x2="14" y2="12" />
      {level && (
        <text x="16" y="20" fontSize="9" stroke="none" fill="currentColor" fontWeight="700">
          {level}
        </text>
      )}
    </svg>
  )
}

export function BulletListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="5" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function OrderedListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
      <text x="3" y="8" fontSize="7" stroke="none" fill="currentColor" fontWeight="700">
        1.
      </text>
      <text x="3" y="14" fontSize="7" stroke="none" fill="currentColor" fontWeight="700">
        2.
      </text>
      <text x="3" y="20" fontSize="7" stroke="none" fill="currentColor" fontWeight="700">
        3.
      </text>
    </svg>
  )
}

export function BlockquoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 7h4v6H6c0 2 0 4 4 4" />
      <path d="M14 7h4v6h-4c0 2 0 4 4 4" />
    </svg>
  )
}

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <polyline points="3 18 9 13 14 17 21 12" />
    </svg>
  )
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66l-1.5 1.5" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.5-1.5" />
    </svg>
  )
}

export function MediaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m10 9 5 3-5 3z" />
    </svg>
  )
}

export function TableIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="3" y1="16" x2="21" y2="16" />
      <line x1="9" y1="4" x2="9" y2="20" />
      <line x1="15" y1="4" x2="15" y2="20" />
    </svg>
  )
}

export function UndoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="9 14 4 9 9 4" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </svg>
  )
}

export function RedoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="15 14 20 9 15 4" />
      <path d="M20 9H10a6 6 0 0 0 0 12h3" />
    </svg>
  )
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} width={12} height={12} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function AlignLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="14" y2="12" />
      <line x1="4" y1="18" x2="18" y2="18" />
    </svg>
  )
}

export function AlignCenterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="5" y1="18" x2="19" y2="18" />
    </svg>
  )
}

export function AlignRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="6" y1="18" x2="20" y2="18" />
    </svg>
  )
}

export function AlignJustifyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}

export function TextColorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19h14" />
      <path d="M7 16 12 4l5 12" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  )
}

export function HighlightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4l6 6-9 9H5v-6z" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  )
}

export function FontIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="4 7 4 5 20 5 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="5" x2="12" y2="20" />
    </svg>
  )
}

export function HorizontalRuleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  )
}

export function EmojiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
      <path d="M8 14a4 4 0 0 0 8 0" />
    </svg>
  )
}

export function OmegaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19h4v-1c-2-1-3-3-3-6a6 6 0 0 1 12 0c0 3-1 5-3 6v1h4" />
    </svg>
  )
}

export function IndentInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <line x1="11" y1="12" x2="21" y2="12" />
      <polyline points="3 9 6 12 3 15" />
    </svg>
  )
}

export function IndentOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <line x1="11" y1="12" x2="21" y2="12" />
      <polyline points="7 9 4 12 7 15" />
    </svg>
  )
}

export function FullscreenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="4 9 4 4 9 4" />
      <polyline points="15 4 20 4 20 9" />
      <polyline points="20 15 20 20 15 20" />
      <polyline points="9 20 4 20 4 15" />
    </svg>
  )
}

export function ClearFormatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14" />
      <path d="M4 7h7" />
      <path d="M9 4v6" />
      <line x1="15" y1="20" x2="20" y2="20" />
    </svg>
  )
}

export function LineHeightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="3 5 5 3 7 5" />
      <polyline points="3 19 5 21 7 19" />
      <line x1="5" y1="3" x2="5" y2="21" />
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export function FontSizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="2 8 2 5 9 5 9 8" />
      <line x1="5.5" y1="19" x2="5.5" y2="5" />
      <line x1="3" y1="19" x2="8" y2="19" />
      <polyline points="14 11 14 9 22 9 22 11" />
      <line x1="18" y1="19" x2="18" y2="9" />
      <line x1="16" y1="19" x2="20" y2="19" />
    </svg>
  )
}

export function CommentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-9a8 8 0 0 1 8-8h2a8 8 0 0 1 8 6z" />
    </svg>
  )
}

export function SubscriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m4 5 8 10" />
      <path d="m12 5-8 10" />
      <path d="M17 14a2 2 0 0 1 2 2c0 .6-.3 1.1-.8 1.5L15.5 20H19" />
    </svg>
  )
}

export function SuperscriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m4 9 8 10" />
      <path d="m12 9-8 10" />
      <path d="M17 4a2 2 0 0 1 2 2c0 .6-.3 1.1-.8 1.5L15.5 10H19" />
    </svg>
  )
}

export function ListTreeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="12" y1="18" x2="20" y2="18" />
    </svg>
  )
}

export function MoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TaskListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="3 6 4.6 7.6 7.5 4.7" />
      <polyline points="3 15.5 4.6 17.1 7.5 14.2" />
      <line x1="11" y1="6.5" x2="21" y2="6.5" />
      <line x1="11" y1="16" x2="21" y2="16" />
    </svg>
  )
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="9 5 16 12 9 19" />
    </svg>
  )
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z" />
      <path d="M18.5 3.5 19 5.4l1.9.6-1.9.6-.5 1.9-.5-1.9L16 5.9l2-.5z" />
    </svg>
  )
}

export function GripIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="4 6.5 20 6.5" />
      <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
    </svg>
  )
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M6.5 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v.5" />
    </svg>
  )
}

export function DuplicateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="11" height="11" rx="2" />
      <path d="M9 20h9a2 2 0 0 0 2-2V9" />
    </svg>
  )
}

export function TurnIntoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="17 2.5 20.5 6 17 9.5" />
      <path d="M3.5 12V9a3 3 0 0 1 3-3h14" />
      <polyline points="7 21.5 3.5 18 7 14.5" />
      <path d="M20.5 12v3a3 3 0 0 1-3 3h-14" />
    </svg>
  )
}

export function TextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="5 7 5 4.5 19 4.5 19 7" />
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
      <line x1="9" y1="19.5" x2="15" y2="19.5" />
    </svg>
  )
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  )
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  )
}

export function FileImportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <polyline points="14 3 14 8 19 8" />
      <polyline points="9.5 13.5 12 11 14.5 13.5" />
      <line x1="12" y1="11" x2="12" y2="17.5" />
    </svg>
  )
}

export function FileExportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <polyline points="14 3 14 8 19 8" />
      <polyline points="9.5 15 12 17.5 14.5 15" />
      <line x1="12" y1="11" x2="12" y2="17.5" />
    </svg>
  )
}

export function PrintIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <polyline points="7 9 7 3.5 17 3.5 17 9" />
      <path d="M6 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1" />
      <rect x="7" y="14" width="10" height="6.5" rx="1" />
    </svg>
  )
}

export function PageSetupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="16" y2="21" />
    </svg>
  )
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="16" y1="16" x2="20.5" y2="20.5" />
    </svg>
  )
}
