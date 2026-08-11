import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'

export default defineConfig({
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
  ],
  server: { port: 5174 },
})
