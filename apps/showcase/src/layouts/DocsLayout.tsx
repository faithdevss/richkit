import { MDXProvider } from '@mdx-js/react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { DocsToc } from '../components/DocsToc'
import { EXAMPLES } from '../data/examples'
import { Icon, type IconName } from '../components/SiteIcons'
import { mdxComponents } from '../mdx-components'

const NAV: { head: string; icon: IconName; items: { label: string; to: string }[] }[] = [
  {
    head: 'Getting started',
    icon: 'flag',
    items: [
      { label: 'Introduction', to: '/docs/introduction' },
      { label: 'Installation', to: '/docs/installation' },
      { label: 'Core concepts', to: '/docs/core-concepts' },
      { label: 'Styling', to: '/docs/styling' },
      { label: 'AI', to: '/docs/ai' },
      { label: 'Licensing', to: '/docs/licensing' },
    ],
  },
  {
    head: 'Reference',
    icon: 'fileCode',
    items: [
      { label: 'Editor (core)', to: '/docs/api/editor' },
      { label: 'StarterKit & options', to: '/docs/api/starter-kit' },
      { label: 'Ready-made editors', to: '/docs/api/editors' },
      { label: 'React components', to: '/docs/api/react' },
      { label: 'Commands', to: '/docs/api/commands' },
      { label: 'Extensions', to: '/docs/extensions' },
      { label: 'Comparison', to: '/docs/comparison' },
    ],
  },
  {
    head: 'Use cases',
    icon: 'briefcase',
    items: [
      { label: 'Agent workflows', to: '/docs/usecases/agent-workflows' },
      { label: 'Docx editing', to: '/docs/usecases/docx-editing' },
      { label: 'Notion-like blocks', to: '/docs/usecases/notion-blocks' },
      { label: 'Simple editor', to: '/docs/usecases/simple-editor' },
      { label: 'Classic editor', to: '/docs/usecases/classic-editor' },
    ],
  },
  {
    head: 'Examples',
    icon: 'code',
    items: EXAMPLES.map((e) => ({
      label: e.pro ? `${e.title} · Pro` : e.title,
      to: `/docs/examples/${e.id}`,
    })),
  },
]

function useCrumb() {
  const { pathname } = useLocation()
  for (const group of NAV) {
    const hit = group.items.find((i) => i.to === pathname)
    if (hit) return `${group.head} / ${hit.label}`
  }
  return 'Getting started'
}

export function DocsLayout() {
  const crumb = useCrumb()
  const { pathname } = useLocation()
  // the mobile disclosure covers the article, so picking a page closes it
  const [navOpen, setNavOpen] = useState(false)
  useEffect(() => setNavOpen(false), [pathname])

  return (
    <div className="shell">
      <div className="docs-shell">
        <button
          type="button"
          className="docs-nav-btn"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <Icon name="bookOpen" size={15} />
          Browse docs
          <svg
            className="chev"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <aside className={`docs-sidebar${navOpen ? ' is-open' : ''}`}>
          {NAV.map((group) => (
            <div className="docs-nav-group" key={group.head}>
              <div className="docs-nav-head">
                <Icon name={group.icon} size={13} />
                {group.head}
              </div>
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
          <div className="docs-crumbs">
            <span>Docs</span>
            <span>/</span>
            <span className="here">{crumb}</span>
          </div>
          <MDXProvider components={mdxComponents}>
            <Outlet />
          </MDXProvider>
        </div>

        <DocsToc />
      </div>
    </div>
  )
}
