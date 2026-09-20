import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DocsLayout } from './layouts/DocsLayout'
import { SiteShell } from './layouts/SiteShell'
import { Examples } from './pages/Examples'
import { Home } from './pages/Home'
import { Pricing } from './pages/Pricing'
import { Privacy, Refunds, Terms } from './pages/Legal'
import { Templates } from './pages/Templates'
import { Comparison } from './pages/docs/Comparison'
import { ExampleDoc } from './pages/docs/ExampleDoc'
import { ExtensionsReference } from './pages/docs/ExtensionsReference'
import Introduction from './content/docs/introduction.mdx'
import Installation from './content/docs/installation.mdx'
import CoreConcepts from './content/docs/core-concepts.mdx'
import Styling from './content/docs/styling.mdx'
import AIDocs from './content/docs/ai.mdx'
import Licensing from './content/docs/licensing.mdx'
import EditorApi from './content/docs/api/editor.mdx'
import ReactApi from './content/docs/api/react.mdx'
import EditorsApi from './content/docs/api/editors.mdx'
import CommandsApi from './content/docs/api/commands.mdx'
import StarterKitApi from './content/docs/api/starter-kit.mdx'
import AgentWorkflowsUsecase from './content/docs/usecases/agent-workflows.mdx'
import DocxEditingUsecase from './content/docs/usecases/docx-editing.mdx'
import NotionBlocksUsecase from './content/docs/usecases/notion-blocks.mdx'
import SimpleEditorUsecase from './content/docs/usecases/simple-editor.mdx'
import ClassicEditorUsecase from './content/docs/usecases/classic-editor.mdx'

export function App() {
  return (
    // BASE_URL is whatever vite was built with, so the router resolves paths
    // correctly whether the site is at a domain root or under /<repo>/.
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<SiteShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/docs" element={<DocsLayout />}>
            <Route index element={<Navigate to="introduction" replace />} />
            <Route path="introduction" element={<Introduction />} />
            <Route path="installation" element={<Installation />} />
            <Route path="core-concepts" element={<CoreConcepts />} />
            <Route path="styling" element={<Styling />} />
            <Route path="ai" element={<AIDocs />} />
            <Route path="licensing" element={<Licensing />} />
            <Route path="api/editor" element={<EditorApi />} />
            <Route path="api/react" element={<ReactApi />} />
            <Route path="api/editors" element={<EditorsApi />} />
            <Route path="api/commands" element={<CommandsApi />} />
            <Route path="api/starter-kit" element={<StarterKitApi />} />
            <Route path="extensions" element={<ExtensionsReference />} />
            <Route path="comparison" element={<Comparison />} />
            <Route path="examples/:id" element={<ExampleDoc />} />
            <Route path="usecases/agent-workflows" element={<AgentWorkflowsUsecase />} />
            <Route path="usecases/docx-editing" element={<DocxEditingUsecase />} />
            <Route path="usecases/notion-blocks" element={<NotionBlocksUsecase />} />
            <Route path="usecases/simple-editor" element={<SimpleEditorUsecase />} />
            <Route path="usecases/classic-editor" element={<ClassicEditorUsecase />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
