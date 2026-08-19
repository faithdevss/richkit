import { useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'

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

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => <h1 {...props} />,
  h2: (props: ComponentPropsWithoutRef<'h2'>) => <h2 {...props} />,
  h3: (props: ComponentPropsWithoutRef<'h3'>) => <h3 {...props} />,
  code: (props: ComponentPropsWithoutRef<'code'>) => <code {...props} />,
  pre: (props: ComponentPropsWithoutRef<'pre'>) => <pre className="docs-pre" {...props} />,
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="docs-table-scroll">
      <table className="ext-table" {...props} />
    </div>
  ),
  a: (props: ComponentPropsWithoutRef<'a'>) => <a {...props} />,
  Demo,
  Install,
}
