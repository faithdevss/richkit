import { Extension } from '@richkit/core'
import { InputRule } from 'prosemirror-inputrules'

function literalRule(regex: RegExp, replace: string): InputRule {
  return new InputRule(regex, (state, _match, start, end) =>
    state.tr.insertText(replace, start, end),
  )
}

function fnRule(regex: RegExp, fn: (match: RegExpMatchArray) => string): InputRule {
  return new InputRule(regex, (state, match, start, end) =>
    state.tr.insertText(fn(match), start, end),
  )
}

export const Typography = Extension.create({
  name: 'typography',
  addInputRules: () => [
    literalRule(/--$/, '—'),
    literalRule(/\.\.\.$/, '…'),
    literalRule(/<-$/, '←'),
    literalRule(/->$/, '→'),
    literalRule(/<=$/, '⇐'),
    literalRule(/=>$/, '⇒'),
    literalRule(/\(c\)$/i, '©'),
    literalRule(/\(r\)$/i, '®'),
    literalRule(/\(tm\)$/i, '™'),
    literalRule(/\+-$/, '±'),
    literalRule(/!=$/, '≠'),
    fnRule(/(\s|^)"$/, (m) => `${m[1]}“`),
    fnRule(/(\S)"$/, (m) => `${m[1]}”`),
    fnRule(/(\s|^)'$/, (m) => `${m[1]}‘`),
    fnRule(/(\S)'$/, (m) => `${m[1]}’`),
  ],
})
