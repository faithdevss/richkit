export type CellState = 'open' | 'paid' | 'partial' | 'none'

export type Cell = {
  state: CellState
  label: string
  note?: string
}

export type ComparisonRow = {
  feature: string
  detail: string
  cells: Cell[]
}

/**
 * Column order is fixed across every row. RichKit is always index 0.
 * Competitor claims are sourced from the vendors' own pricing/licensing
 * pages — see COMPARISON_SOURCES. Keep them checkable, not editorial.
 */
export const COMPARISON_COLUMNS = ['RichKit', 'Tiptap', 'CKEditor 5', 'TinyMCE'] as const

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Editor license',
    detail: 'What the core itself is licensed under.',
    cells: [
      {
        state: 'partial',
        label: 'PolyForm NC / commercial',
        note: 'Free for hobby, learning, research, education and charities. Business use needs the $99 / yr commercial license, after a free 90-day evaluation.',
      },
      { state: 'open', label: 'MIT' },
      {
        state: 'partial',
        label: 'GPL-2.0+ / commercial',
        note: 'Closed-source products need the commercial license.',
      },
      { state: 'partial', label: 'GPL-2.0+ / commercial', note: 'v7 moved from MIT to GPL-2.0+.' },
    ],
  },
  {
    feature: 'DOCX import / export',
    detail: 'Round-trip Word documents without a conversion service.',
    cells: [
      {
        state: 'open',
        label: 'Included',
        note: '@richkitjs/docx — runs in the browser, no server call.',
      },
      {
        state: 'paid',
        label: 'Paid',
        note: 'Conversion is a hosted service, from the Start plan.',
      },
      { state: 'paid', label: 'Premium feature', note: 'Import from Word and export to Word.' },
      { state: 'paid', label: 'Paid add-on', note: 'Export to Word; included only on Enterprise.' },
    ],
  },
  {
    feature: 'Track changes',
    detail: 'Redlining with accept / reject per change.',
    cells: [
      { state: 'open', label: 'Included', note: '@richkitjs/extension-track-changes' },
      {
        state: 'paid',
        label: 'Paid add-on',
        note: 'An add-on on every plan, Start to Enterprise.',
      },
      { state: 'paid', label: 'Premium feature' },
      {
        state: 'paid',
        label: 'Paid add-on',
        note: 'Revision History — add-on on Professional, included on Enterprise.',
      },
    ],
  },
  {
    feature: 'Comments & threads',
    detail: 'Inline threads anchored to a range of text.',
    cells: [
      { state: 'open', label: 'Included', note: '@richkitjs/extension-comments' },
      {
        state: 'paid',
        label: 'Paid',
        note: 'Part of the Documents bundle; needs cloud-stored docs.',
      },
      { state: 'paid', label: 'Premium feature' },
      { state: 'paid', label: 'Professional plan', note: 'Not on Free or Essential.' },
    ],
  },
  {
    feature: 'AI assistance',
    detail: 'Prompt the model to write or rewrite inside the document.',
    cells: [
      {
        state: 'open',
        label: 'Included',
        note: '@richkitjs/extension-ai — bring your own provider; edits arrive as reviewable suggestions.',
      },
      { state: 'paid', label: 'Paid', note: 'Content AI bundle.' },
      { state: 'paid', label: 'Premium feature', note: 'AI Assistant.' },
      {
        state: 'paid',
        label: 'Paid add-on',
        note: 'AI Assistant add-on, $133 – $300 / mo on top of the plan.',
      },
    ],
  },
  {
    feature: 'Real-time collaboration',
    detail: 'Multiple cursors on one document.',
    cells: [
      {
        state: 'none',
        label: 'On the roadmap',
        note: 'Not shipped yet. The core is transaction-based and ready for it.',
      },
      {
        state: 'partial',
        label: 'Free self-host / paid cloud',
        note: 'Hocuspocus is MIT; the managed backend is on a paid plan.',
      },
      { state: 'paid', label: 'Premium feature' },
      {
        state: 'paid',
        label: 'Paid plan',
        note: 'Mentions only on Essential; full collab higher up.',
      },
    ],
  },
  {
    feature: 'Slash commands',
    detail: 'Type / to insert blocks.',
    cells: [
      {
        state: 'open',
        label: 'Included',
        note: '@richkitjs/extension-slash-commands, menu included.',
      },
      {
        state: 'open',
        label: 'MIT component',
        note: 'Slash Dropdown Menu — copied into your repo by the CLI, not an npm package.',
      },
      { state: 'paid', label: 'Premium feature', note: 'Needs a commercial license key.' },
      {
        state: 'partial',
        label: 'Build it yourself',
        note: 'Wire up the open-source Autocompleter API.',
      },
    ],
  },
  {
    feature: 'Find & replace',
    detail: 'Search across the document, replace one or all.',
    cells: [
      { state: 'open', label: 'Included', note: '@richkitjs/extension-find-replace' },
      { state: 'open', label: 'MIT', note: '@tiptap/extension-find-and-replace, headless UI.' },
      { state: 'open', label: 'Included' },
      { state: 'open', label: 'Included', note: 'searchreplace, an open-source plugin.' },
    ],
  },
  {
    feature: 'Bundle size',
    detail:
      'JavaScript shipped for a full editor: tables, images, task lists, code highlighting, markdown. Minified + gzipped, production build, CSS and UI framework excluded.',
    cells: [
      {
        state: 'open',
        label: '184 KB',
        note: '@richkitjs/core + starter-kit, all 40+ extensions. The core alone is 64 KB.',
      },
      {
        state: 'open',
        label: '222 KB',
        note: 'Core + StarterKit (117 KB) plus table, image, task list, lowlight code block, highlight, text align, text style, mention, details and markdown.',
      },
      {
        state: 'partial',
        label: '250 KB',
        note: 'Classic editor with 25 plugins, before the editor stylesheet.',
      },
      {
        state: 'partial',
        label: '455 KB',
        note: 'Core, silver theme, DOM model, icons and 7 plugins, before the skin stylesheets.',
      },
    ],
  },
  {
    feature: 'Runs with no vendor account',
    detail: 'No API key, license key, or hosted backend to sign up for.',
    cells: [
      {
        state: 'open',
        label: 'Yes',
        note: 'npm install and ship. The editor never phones home; only the optional AI extension calls out, to a provider you choose.',
      },
      { state: 'partial', label: 'Editor yes, platform no' },
      {
        state: 'partial',
        label: 'License key required',
        note: "licenseKey: 'GPL' works self-hosted and shows a Powered by CKEditor badge; the CDN build and every premium feature need a real key.",
      },
      {
        state: 'partial',
        label: 'License key required',
        note: "license_key: 'gpl' for self-hosting; without a key the editor disables itself.",
      },
    ],
  },
  {
    feature: 'Cost of the full feature set',
    detail: 'Everything above, for one product, per year. List price, before volume.',
    cells: [
      {
        state: 'open',
        label: '$99 / yr',
        note: '$99 / year flat (about $8.25 a month), billed once. Unlimited developers, unlimited products, every package — no per-seat charge and no usage metering. Free for noncommercial use.',
      },
      {
        state: 'paid',
        label: '$588 – $11,988 / yr',
        note: '$49 – $999 / mo on annual billing ($59 – $1,199 billed monthly), plus $49 / dev / mo past the seats included.',
      },
      {
        state: 'paid',
        label: 'from ~$8,400 / yr',
        note: 'Per month: Professional $319 plus the Collaboration add-on $249 and AI from $133. 20,000 editor loads included, then $30 per 1,000.',
      },
      {
        state: 'paid',
        label: 'from ~$6,168 / yr',
        note: 'Per month: Professional $145 plus Word import $39, Word export $39, Revision History $79, Suggested Edits $79 and AI from $133. 20,000 editor loads included, then $40 per 1,000.',
      },
    ],
  },
]

