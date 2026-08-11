import { Extension } from '@richkit/core'
import { InputRule, textblockTypeInputRule, wrappingInputRule } from 'prosemirror-inputrules'
import type { MarkType, NodeType } from 'prosemirror-model'

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
