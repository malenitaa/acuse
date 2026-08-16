import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { checkDestination, isPrivateHost } from '../src/lib/destination-guard.ts'

afterEach(() => {
  delete process.env.BLOCK_PRIVATE_DESTINATIONS
})

describe('checkDestination', () => {
  it('accepts plain http(s) URLs', () => {
    assert.equal(checkDestination('https://api.example.com/hooks').ok, true)
    assert.equal(checkDestination('http://internal-erp:8080/webhook').ok, true)
  })

  it('rejects non-http schemes and garbage', () => {
    assert.equal(checkDestination('ftp://example.com/x').ok, false)
    assert.equal(checkDestination('file:///etc/passwd').ok, false)
    assert.equal(checkDestination('javascript:alert(1)').ok, false)
    assert.equal(checkDestination('not a url at all').ok, false)
  })

  it('allows private hosts by default (self-hosted use case)', () => {
    assert.equal(checkDestination('http://localhost:3000/sink').ok, true)
    assert.equal(checkDestination('http://192.168.1.50/webhook').ok, true)
  })

  it('blocks private hosts when BLOCK_PRIVATE_DESTINATIONS=1', () => {
    process.env.BLOCK_PRIVATE_DESTINATIONS = '1'
    for (const url of [
      'http://localhost/x',
      'http://127.0.0.1/x',
      'http://10.0.0.5/x',
      'http://192.168.1.50/x',
      'http://172.20.3.4/x',
      'http://169.254.169.254/latest/meta-data',
      'http://[::1]/x',
      'http://printer.local/x',
    ]) {
      assert.equal(checkDestination(url).ok, false, `${url} should be blocked`)
    }
    assert.equal(checkDestination('https://api.example.com/hooks').ok, true)
    assert.equal(checkDestination('http://8.8.8.8/x').ok, true)
  })
})

describe('isPrivateHost', () => {
  it('does not flag public hosts', () => {
    assert.equal(isPrivateHost('example.com'), false)
    assert.equal(isPrivateHost('172.32.0.1'), false) // just past the 172.16-31 block
    assert.equal(isPrivateHost('11.0.0.1'), false)
  })
})