export const COMPARISON_SOURCES: { label: string; href: string }[] = [
  { label: 'Tiptap pricing', href: 'https://tiptap.dev/pricing' },
  {
    label: 'Tiptap: open-sourcing more of Tiptap',
    href: 'https://tiptap.dev/blog/release-notes/were-open-sourcing-more-of-tiptap',
  },
  {
    label: 'Tiptap find and replace',
    href: 'https://tiptap.dev/docs/editor/extensions/functionality/find-and-replace',
  },
  {
    label: 'Tiptap slash dropdown menu',
    href: 'https://tiptap.dev/docs/ui-components/components/slash-dropdown-menu',
  },
  { label: 'CKEditor pricing', href: 'https://ckeditor.com/pricing/' },
  {
    label: 'CKEditor licensing options',
    href: 'https://ckeditor.com/legal/ckeditor-licensing-options/',
  },
  {
    label: 'CKEditor license key and activation',
    href: 'https://ckeditor.com/docs/ckeditor5/latest/getting-started/licensing/license-key-and-activation.html',
  },
  {
    label: 'CKEditor slash commands',
    href: 'https://ckeditor.com/docs/ckeditor5/latest/features/slash-commands.html',
  },
  { label: 'TinyMCE pricing', href: 'https://www.tiny.cloud/pricing/' },
  {
    label: 'TinyMCE license key',
    href: 'https://www.tiny.cloud/docs/tinymce/latest/license-key/',
  },
]

export const COMPARISON_CHECKED = 'September 2026'
