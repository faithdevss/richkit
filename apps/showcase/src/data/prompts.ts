import type { Example } from './examples'

/**
 * Prompts a reader pastes into their coding agent. They have to stand on their
 * own: the docs are a client-rendered SPA, so an agent that fetches a docs URL
 * gets an empty shell — everything it needs goes in the text.
 */

const FORM_INPUT = `Every ready-made editor is a form input: \`value\` / \`defaultValue\`, \`onChange\`, \`format\` ('html' | 'markdown' | 'text' | 'json'), \`name\` (renders a hidden input for native form submits), \`placeholder\`, \`disabled\`, \`readOnly\`, \`theme\` ('light' | 'dark') and \`onEditorReady\` for the live editor. A \`ref\` gets \`focus()\`, \`getValue()\`, \`setValue()\` and \`clear()\`, so it drops straight into react-hook-form, Formik or plain \`useState\`.`

const LICENCE = `This is a RichKit Pro component. It runs without a key on localhost and other dev hosts; a production host needs a domain-bound licence key. Read it from an env var (e.g. \`VITE_RICHKIT_LICENSE_KEY\` or \`NEXT_PUBLIC_RICHKIT_LICENSE_KEY\`) and pass it as the \`licenseKey\` prop, or call \`setLicenseKey(key)\` from \`@richkitjs/license\` once at startup. The key is bound to a domain, not a secret, so a public env var is fine. If there's no key yet, leave the env var empty and tell me.`

const AI_TRANSPORT = `The AI features take a streaming transport. Use \`anthropicComplete({ endpoint: '/api/ai' })\` from \`@richkitjs/ai-anthropic\` (or \`openaiComplete\` from \`@richkitjs/ai-openai\`) and add a server route at that endpoint that holds the API key and pipes the provider's SSE response through unchanged. Never put a provider API key in client code or a public env var.`

const DONE = `When you're done:
- Put it where I asked; if I didn't say, ask me which page or form it belongs in.
- Follow this project's existing conventions (framework, file layout, styling, package manager).
- Run the type-check and fix anything you introduced.`

function componentOf(example: Example): { name: string; pkg: string } {
  const [, pkg, name] = example.sourcePath.match(/^packages\/([^/]+)\/src\/(\w+)\.tsx$/)!
  return { name: name!, pkg: `@richkitjs/${pkg}` }
}

/** Built from the example's own data, so it can't drift from the page it sits on. */
export function examplePrompt(example: Example): string {
  const { name, pkg } = componentOf(example)
  return `Add RichKit's "${example.title}" editor to this project, using the \`${name}\` component from \`${pkg}\`.

What it is: ${example.blurb}

## Install
\`pnpm add ${example.install}\` — use the package manager this project already uses.
Import the styles once, near the app root: \`import '@richkitjs/editors/style.css'\`.

## Use the ready-made component
\`import { ${name} } from '${pkg}'\` — prefer it over copying the source.
${FORM_INPUT}

## Key code
\`\`\`tsx
${example.snippet}
\`\`\`

## How it works
${example.points.map((p) => `- ${p}`).join('\n')}
${example.pro ? `\n## Licence\n${LICENCE}\n` : ''}
## Reference implementation
Only needed if I ask for changes the props can't make. Then copy it into the project as a local component, and import what it takes from \`./field\` from \`@richkitjs/editors\` instead.

\`\`\`tsx
// ${example.sourcePath}
${example.source.trim()}
\`\`\`

${DONE}`
}

export const SIMPLE_EDITOR_PROMPT = `Add a rich text editor to this project with RichKit's \`SimpleEditor\` from \`@richkitjs/editors-pro\`: the full StarterKit (headings, lists, tables, images, links, code blocks) behind a one-row toolbar, with a \`/\` block menu, a bubble menu over selections and find and replace.

## Install
\`pnpm add @richkitjs/react @richkitjs/starter-kit @richkitjs/editors @richkitjs/editors-pro @richkitjs/license\` — use the package manager this project already uses.
Import the styles once, near the app root: \`import '@richkitjs/editors/style.css'\`.

## Code
\`\`\`tsx
import { useState } from 'react'
import { SimpleEditor } from '@richkitjs/editors-pro'

export function PostBody() {
  const [html, setHtml] = useState('<p>Hello</p>')
  return (
    <SimpleEditor
      value={html}
      onChange={setHtml}
      placeholder="Write something…"
      licenseKey={import.meta.env.VITE_RICHKIT_LICENSE_KEY}
    />
  )
}
\`\`\`

${FORM_INPUT}

## Licence
${LICENCE}

${DONE}`

export const CLASSIC_EDITOR_PROMPT = `Add a classic rich text form field to this project with RichKit's \`ClassicEditor\` from \`@richkitjs/editors-pro\`: a word-processor style menubar over a full toolbar, with a label, helper text and an error state, so it sits in a form like any other input.

## Install
\`pnpm add @richkitjs/react @richkitjs/starter-kit @richkitjs/editors @richkitjs/editors-pro @richkitjs/license\` — use the package manager this project already uses.
Import the styles once, near the app root: \`import '@richkitjs/editors/style.css'\`.

## Code
\`\`\`tsx
import { ClassicEditor } from '@richkitjs/editors-pro'

<ClassicEditor
  label="Description"
  helperText="Shown on the product page."
  required
  error={Boolean(errors.description)}
  value={description}
  onChange={setDescription}
  name="description"
  licenseKey={import.meta.env.VITE_RICHKIT_LICENSE_KEY}
/>
\`\`\`

Extra props: \`label\`, \`helperText\`, \`error\`, \`required\`, and \`menus\` to pick which menubar menus show.
${FORM_INPUT}

If the project uses a form library, wire it up the library's way (e.g. react-hook-form's \`Controller\` — \`{...field}\` spreads straight on). An empty document reads as \`''\`, so a plain "required" check works on the value.

## Licence
${LICENCE}

${DONE}`

