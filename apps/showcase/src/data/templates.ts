import type { Template } from '../components/TemplateCard'

/** The UI surfaces around the editor — panels, menus and review chrome. */
export const TEMPLATES: Template[] = [
  {
    variant: 'comments',
    title: 'Comments UI',
    body: 'Anchored threads with a resolve filter, replies and a docked panel. The extension and the UI are both in the repo.',
    pkg: '@richkitjs/extension-comments',
  },
  {
    variant: 'slash',
    title: 'Slash command menu',
    body: 'Type / for a filtered block menu — headings, lists, code fences and an AI action, all driven by the command API.',
    pkg: '@richkitjs/extension-slash-commands',
  },
  {
    variant: 'docx',
    title: 'Docx page template',
    body: 'A paginated paper sheet with rulers, word count and DOCX round-tripping that runs in the browser.',
    pkg: '@richkitjs/docx',
  },
  {
    variant: 'agent',
    title: 'Agent editor',
    body: 'Streamed rewrites that land as reviewable suggestions — accept or reject each one without losing the original.',
    pkg: '@richkitjs/extension-ai',
  },
  {
    variant: 'track',
    title: 'Track changes',
    body: 'Redlining with per-change accept and reject, plus a sidebar that lists every pending edit in the document.',
    pkg: '@richkitjs/extension-track-changes',
  },
  {
    variant: 'find',
    title: 'Find & replace panel',
    body: 'Search the whole document, step through matches and replace one or all — with the active hit highlighted.',
    pkg: '@richkitjs/extension-find-replace',
  },
]
