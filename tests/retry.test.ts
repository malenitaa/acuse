import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  RETRY_BASE_MS,
  RETRY_CAP_MS,
  RETRY_FACTOR,
  backoffMs,
  formatDuration,
  retryScheduleLabels,
} from '../src/lib/retry.ts'

describe('backoffMs', () => {
  it('grows exponentially and stays within the ±15% jitter band', () => {
    for (let attempt = 1; attempt <= 10; attempt++) {
      const raw = Math.min(RETRY_BASE_MS * RETRY_FACTOR ** (attempt - 1), RETRY_CAP_MS)
      for (let sample = 0; sample < 50; sample++) {
        const value = backoffMs(attempt)
        assert.ok(value >= raw * 0.85 - 1, `attempt ${attempt}: ${value} below jitter floor`)
        assert.ok(value <= raw * 1.15 + 1, `attempt ${attempt}: ${value} above jitter ceiling`)
      }
    }
  })

  it('never exceeds the cap by more than the jitter allowance', () => {
    for (let sample = 0; sample < 100; sample++) {
      assert.ok(backoffMs(50) <= RETRY_CAP_MS * 1.15 + 1)
    }
  })

  it('actually jitters: repeated calls are not all identical', () => {
    const values = new Set(Array.from({ length: 25 }, () => backoffMs(3)))
    assert.ok(values.size > 1, 'expected spread across samples')
  })
})

describe('retryScheduleLabels', () => {
  it('renders the documented schedule for the default 8 attempts', () => {
    assert.deepEqual(retryScheduleLabels(8), ['5s', '15s', '45s', '2m 15s', '6m 45s', '20m 15s', '1h'])
  })

  it('returns one label per retry (attempts minus the first try)', () => {
    assert.equal(retryScheduleLabels(4).length, 3)
    assert.deepEqual(retryScheduleLabels(1), [])
  })
})

describe('formatDuration', () => {
  it('picks the natural unit', () => {
    assert.equal(formatDuration(500), '500ms')
    assert.equal(formatDuration(5_000), '5s')
    assert.equal(formatDuration(65_000), '1m 5s')
    assert.equal(formatDuration(120_000), '2m')
    assert.equal(formatDuration(3_600_000), '1h')
    assert.equal(formatDuration(5_400_000), '1h 30m')
  })
})
