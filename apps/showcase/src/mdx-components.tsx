import { isValidElement, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Demo({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="usecase-demo-frame">
      {title && <div className="usecase-demo-title">{title}</div>}
      <div className="usecase-demo-stage">{children}</div>
    </div>
  )
}

type PackageManager = 'pnpm' | 'npm' | 'yarn'

const MANAGERS: { id: PackageManager; label: string; cmd: (pkgs: string) => string }[] = [
  { id: 'pnpm', label: 'pnpm', cmd: (pkgs) => `pnpm add ${pkgs}` },
  { id: 'npm', label: 'npm', cmd: (pkgs) => `npm install ${pkgs}` },
  { id: 'yarn', label: 'yarn', cmd: (pkgs) => `yarn add ${pkgs}` },
]

export function Install({ packages }: { packages: string }) {
  const [pm, setPm] = useState<PackageManager>('pnpm')
  const active = MANAGERS.find((m) => m.id === pm)!

  return (
    <div className="pm-install">
      <div className="pm-tabs" role="tablist" aria-label="Package manager">
        {MANAGERS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={pm === m.id}
            className={`pm-tab${pm === m.id ? ' is-active' : ''}`}
            onClick={() => setPm(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <pre className="docs-pre pm-code">
        <code>{active.cmd(packages)}</code>
      </pre>
    </div>
  )
}

/**
 * A ready-to-paste prompt for a coding agent (Claude Code, Cursor, Copilot…).
 * Folded to a few lines by default — the copy button is the point, the text
 * is there to check before pasting.
 */
export function AgentPrompt({
  prompt,
  title = 'Build it with your AI agent',
}: {
  prompt: string
  title?: string
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const text = prompt.trim()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — the prompt is still there to select by hand
    }
  }

  return (
    <div className={`agent-prompt${open ? ' is-open' : ''}`}>
      <div className="agent-prompt-head">
        <div>
          <div className="agent-prompt-title">{title}</div>
          <div className="agent-prompt-sub">
            Paste into Claude Code, Cursor, Copilot or any coding agent — it installs the packages
            and wires this up in your project.
          </div>
        </div>
        <button type="button" className="agent-prompt-copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
      </div>
      <pre className="docs-pre agent-prompt-body">
        <code>{text}</code>
      </pre>
      <button
        type="button"
        className="agent-prompt-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide prompt' : `Show full prompt · ${text.split('\n').length} lines`}
      </button>
    </div>
  )
}

/** Plain text of a heading, including what sits inside inline `code`. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/** Anchor id for a heading, so the on-this-page rail has something to link to. */
function slug(node: ReactNode): string | undefined {
  const id = textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return id || undefined
}

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => <h1 {...props} />,
  h2: ({ id, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 id={id ?? slug(props.children)} {...props} />
  ),
  h3: ({ id, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 id={id ?? slug(props.children)} {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => <code {...props} />,
  pre: (props: ComponentPropsWithoutRef<'pre'>) => <pre className="docs-pre" {...props} />,
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="docs-table-scroll">
      <table className="ext-table" {...props} />
    </div>
  ),
  // Root-relative links in MDX must go through the router, or they skip the
  // Pages base path (/richkit/) and land on the bare github.io origin.
  a: ({ href, ...props }: ComponentPropsWithoutRef<'a'>) =>
    href?.startsWith('/') ? <Link to={href} {...props} /> : <a href={href} {...props} />,
  AgentPrompt,
  Demo,
  Install,
}