export const NOTION_BLOCKS_PROMPT = `Add a Notion-style block editor to this project with RichKit's \`NotionEditor\` from \`@richkitjs/editors-pro\`: a drag handle on every block, a \`/\` command menu, a formatting bubble, Markdown shortcuts, \`@\` mentions and optional AI (continue writing, ask AI, improve selection).

## Install
\`pnpm add @richkitjs/react @richkitjs/starter-kit @richkitjs/editors @richkitjs/editors-pro @richkitjs/license\` — use the package manager this project already uses. Add \`@richkitjs/ai-anthropic\` too if we want the AI features.
Import the styles once, near the app root: \`import '@richkitjs/editors/style.css'\`.

## Code
\`\`\`tsx
import { useState } from 'react'
import { NotionEditor } from '@richkitjs/editors-pro'
import { anthropicComplete } from '@richkitjs/ai-anthropic'
import type { MentionCandidate } from '@richkitjs/react'

const ai = anthropicComplete({ endpoint: '/api/ai' })

export function Page({ people }: { people: MentionCandidate[] }) {
  const [html, setHtml] = useState('')
  return (
    <NotionEditor
      value={html}
      onChange={setHtml}
      mentions={people} // { id, label, kind: 'user' | 'page', detail? }
      ai={ai}
      aiAuthor="AI"
      header={<span>Docs / Page title</span>}
      licenseKey={import.meta.env.VITE_RICHKIT_LICENSE_KEY}
    />
  )
}
\`\`\`

Extra props: \`header\` / \`headerActions\` (top bar), \`footer\` (below the status bar), \`mentions\` (without them \`@\` is plain text), \`ai\` and \`aiAuthor\` (without \`ai\` the AI items are hidden).
${FORM_INPUT}

## AI
${AI_TRANSPORT} If I don't want AI, drop the \`ai\` prop and the adapter package.

## Mentions
Load the mention list from this project's own users/pages data, not a hard-coded array.

## Licence
${LICENCE}

${DONE}`

export const DOCX_EDITING_PROMPT = `Add a DOCX document editor to this project with RichKit's \`DocxEditor\` from \`@richkitjs/editors-pro\`: a paginated paper-style page with import from and export to real \`.docx\` files, all in the browser.

## Install
\`pnpm add @richkitjs/react @richkitjs/starter-kit @richkitjs/editors @richkitjs/editors-pro @richkitjs/docx @richkitjs/license\` — use the package manager this project already uses.
Import the styles once, near the app root: \`import '@richkitjs/editors/style.css'\`.

## Code
\`\`\`tsx
import { useState } from 'react'
import { DocxEditor } from '@richkitjs/editors-pro'

export function ContractEditor() {
  const [html, setHtml] = useState('<h1>Agreement</h1><p>…</p>')
  return (
    <DocxEditor
      value={html}
      onChange={setHtml}
      title="Non-disclosure agreement"
      filename="non-disclosure-agreement.docx"
      licenseKey={import.meta.env.VITE_RICHKIT_LICENSE_KEY}
    />
  )
}
\`\`\`

Extra props: \`title\`, \`filename\` (used on export) and \`brand\` (top-left of the chrome).
${FORM_INPUT}

To import or export from your own buttons instead, the same package has the functions:
\`\`\`tsx
import { downloadDocx, importDocxFile } from '@richkitjs/docx'

await downloadDocx(editor, { filename: 'document.docx' })
const warnings = await importDocxFile(editor, file) // replaces the content; returns conversion warnings
\`\`\`
(\`editor\` comes from the \`onEditorReady\` prop. Both take a \`licenseKey\` option too.)

## Licence
${LICENCE}

${DONE}`

export const AGENT_WORKFLOWS_PROMPT = `Add an AI drafting editor to this project with RichKit's \`AgentEditor\` from \`@richkitjs/editors-pro\`: a document editor with an agent dock — the user describes a section, a model writes it, and it streams into the document through the same command API the toolbar uses.

## Install
\`pnpm add @richkitjs/react @richkitjs/starter-kit @richkitjs/editors @richkitjs/editors-pro @richkitjs/ai-anthropic @richkitjs/license\` — use the package manager this project already uses.
Import the styles once, near the app root: \`import '@richkitjs/editors/style.css'\`.

## Code
\`\`\`tsx
import { useState } from 'react'
import { AgentEditor } from '@richkitjs/editors-pro'
import { anthropicComplete } from '@richkitjs/ai-anthropic'

const complete = anthropicComplete({ endpoint: '/api/ai' })

export function DraftingEditor() {
  const [html, setHtml] = useState('')
  return (
    <AgentEditor
      value={html}
      onChange={setHtml}
      complete={complete}
      licenseKey={import.meta.env.VITE_RICHKIT_LICENSE_KEY}
    />
  )
}
\`\`\`

\`complete\` streams Markdown into the document as it arrives. For full control over the model call use \`onDraft(prompt, editor)\` instead, returning the section as HTML — \`complete\` wins if both are set, and with neither the agent dock is hidden. \`agentDraftPrompt(instruction)\` (same package) is the instruction text the component sends, if the server needs it.
${FORM_INPUT}

## Server route
${AI_TRANSPORT}

## Driving the editor from code
Anything an agent does goes through the public API, e.g. from \`onEditorReady\`:
\`\`\`tsx
editor.chain().call('selectAll').call('toggleBold').focus().run()
editor.setContent(editor.getHTML() + draftedHtml)
\`\`\`

## Licence
${LICENCE}

${DONE}`
