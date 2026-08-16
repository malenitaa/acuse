import type { NextRequest } from 'next/server'
import { findEndpointByKey, receiveEvent } from '@/lib/ingest'
import { allowIngest } from '@/lib/rate-limit'

/** Bigger than this and the sender is not calling a webhook, it is uploading. */
const MAX_BODY_BYTES = 1_000_000

/**
 * The ingest endpoint. This is the URL a customer pastes into their store,
 * their payment processor, their form tool or their automation platform.
 *
 * It answers as fast as it can after the event is on disk. It deliberately does
 * not attempt delivery: the sender should never wait on a third party's server,
 * because a slow answer here is what makes senders time out and drop events.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params

  // Rate limit before touching the database: an abusive sender should cost
  // as little as possible. Serious webhook emitters treat
  // 429 + retry-after politely and try again.
  if (!allowIngest(key)) {
    return Response.json(
      { error: 'demasiadas solicitudes' },
      { status: 429, headers: { 'retry-after': '60' } },
    )
  }

  const endpoint = await findEndpointByKey(key)
  if (!endpoint) {
    return Response.json({ error: 'endpoint desconocido' }, { status: 404 })
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: 'cuerpo demasiado grande' }, { status: 413 })
  }

  let payload: unknown
  try {
    payload = raw ? JSON.parse(raw) : {}
  } catch {
    // Keep it rather than reject it. A malformed body is still evidence, and
    // rejecting it means the sender drops it and nobody ever sees it again.
    payload = { _raw: raw.slice(0, 10_000), _parseError: true }
  }

  const outcome = await receiveEvent({
    endpoint,
    payload,
    headers: request.headers,
    sourceIp: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
  })

  return Response.json(
    { received: true, event_id: outcome.eventId, duplicate: outcome.duplicate },
    { status: outcome.duplicate ? 200 : 202 },
  )
}
