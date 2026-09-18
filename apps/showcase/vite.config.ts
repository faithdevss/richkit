import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// GitHub Pages serves a project site from /<repo>/, so the base has to be set
// at build time. The Pages workflow derives it from GITHUB_REPOSITORY, which
// keeps this working if the repo is ever renamed. Unset (Vercel, dev) means
// the site is at the domain root.
const base = process.env.VITE_BASE ?? '/'

/**
 * Pages has no rewrite rules, so a hard load of /docs/api/editor would 404.
 * It does serve 404.html for unmatched paths, and this is a client-routed SPA,
 * so handing back the same document lets the router resolve the URL itself.
 */
function spaFallback() {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

export default defineConfig({
  base,
  // remark-gfm enables pipe tables in .mdx; providerImportSource is what makes
  // the MDXProvider in DocsLayout actually apply mdxComponents — without it the
  // component map is inert and markdown-generated elements render unstyled.
  plugins: [
    mdx({
      jsxImportSource: 'react',
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkGfm],
    }),
    react(),
    spaFallback(),
  ],
  server: { port: 5174 },
})
