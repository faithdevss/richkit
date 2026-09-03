import { Extension } from '@richkitjs/core'
import { InputRule, textblockTypeInputRule, wrappingInputRule } from 'prosemirror-inputrules'
import type { MarkType, Node as ProseMirrorNode, NodeType } from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'
import { findWrapping } from 'prosemirror-transform'

function markInputRule(regex: RegExp, markType: MarkType): InputRule {
  return new InputRule(regex, (state, match, start, end) => {
    const full = match[1]
    const inner = match[2]
    if (!full || !inner) return null
    const fullStart = match[0].indexOf(full)
    const matchStart = start + fullStart
    const innerStart = matchStart + full.indexOf(inner)
    const innerEnd = innerStart + inner.length
    const tr = state.tr
    tr.delete(innerEnd, end)
    tr.delete(matchStart, innerStart)
    const newEnd = matchStart + inner.length
    tr.addMark(matchStart, newEnd, markType.create())
    tr.removeStoredMark(markType)
    return tr
  })
}

export const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',
  addInputRules: (ctx) => {
    const schema = ctx.editor.schema
    const rules: InputRule[] = []

    const heading = schema.nodes['heading'] as NodeType | undefined
    if (heading) {
      rules.push(
        textblockTypeInputRule(/^(#{1,6})\s$/, heading, (match) => ({
          level: match[1]?.length ?? 1,
        })),
      )
    }
    const blockquote = schema.nodes['blockquote'] as NodeType | undefined
    if (blockquote) rules.push(wrappingInputRule(/^\s*>\s$/, blockquote))
    const bulletList = schema.nodes['bulletList'] as NodeType | undefined
    if (bulletList) rules.push(wrappingInputRule(/^\s*([-+*])\s$/, bulletList))
    const orderedList = schema.nodes['orderedList'] as NodeType | undefined
    if (orderedList) {
      rules.push(
        wrappingInputRule(
          /^(\d+)\.\s$/,
          orderedList,
          (match) => ({ start: parseInt(match[1] ?? '1', 10) }),
          (match, node) =>
            node.childCount + (node.attrs.start as number) === parseInt(match[1] ?? '1', 10),
        ),
      )
    }
    const codeBlock = schema.nodes['codeBlock'] as NodeType | undefined
    if (codeBlock) rules.push(textblockTypeInputRule(/^```$/, codeBlock))

    // `- ` already fired the bullet rule by the time `[ ] ` is typed, so this
    // rule also has to retype an existing list rather than only wrap a
    // paragraph. Both paths end at taskList > taskItem > paragraph.
    const taskList = schema.nodes['taskList'] as NodeType | undefined
    const taskItem = schema.nodes['taskItem'] as NodeType | undefined
    if (taskList && taskItem) {
      rules.push(
        new InputRule(/^\s*\[([ xX])\]\s$/, (state, match, start, end) => {
          const checked = (match[1] ?? ' ').toLowerCase() === 'x'
          const tr = state.tr.delete(start, end)
          const $pos = tr.doc.resolve(start)

          for (let depth = $pos.depth; depth > 0; depth--) {
            const list = $pos.node(depth)
            if (list.type.name !== 'bulletList' && list.type.name !== 'orderedList') continue
            const cursorIndex = $pos.index(depth)
            const items: ProseMirrorNode[] = []
            list.forEach((child, _offset, index) => {
              items.push(
                taskItem.create({ checked: index === cursorIndex && checked }, child.content),
              )
            })
            const from = $pos.before(depth)
            tr.replaceWith(from, from + list.nodeSize, taskList.create(null, items))
            return tr
          }

          const range = $pos.blockRange()
          if (!range) return null
          const wrapping = findWrapping(range, taskList)
          if (!wrapping) return null
          const wrapped = tr.wrap(range, wrapping)
          if (!checked) return wrapped
          const $item = wrapped.doc.resolve(wrapped.mapping.map(start))
          for (let depth = $item.depth; depth > 0; depth--) {
            if ($item.node(depth).type === taskItem) {
              wrapped.setNodeMarkup($item.before(depth), undefined, { checked: true })
              break
            }
          }
          return wrapped
        }),
      )
    }

    const horizontalRule = schema.nodes['horizontalRule'] as NodeType | undefined
    if (horizontalRule) {
      // Typography has already turned the first `--` into an em dash by the
      // time the third character lands, so both spellings have to match. The
      // trailing space is optional: Notion and TipTap both swap the divider in
      // on that third character rather than waiting for one.
      const paragraph = schema.nodes['paragraph'] as NodeType | undefined
      rules.push(
        // replaceRangeWith, not replaceWith: a block node cannot live inside
        // the paragraph's inline content, so the range has to be widened
        new InputRule(/^(?:---|\u2014-|\*\*\*|___)\s?$/, (state, _match, start, end) => {
          const tr = state.tr.replaceRangeWith(start, end, horizontalRule.create())
          // The rule leaves the divider itself selected, so the next keystroke
          // would type over it — park the caret in a textblock after it.
          const after = tr.mapping.map(end, 1)
          const $after = tr.doc.resolve(Math.min(after, tr.doc.content.size))
          if (!$after.nodeAfter?.isTextblock && paragraph) {
            tr.insert($after.pos, paragraph.create())
          }
          const $caret = tr.doc.resolve(Math.min($after.pos, tr.doc.content.size))
          return tr.setSelection(TextSelection.near($caret, 1))
        }),
      )
    }

    const bold = schema.marks['bold'] as MarkType | undefined
    if (bold) rules.push(markInputRule(/(?:^|\s)(\*\*([^*]+)\*\*)$/, bold))
    const italic = schema.marks['italic'] as MarkType | undefined
    if (italic) rules.push(markInputRule(/(?:^|\s)(\*([^*]+)\*)$/, italic))
    const strike = schema.marks['strike'] as MarkType | undefined
    if (strike) rules.push(markInputRule(/(?:^|\s)(~~([^~]+)~~)$/, strike))
    const code = schema.marks['code'] as MarkType | undefined
    if (code) rules.push(markInputRule(/(?:^|\s)(`([^`]+)`)$/, code))

    return rules
  },
})
