import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatNumber, formatPercent, timeAgo, truncate } from '../src/lib/format.ts'

describe('formatNumber', () => {
  it('follows the locale of each language', () => {
    assert.equal(formatNumber(1234, 'es'), '1.234')
    assert.equal(formatNumber(1234, 'en'), '1,234')
  })
})

describe('formatPercent', () => {
  it('renders one decimal and dashes out an empty denominator', () => {
    assert.equal(formatPercent(110, 120), '91.7%')
    assert.equal(formatPercent(0, 0), '—')
  })
})

describe('timeAgo', () => {
  it('speaks both languages', () => {
    const twoMinAgo = new Date(Date.now() - 120_000)
    assert.equal(timeAgo(twoMinAgo, 'es'), 'hace 2 min')
    assert.equal(timeAgo(twoMinAgo, 'en'), '2 min ago')
  })

  it('handles the immediate past and future', () => {
    assert.equal(timeAgo(new Date(Date.now() - 3_000), 'es'), 'recién')
    assert.equal(timeAgo(new Date(Date.now() - 3_000), 'en'), 'just now')
    assert.equal(timeAgo(new Date(Date.now() + 120_000), 'es'), 'en 2 min')
    assert.equal(timeAgo(new Date(Date.now() + 120_000), 'en'), 'in 2 min')
  })

  it('dashes out null', () => {
    assert.equal(timeAgo(null, 'en'), '—')
  })
})

describe('truncate', () => {
  it('cuts long strings with an ellipsis and leaves short ones alone', () => {
    assert.equal(truncate('evt_abcdefghij', 6), 'evt_ab…')
    assert.equal(truncate('short', 10), 'short')
  })
})
