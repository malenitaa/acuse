import assert from 'node:assert/strict'
import { describe, it, mock } from 'node:test'
import { allowIngest } from '../src/lib/rate-limit.ts'

const LIMIT = 600

describe('allowIngest', () => {
  it('allows exactly the window quota, then refuses', () => {
    const key = `k-${Math.random()}`
    for (let i = 0; i < LIMIT; i++) {
      assert.equal(allowIngest(key), true, `request ${i + 1} should pass`)
    }
    assert.equal(allowIngest(key), false, 'request over quota should be refused')
    assert.equal(allowIngest(key), false)
  })

  it('tracks keys independently', () => {
    const a = `a-${Math.random()}`
    const b = `b-${Math.random()}`
    for (let i = 0; i < LIMIT; i++) allowIngest(a)
    assert.equal(allowIngest(a), false)
    assert.equal(allowIngest(b), true, 'a different key has its own window')
  })

  it('opens a fresh window after a minute', () => {
    mock.timers.enable({ apis: ['Date'], now: 1_000_000 })
    try {
      const key = `w-${Math.random()}`
      for (let i = 0; i < LIMIT; i++) allowIngest(key)
      assert.equal(allowIngest(key), false)

      mock.timers.setTime(1_000_000 + 61_000)
      assert.equal(allowIngest(key), true, 'new window should admit again')
    } finally {
      mock.timers.reset()
    }
  })
})
