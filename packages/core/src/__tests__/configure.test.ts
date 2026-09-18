import { describe, expect, it } from 'vitest'
import { Extension } from '../extension/extension'
import { Node } from '../extension/node'

describe('configure', () => {
  it('returns a configured copy and leaves the original untouched', () => {
    const base = Extension.create({ name: 'x', addOptions: () => ({ a: 1, b: 2 }) })
    const copy = base.configure({ a: 5 })
    expect(copy).not.toBe(base)
    expect(copy.options).toEqual({ a: 5, b: 2 })
    expect(base.options).toEqual({ a: 1, b: 2 })
    expect(copy.name).toBe('x')
  })

  it('keeps the subclass', () => {
    const node = Node.create({ name: 'n', addOptions: () => ({ a: 1 }) })
    const copy = node.configure({ a: 2 })
    expect(copy).toBeInstanceOf(Node)
    expect(copy.type).toBe('node')
    expect(copy.config).toBe(node.config)
  })
})
