import { MDXProvider } from '@mdx-js/react'
import { NavLink, Outlet } from 'react-router-dom'
import { mdxComponents } from '../mdx-components'

const NAV: { head: string; items: { label: string; to: string }[] }[] = [
  {
    head: 'Guide',
    items: [
      { label: 'Introduction', to: '/docs/introduction' },
      { label: 'Installation', to: '/docs/installation' },
      { label: 'Core concepts', to: '/docs/core-concepts' },
      { label: 'Styling', to: '/docs/styling' },
    ],
  },
  {
    head: 'Reference',
    items: [
      { label: 'Extensions', to: '/docs/extensions' },
      { label: 'Comparison', to: '/docs/comparison' },
    ],
  },
  {
    head: 'Usecases',
    items: [
      { label: 'Agent workflows', to: '/docs/usecases/agent-workflows' },
      { label: 'Docx editing', to: '/docs/usecases/docx-editing' },
      { label: 'Notion-like blocks', to: '/docs/usecases/notion-blocks' },
      { label: 'Simple editor', to: '/docs/usecases/simple-editor' },
    ],
  },
]

export function DocsLayout() {
  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        {NAV.map((group) => (
          <div className="docs-nav-group" key={group.head}>
            <span className="docs-nav-head">{group.head}</span>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `docs-nav-link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>
      <div className="docs-content">
        <MDXProvider components={mdxComponents}>
          <Outlet />
        </MDXProvider>
      </div>
    </div>
  )
}
