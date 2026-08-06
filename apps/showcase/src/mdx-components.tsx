import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export function Demo({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="usecase-demo-frame">
      {title && <div className="usecase-demo-title">{title}</div>}
      <div className="usecase-demo-stage">{children}</div>
    </div>
  )
}

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => <h1 {...props} />,
  h2: (props: ComponentPropsWithoutRef<'h2'>) => <h2 {...props} />,
  h3: (props: ComponentPropsWithoutRef<'h3'>) => <h3 {...props} />,
  code: (props: ComponentPropsWithoutRef<'code'>) => <code {...props} />,
  pre: (props: ComponentPropsWithoutRef<'pre'>) => <pre className="docs-pre" {...props} />,
  table: (props: ComponentPropsWithoutRef<'table'>) => <table className="ext-table" {...props} />,
  a: (props: ComponentPropsWithoutRef<'a'>) => <a {...props} />,
  Demo,
}
