import type { Editor } from '@richkit/core'
import type { Attrs } from 'prosemirror-model'
import { useState, type ReactNode } from 'react'
import {
  BlockquoteIcon,
  BoldIcon,
  BulletListIcon,
  ClearFormatIcon,
  CodeBlockIcon,
  CodeIcon,
  FullscreenIcon,
  HorizontalRuleIcon,
  IndentInIcon,
  IndentOutIcon,
  ItalicIcon,
  OrderedListIcon,
  RedoIcon,
  StrikeIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
  UndoIcon,
} from '../icons'
import { AlignMenu } from './AlignMenu'
import { BlockTypeMenu } from './BlockTypeMenu'
import { TextColorMenu, HighlightMenu } from './ColorMenu'
import { FontFamilyMenu, FontSizeMenu } from './FontMenu'
import { ImageMenu } from './ImageMenu'
import { LinkMenu } from './LinkMenu'
import { EmojiMenu, LineHeightMenu, SpecialCharsMenu } from './MiscMenus'
import { TableMenu } from './TableMenu'

export interface ToolbarButtonProps {
  editor: Editor | null
  command: string
  args?: unknown[]
  isActiveName?: string
  isActiveAttrs?: Attrs | null
  label: ReactNode
  title?: string
  className?: string
}

export function ToolbarButton({
  editor,
  command,
  args = [],
  isActiveName,
  isActiveAttrs,
  label,
  title,
  className,
}: ToolbarButtonProps) {
  if (!editor) return null
  const active = isActiveName ? editor.isActive(isActiveName, isActiveAttrs ?? null) : false
  const cls = ['tb-btn', active ? 'is-active' : '', className].filter(Boolean).join(' ')
  return (
    <button
      type="button"
      className={cls}
      title={title}
      aria-pressed={active}
      onMouseDown={(e) => {
        e.preventDefault()
        editor.chain().call(command, ...args).focus().run()
      }}
    >
      {label}
    </button>
  )
}

export interface ToolbarProps {
  editor: Editor | null
  children?: ReactNode
  className?: string
}

export function Toolbar({ editor, children, className }: ToolbarProps) {
  if (!editor) return null
  return (
    <div className={className ?? 'toolbar'} role="toolbar" aria-label="Editor toolbar">
      {children ?? <DefaultToolbar editor={editor} />}
    </div>
  )
}

export interface DefaultToolbarProps {
  editor: Editor
}

export function DefaultToolbar({ editor }: DefaultToolbarProps) {
  return (
    <>
      <div className="tb-row">
        <ToolbarGroup>
          <ToolbarButton editor={editor} command="undo" label={<UndoIcon />} title="Undo (Mod+Z)" />
          <ToolbarButton editor={editor} command="redo" label={<RedoIcon />} title="Redo (Mod+Shift+Z)" />
        </ToolbarGroup>
        <ToolbarGroup>
          <LinkMenu editor={editor} />
          <ImageMenu editor={editor} />
          <TableMenu editor={editor} />
          <ToolbarButton
            editor={editor}
            command="toggleBlockquote"
            isActiveName="blockquote"
            label={<BlockquoteIcon />}
            title="Blockquote"
          />
          <ToolbarButton
            editor={editor}
            command="toggleCodeBlock"
            isActiveName="codeBlock"
            label={<CodeBlockIcon />}
            title="Code block"
          />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton
            editor={editor}
            command="insertHorizontalRule"
            label={<HorizontalRuleIcon />}
            title="Horizontal line"
          />
          <EmojiMenu editor={editor} />
          <SpecialCharsMenu editor={editor} />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton
            editor={editor}
            command="clearFormatting"
            label={<ClearFormatIcon />}
            title="Clear formatting"
          />
          <FullscreenButton />
        </ToolbarGroup>
      </div>
      <div className="tb-row">
        <ToolbarGroup>
          <BlockTypeMenu editor={editor} />
        </ToolbarGroup>
        <ToolbarGroup>
          <FontFamilyMenu editor={editor} />
          <FontSizeMenu editor={editor} />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton editor={editor} command="toggleBold" isActiveName="bold" label={<BoldIcon />} title="Bold (Mod+B)" />
          <ToolbarButton editor={editor} command="toggleItalic" isActiveName="italic" label={<ItalicIcon />} title="Italic (Mod+I)" />
          <ToolbarButton editor={editor} command="toggleUnderline" isActiveName="underline" label={<UnderlineIcon />} title="Underline (Mod+U)" />
          <ToolbarButton editor={editor} command="toggleStrike" isActiveName="strike" label={<StrikeIcon />} title="Strikethrough" />
          <ToolbarButton editor={editor} command="toggleCode" isActiveName="code" label={<CodeIcon />} title="Inline code" />
          <ToolbarButton editor={editor} command="toggleSubscript" isActiveName="subscript" label={<SubscriptIcon />} title="Subscript (Mod+,)" />
          <ToolbarButton editor={editor} command="toggleSuperscript" isActiveName="superscript" label={<SuperscriptIcon />} title="Superscript (Mod+.)" />
        </ToolbarGroup>
        <ToolbarGroup>
          <TextColorMenu editor={editor} />
          <HighlightMenu editor={editor} />
        </ToolbarGroup>
        <ToolbarGroup>
          <AlignMenu editor={editor} />
          <LineHeightMenu editor={editor} />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton editor={editor} command="toggleBulletList" isActiveName="bulletList" label={<BulletListIcon />} title="Bullet list" />
          <ToolbarButton editor={editor} command="toggleOrderedList" isActiveName="orderedList" label={<OrderedListIcon />} title="Numbered list" />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton editor={editor} command="liftListItem" label={<IndentOutIcon />} title="Decrease indent" />
          <ToolbarButton editor={editor} command="sinkListItem" label={<IndentInIcon />} title="Increase indent" />
        </ToolbarGroup>
      </div>
    </>
  )
}

export function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className="tb-group">{children}</div>
}

function FullscreenButton() {
  const [on, setOn] = useState(false)
  return (
    <button
      type="button"
      className={`tb-btn ${on ? 'is-active' : ''}`}
      title="Fullscreen"
      onMouseDown={(e) => {
        e.preventDefault()
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().then(() => setOn(true)).catch(() => {})
        } else {
          document.exitFullscreen().then(() => setOn(false)).catch(() => {})
        }
      }}
    >
      <FullscreenIcon />
    </button>
  )
}
