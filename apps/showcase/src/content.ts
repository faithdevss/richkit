export const AGENT_CONTENT = `
<h2>Cover Page</h2>
<p><strong>Project Title:</strong> <em>Enhancing Neural Plasticity Through Multi-Modal Interventions in Aging Adults: A Randomized Controlled Trial</em></p>
<p><strong>Principal Investigator (PI):</strong> [Your Name, PhD]<br />
<strong>Institution:</strong> [Your University or Research Center]<br />
<strong>Funding Mechanism:</strong> NIH R01 Research Project Grant<br />
<strong>Proposed Project Period:</strong> 24 months</p>
<h2>Specific Aims</h2>
<p>Age-related cognitive decline affects a growing share of the population. This proposal tests whether a combined program of aerobic exercise, cognitive training, and dietary intervention produces measurable gains in neural plasticity relative to single-domain controls.</p>
<ul>
  <li><strong>Aim 1.</strong> Quantify changes in hippocampal volume across intervention arms.</li>
  <li><strong>Aim 2.</strong> Measure executive-function improvements using standardized batteries.</li>
  <li><strong>Aim 3.</strong> Identify blood-based biomarkers that predict individual response.</li>
</ul>
<blockquote>Ask the agent to draft the Background &amp; Significance section, then refine it inline.</blockquote>
`

export const DOCX_CONTENT = `
<h1>NON-DISCLOSURE AGREEMENT</h1>
<p>This Non-Disclosure Agreement (“<strong>Agreement</strong>”) is entered into as of <strong>[Effective Date]</strong> (“<strong>Effective Date</strong>”) by and between <strong>[Disclosing Party Name]</strong>, a <strong>[Entity Type]</strong> organized under the laws of <strong>[Jurisdiction]</strong>, with its principal place of business at <strong>[Address]</strong> (“<strong>Disclosing Party</strong>”), and <strong>[Receiving Party Name]</strong>, a <strong>[Entity Type]</strong> organized under the laws of <strong>[Jurisdiction]</strong>, with its principal place of business at <strong>[Address]</strong> (“<strong>Receiving Party</strong>”). Party and Receiving Party may each be referred to herein as a “<strong>Party</strong>” and collectively as the “<strong>Parties</strong>.”</p>
<h2>1. Purpose</h2>
<ol>
  <li>The Parties intend to engage in discussions and evaluations relating to a potential business relationship or transaction (the <strong>“Purpose”</strong>).
    <ol>
      <li>In connection with the Purpose, the Disclosing Party may disclose certain Confidential Information to the Receiving Party.</li>
      <li>This Agreement sets forth the terms and conditions governing the disclosure and use of such Confidential Information.</li>
    </ol>
  </li>
</ol>
<h2>2. Confidential Information</h2>
<p>“Confidential Information” means any non-public information disclosed by the Disclosing Party, whether orally, in writing, or by inspection of tangible objects, that is designated as confidential or that reasonably should be understood to be confidential.</p>
`

export const NOTION_CONTENT = `
<h1>Writing with blocks ✨</h1>
<blockquote><p>💡 <strong>Every paragraph here is a block.</strong><br />Hover one to pick up its handle, drag it anywhere on the page, or open the block menu to turn it into a heading, a list, or a code fence.</p></blockquote>
<p>This template is shaped for the two things people write most: <strong>documentation</strong> and <strong>long-form posts</strong>. Nothing is bolted on — the handles, the slash menu, and the selection toolbar all drive the same command API you get from <code>@richkitjs/core</code>.</p>
<h2>Three ways to reach a command</h2>
<ol>
  <li><p>Type <code>/</code> at the start of an empty line for the command menu.</p></li>
  <li><p>Select text to bring up the formatting bubble — including <em>Improve</em>, which streams an AI rewrite in.</p></li>
  <li><p>Use Markdown as you type: <code>#</code> for a heading, <code>-</code> for a bullet, <code>&gt;</code> for a quote, <code>\`\`\`</code> for code.</p></li>
</ol>
<h2>Reordering</h2>
<p>Pick up the <strong>⠿</strong> handle in the gutter and drag. A blue line shows where the block will land, and the whole move is a single undo step.</p>
<pre><code class="language-ts">import { useEditor, EditorContent, BlockHandle } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'

const editor = useEditor({ extensions: StarterKit, content })
// &lt;BlockHandle editor={editor} /&gt; adds the gutter — that is the whole setup.</code></pre>
<h2>A checklist, because docs always need one</h2>
<ul data-type="task-list">
  <li data-type="task-item" data-checked="true"><p>Drag a block to a new position</p></li>
  <li data-type="task-item" data-checked="false"><p>Turn this line into a heading from the block menu</p></li>
  <li data-type="task-item" data-checked="false"><p>Ask AI to continue writing the section below</p></li>
</ul>
<h2>Make it yours</h2>
<p>Swap the palette, drop the AI section from the slash menu, or add your own block actions — the template is <mark>plain React</mark> over headless extensions, so there is no theme to fight.</p>
<hr />
<p>Prefer a document-shaped surface with page chrome and DOCX round-tripping? The <strong>Docx editor</strong> template is next door.</p>
`

