import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { sign, verifySignature } from '../src/lib/signature.ts'

const SECRET = 'whsec_test_secret'
const BODY = JSON.stringify({ order: 42, total: '19.99' })

describe('sign', () => {
  it('produces the documented header shape', () => {
    const header = sign(SECRET, 1_700_000_000, BODY)
    assert.match(header, /^t=1700000000,v1=[a-f0-9]{64}$/)
  })

  it('is deterministic for the same inputs and differs across inputs', () => {
    assert.equal(sign(SECRET, 1, BODY), sign(SECRET, 1, BODY))
    assert.notEqual(sign(SECRET, 1, BODY), sign(SECRET, 2, BODY))
    assert.notEqual(sign(SECRET, 1, BODY), sign('other', 1, BODY))
  })
})

describe('verifySignature', () => {
  const now = 1_700_000_000

  it('accepts a genuine, recent signature', () => {
    const header = sign(SECRET, now, BODY)
    assert.equal(verifySignature(SECRET, header, BODY, { nowSeconds: now + 30 }), true)
  })

  it('rejects a tampered body', () => {
    const header = sign(SECRET, now, BODY)
    const tampered = BODY.replace('19.99', '0.01')
    assert.equal(verifySignature(SECRET, header, tampered, { nowSeconds: now }), false)
  })

  it('rejects the wrong secret', () => {
    const header = sign(SECRET, now, BODY)
    assert.equal(verifySignature('whsec_wrong', header, BODY, { nowSeconds: now }), false)
  })

  it('rejects replays outside the tolerance window', () => {
    const header = sign(SECRET, now, BODY)
    assert.equal(verifySignature(SECRET, header, BODY, { nowSeconds: now + 301 }), false)
    assert.equal(
      verifySignature(SECRET, header, BODY, { nowSeconds: now + 301, toleranceSeconds: 600 }),
      true,
    )
  })

  it('rejects malformed headers without throwing', () => {
    assert.equal(verifySignature(SECRET, '', BODY), false)
    assert.equal(verifySignature(SECRET, 'garbage', BODY), false)
    assert.equal(verifySignature(SECRET, 't=abc,v1=00', BODY), false)
  })
})
