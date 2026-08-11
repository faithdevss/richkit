import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DocsLayout } from './layouts/DocsLayout'
import { SiteShell } from './layouts/SiteShell'
import { Home } from './pages/Home'
import { Comparison } from './pages/docs/Comparison'
import { ExtensionsReference } from './pages/docs/ExtensionsReference'
import Introduction from './content/docs/introduction.mdx'
import Installation from './content/docs/installation.mdx'
import CoreConcepts from './content/docs/core-concepts.mdx'
import Styling from './content/docs/styling.mdx'
import AgentWorkflowsUsecase from './content/docs/usecases/agent-workflows.mdx'
import DocxEditingUsecase from './content/docs/usecases/docx-editing.mdx'
import NotionBlocksUsecase from './content/docs/usecases/notion-blocks.mdx'
import SimpleEditorUsecase from './content/docs/usecases/simple-editor.mdx'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<DocsLayout />}>
            <Route index element={<Navigate to="introduction" replace />} />
            <Route path="introduction" element={<Introduction />} />
            <Route path="installation" element={<Installation />} />
            <Route path="core-concepts" element={<CoreConcepts />} />
            <Route path="styling" element={<Styling />} />
            <Route path="extensions" element={<ExtensionsReference />} />
            <Route path="comparison" element={<Comparison />} />
            <Route path="usecases/agent-workflows" element={<AgentWorkflowsUsecase />} />
            <Route path="usecases/docx-editing" element={<DocxEditingUsecase />} />
            <Route path="usecases/notion-blocks" element={<NotionBlocksUsecase />} />
            <Route path="usecases/simple-editor" element={<SimpleEditorUsecase />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