export const SIMPLE_CONTENT = `
<h1>Getting started</h1>
<p>Welcome to the <mark>Simple Editor</mark> template! This template wires up RichKit’s UI components and extensions — every one of them included in a <strong>single $99/year licence</strong>.</p>
<p>Integrate it by following the <a href="#">RichKit UI Components docs</a> or using our CLI tool.</p>
<pre><code>pnpm add @richkitjs/starter-kit</code></pre>
<h2>Features</h2>
<blockquote><p>A fully responsive rich text editor with built-in support for common formatting and layout tools. Type markdown <code>**</code> or use keyboard shortcuts <code>⌘+B</code> for <s>most</s> all common markdown marks. 🪄</p></blockquote>
<ul>
  <li><strong>Responsive design</strong> that works on any screen size.</li>
  <li><strong>Dark and light</strong> themes out of the box.</li>
  <li><strong>Slash commands</strong>, bubble menus, and keyboard shortcuts.</li>
</ul>
`

export const CLASSIC_CONTENT = `
<h1>Q3 Business Review</h1>
<p><span style="color: rgb(107, 114, 128);">Prepared by the Revenue team · 30 September</span></p>
<p>Growth held through the quarter, with <strong>September the strongest month on record</strong>. The chart below tracks recognised revenue; the table breaks the same period out by region.</p>
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNjQwIDIwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJRdWFydGVybHkgcmV2ZW51ZSBiYXJzIj4gPGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjEiIHgyPSIwIiB5Mj0iMCI+IDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzdjNWNmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwZDZjOCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPiA8cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjIwMCIgcng9IjEyIiBmaWxsPSIjMGYxMDIwIi8+IDxnIGZpbGw9InVybCgjZykiPiA8cmVjdCB4PSI1NiIgeT0iMTIwIiB3aWR0aD0iNTQiIGhlaWdodD0iNTIiIHJ4PSI2Ii8+IDxyZWN0IHg9IjE1MCIgeT0iOTIiIHdpZHRoPSI1NCIgaGVpZ2h0PSI4MCIgcng9IjYiLz4gPHJlY3QgeD0iMjQ0IiB5PSI2NiIgd2lkdGg9IjU0IiBoZWlnaHQ9IjEwNiIgcng9IjYiLz4gPHJlY3QgeD0iMzM4IiB5PSI0NCIgd2lkdGg9IjU0IiBoZWlnaHQ9IjEyOCIgcng9IjYiLz4gPHJlY3QgeD0iNDMyIiB5PSI3OCIgd2lkdGg9IjU0IiBoZWlnaHQ9Ijk0IiByeD0iNiIvPiA8cmVjdCB4PSI1MjYiIHk9IjMwIiB3aWR0aD0iNTQiIGhlaWdodD0iMTQyIiByeD0iNiIvPiA8L2c+IDxnIGZpbGw9IiM4YThhYTMiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiPiA8dGV4dCB4PSI3MCIgeT0iMTkwIj5BcHI8L3RleHQ+PHRleHQgeD0iMTY0IiB5PSIxOTAiPk1heTwvdGV4dD48dGV4dCB4PSIyNTYiIHk9IjE5MCI+SnVuPC90ZXh0PiA8dGV4dCB4PSIzNTIiIHk9IjE5MCI+SnVsPC90ZXh0Pjx0ZXh0IHg9IjQ0NCIgeT0iMTkwIj5BdWc8L3RleHQ+PHRleHQgeD0iNTM2IiB5PSIxOTAiPlNlcDwvdGV4dD4gPC9nPiA8dGV4dCB4PSIyNCIgeT0iMzQiIGZpbGw9IiNmMmYyZjciIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTUiIGZvbnQtd2VpZ2h0PSI2MDAiPlJldmVudWUgYnkgbW9udGg8L3RleHQ+IDwvc3ZnPg==" alt="Bar chart of revenue by month, April through September" width="640" />
<h2>Regional breakdown</h2>
<table><tbody>
  <tr>
    <th data-colwidth="150"><p>Region</p></th>
    <th data-colwidth="120"><p>Q2</p></th>
    <th data-colwidth="120"><p>Q3</p></th>
    <th data-colwidth="120"><p>Change</p></th>
  </tr>
  <tr>
    <td data-colwidth="150"><p>North America</p></td>
    <td data-colwidth="120"><p>$1.82M</p></td>
    <td data-colwidth="120"><p>$2.14M</p></td>
    <td data-colwidth="120"><p><mark style="background-color: rgb(187, 247, 208);">+17.6%</mark></p></td>
  </tr>
  <tr>
    <td data-colwidth="150"><p>EMEA</p></td>
    <td data-colwidth="120"><p>$1.05M</p></td>
    <td data-colwidth="120"><p>$1.31M</p></td>
    <td data-colwidth="120"><p><mark style="background-color: rgb(187, 247, 208);">+24.8%</mark></p></td>
  </tr>
  <tr>
    <td data-colwidth="150"><p>APAC</p></td>
    <td data-colwidth="120"><p>$0.74M</p></td>
    <td data-colwidth="120"><p>$0.69M</p></td>
    <td data-colwidth="120"><p><span style="color: rgb(220, 38, 38);">−6.8%</span></p></td>
  </tr>
</tbody></table>
<h2>What moved the number</h2>
<ol style="list-style-type: lower-alpha"><li><p>Enterprise renewals landed two weeks earlier than planned.</p></li><li><p>Self-serve conversion rose after the onboarding rewrite.</p></li><li><p>APAC softened on one delayed public-sector contract.</p></li></ol>
<h2>Next quarter</h2>
<ul style="list-style-type: square"><li><p>Re-run the pricing test in EMEA.</p></li><li><p>Ship usage-based billing to the top 20 accounts.</p></li></ul>
<p style="text-align: center"><em>Select any of the above and try the toolbar — every control edits this document live.</em></p>
`
