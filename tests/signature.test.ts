import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { describe, it } from 'node:test'
import { newSigningSecret, sign, verifySignature } from '../src/lib/signature.ts'

const SECRET = 'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw'
const ID = 'evt_p5jXN8AQM9LWM0D4loKWxJek'
const NOW = 1_674_087_231
const BODY = JSON.stringify({ type: 'contact.created', total: '19.99' })

describe('sign (Standard Webhooks)', () => {
  it('produces the spec header shape: v1,<base64>', () => {
    assert.match(sign(SECRET, ID, NOW, BODY), /^v1,[A-Za-z0-9+/]+={0,2}$/)
  })

  it('signs id.timestamp.body with the base64-decoded whsec_ key', () => {
    // Independent computation of the spec: decode the secret, HMAC the
    // concatenated signed content. Catches regressions in either half.
    const key = Buffer.from(SECRET.slice(6), 'base64')
    const expected = createHmac('sha256', key).update(`${ID}.${NOW}.${BODY}`).digest('base64')
    assert.equal(sign(SECRET, ID, NOW, BODY), `v1,${expected}`)
  })

  it('accepts plain (non-whsec_) secrets as raw UTF-8 keys, for older rows', () => {
    const plain = 'a1b2c3d4e5f6'
    const expected = createHmac('sha256', Buffer.from(plain, 'utf8'))
      .update(`${ID}.${NOW}.${BODY}`)
      .digest('base64')
    assert.equal(sign(plain, ID, NOW, BODY), `v1,${expected}`)
  })

  it('changes with any ingredient', () => {
    const base = sign(SECRET, ID, NOW, BODY)
    assert.notEqual(sign(SECRET, ID, NOW + 1, BODY), base)
    assert.notEqual(sign(SECRET, 'evt_other', NOW, BODY), base)
    assert.notEqual(sign('whsec_b3RoZXJvdGhlcm90aGVyb3RoZXI=', ID, NOW, BODY), base)
  })
})

describe('verifySignature', () => {
  const headers = () => ({ id: ID, timestamp: NOW, signature: sign(SECRET, ID, NOW, BODY) })

  it('accepts a genuine, recent signature', () => {
    assert.equal(verifySignature(SECRET, headers(), BODY, { nowSeconds: NOW + 30 }), true)
  })

  it('accepts a valid v1 among multiple space-delimited signatures', () => {
    const mixed = {
      id: ID,
      timestamp: NOW,
      signature: `v1,Zm9yZ2VkZm9yZ2VkZm9yZ2Vk v1a,aWdub3JlZA== ${sign(SECRET, ID, NOW, BODY)}`,
    }
    assert.equal(verifySignature(SECRET, mixed, BODY, { nowSeconds: NOW }), true)
  })

  it('rejects a tampered body', () => {
    assert.equal(
      verifySignature(SECRET, headers(), BODY.replace('19.99', '0.01'), { nowSeconds: NOW }),
      false,
    )
  })

  it('rejects a swapped id even with the same body', () => {
    const swapped = { ...headers(), id: 'evt_swapped' }
    assert.equal(verifySignature(SECRET, swapped, BODY, { nowSeconds: NOW }), false)
  })

  it('rejects the wrong secret', () => {
    assert.equal(verifySignature('whsec_bm9wZW5vcGVub3Blbm9wZQ==', headers(), BODY, { nowSeconds: NOW }), false)
  })

  it('rejects replays outside the tolerance window, in both directions', () => {
    assert.equal(verifySignature(SECRET, headers(), BODY, { nowSeconds: NOW + 301 }), false)
    assert.equal(verifySignature(SECRET, headers(), BODY, { nowSeconds: NOW - 301 }), false)
    assert.equal(
      verifySignature(SECRET, headers(), BODY, { nowSeconds: NOW + 301, toleranceSeconds: 600 }),
      true,
    )
  })

  it('rejects malformed input without throwing', () => {
    assert.equal(verifySignature(SECRET, { id: ID, timestamp: 'abc', signature: 'v1,x' }, BODY), false)
    assert.equal(
      verifySignature(SECRET, { id: ID, timestamp: NOW, signature: '' }, BODY, { nowSeconds: NOW }),
      false,
    )
  })
})

describe('newSigningSecret', () => {
  it('generates spec-style whsec_ secrets with a 24-byte key', () => {
    const secret = newSigningSecret()
    assert.match(secret, /^whsec_[A-Za-z0-9+/]+={0,2}$/)
    assert.equal(Buffer.from(secret.slice(6), 'base64').length, 24)
    assert.notEqual(newSigningSecret(), secret)
  })
})
