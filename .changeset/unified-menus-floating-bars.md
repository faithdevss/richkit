---
'@richkitjs/react': minor
'@richkitjs/editors': minor
'@richkitjs/editors-pro': minor
'@richkitjs/extension-image': minor
---

Unified menu design and new floating components.

- Every dropdown, context menu and suggestion list now shares one frame, row, label and separator style, driven by new `--rk-menu-pad`, `--rk-item-pad`, `--rk-item-gap` and `--rk-text-xs/sm/md/base` custom properties. Toolbar dropdowns (block type, font family, font size, line height, table) are more compact, and the block type menu drops the "Normal text" label for a paragraph icon.
- New `MenuList`, `MenuItem`, `MenuLabel` and `MenuSeparator` components with arrow-key navigation; the toolbar menus are built on them. Font menus' rows are now `menuitemradio`.
- `Popover` opens from the keyboard and moves focus into the panel.
- New `LinkCard` (URL, edit, copy, unlink under the link at the cursor), `TableToolbar` (row / column / cell menus above the table at the cursor) and `WordCount` (live count with selection and soft-limit support). The Classic, Docx and Notion-like editors include the link card and table toolbar.
- The image toolbar gains 25% / 50% / 100% width presets and Delete, and shows the current alignment.
- Fix: centre and right image alignment had no effect in the editor (an inline `display` overrode the stylesheet). A right-aligned image's toolbar now opens leftwards.
