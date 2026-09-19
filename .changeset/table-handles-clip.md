---
'@richkitjs/extension-table': patch
---

Table resize handles are hidden once their spot scrolls out of the table's visible area. They
live in a fixed overlay on `<body>`, so nothing clipped them and they floated over toolbars and
past the editor frame when a table scrolled out of view.
