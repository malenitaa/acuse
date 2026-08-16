import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'
import { buildDeadEventAlert, sendAlert } from '../src/lib/alerts.ts'

afterEach(() => {
  delete process.env.ALERT_WEBHOOK_URL
  delete process.env.APP_URL
  mock.restoreAll()
})

describe('buildDeadEventAlert', () => {
  it('carries everything a responder needs', () => {
    process.env.APP_URL = 'https://acuse.example.com'
    const alert = buildDeadEventAlert({
      eventId: 'evt_123',
      endpointName: 'Darwin → workflow X',
      attempts: 8,
      lastError: 'HTTP 503',
    })
    assert.equal(alert.type, 'event.dead')
    assert.equal(alert.event_id, 'evt_123')
    assert.equal(alert.endpoint, 'Darwin → workflow X')
    assert.equal(alert.attempts, 8)
    assert.equal(alert.last_error, 'HTTP 503')
    assert.equal(alert.console_url, 'https://acuse.example.com/events/evt_123')
    assert.ok(!Number.isNaN(Date.parse(alert.at)))
  })

  it('omits the console link when APP_URL is not set', () => {
    const alert = buildDeadEventAlert({
      eventId: 'evt_1',
      endpointName: 'X',
      attempts: 1,
      lastError: null,
    })
    assert.equal(alert.console_url, null)
  })
})

describe('sendAlert', () => {
  it('does nothing when ALERT_WEBHOOK_URL is not set', async () => {
    const fetchMock = mock.method(globalThis, 'fetch')
    await sendAlert(buildDeadEventAlert({ eventId: 'e', endpointName: 'x', attempts: 1, lastError: null }))
    assert.equal(fetchMock.mock.callCount(), 0)
  })

  it('POSTs the alert as JSON to the configured URL', async () => {
    process.env.ALERT_WEBHOOK_URL = 'https://hooks.example.com/alerts'
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('ok'))
    const alert = buildDeadEventAlert({ eventId: 'evt_9', endpointName: 'x', attempts: 8, lastError: 'HTTP 500' })
    await sendAlert(alert)

    assert.equal(fetchMock.mock.callCount(), 1)
    const [url, init] = fetchMock.mock.calls[0].arguments as [string, RequestInit]
    assert.equal(url, 'https://hooks.example.com/alerts')
    assert.equal(init.method, 'POST')
    assert.equal(JSON.parse(String(init.body)).event_id, 'evt_9')
  })

  it('swallows network failures instead of throwing', async () => {
    process.env.ALERT_WEBHOOK_URL = 'https://hooks.example.com/alerts'
    mock.method(globalThis, 'fetch', async () => {
      throw new Error('boom')
    })
    await assert.doesNotReject(
      sendAlert(buildDeadEventAlert({ eventId: 'e', endpointName: 'x', attempts: 1, lastError: null })),
    )
  })
})
