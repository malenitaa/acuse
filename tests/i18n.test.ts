import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { dict } from '../src/lib/i18n.ts'

function leafPaths(value: unknown, prefix = ''): string[] {
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      leafPaths(child, prefix ? `${prefix}.${key}` : key),
    )
  }
  return [prefix]
}

describe('dict', () => {
  it('English and Spanish expose exactly the same keys', () => {
    assert.deepEqual(leafPaths(dict.en).sort(), leafPaths(dict.es).sort())
  })

  it('interpolating functions produce distinct, non-empty strings per language', () => {
    for (const lang of ['es', 'en'] as const) {
      assert.ok(dict[lang].dashboard.headlineDesc('43').includes('43'))
      assert.ok(dict[lang].dashboard.noteOne('X').includes('X'))
      assert.ok(dict[lang].endpoint.retrySentence(8, '5s · 15s').includes('5s · 15s'))
    }
    assert.notEqual(dict.es.dashboard.headlineDesc('1'), dict.en.dashboard.headlineDesc('1'))
  })

  it('pluralizes attempts in both languages', () => {
    assert.equal(dict.es.dashboard.attempts(1), '1 intento')
    assert.equal(dict.es.dashboard.attempts(2), '2 intentos')
    assert.equal(dict.en.dashboard.attempts(1), '1 attempt')
    assert.equal(dict.en.dashboard.attempts(2), '2 attempts')
    assert.equal(dict.es.dashboard.attempts(0), 'sin intentos')
    assert.equal(dict.en.dashboard.attempts(0), 'no attempts')
  })
})
