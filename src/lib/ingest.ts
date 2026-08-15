import 'server-only'
import { query, queryOne } from './db'
import { newId } from './ids'
import type { Endpoint } from './types'

/** Headers that say something about the sender. The rest is noise. */
const KEPT_HEADERS = [
  'content-type',
  'user-agent',
  'x-forwarded-for',
  'idempotency-key',
  'x-request-id',
  'x-shopify-topic',
  'x-github-event',
  'stripe-signature',
]

export async function findEndpointByKey(ingestKey: string): Promise<Endpoint | null> {
  return queryOne<Endpoint>('select * from endpoints where ingest_key = $1', [ingestKey])
}

export type IngestOutcome = {
  eventId: string
  duplicate: boolean
}

/**
 * The hot path. Everything here happens before the sender gets its 200, so it
 * stays deliberately small: one INSERT, no delivery attempt, no outbound HTTP.
 * A slow ingest is how you lose events — senders time out and give up.
 */
export async function receiveEvent(args: {
  endpoint: Endpoint
  payload: unknown
  headers: Headers
  sourceIp: string | null
}): Promise<IngestOutcome> {
  const { endpoint, payload, headers, sourceIp } = args

  const kept: Record<string, string> = {}
  for (const name of KEPT_HEADERS) {
    const value = headers.get(name)
    if (value) kept[name] = value
  }

  // Senders retry on their own when we are slow to answer. If they tell us how
  // to recognise the repeat, we honour it instead of delivering twice.
  const dedupeKey = headers.get('idempotency-key') ?? headers.get('x-request-id') ?? null

  const eventId = newId('evt')
  const rows = await query<{ id: string }>(
    `insert into events (id, endpoint_id, dedupe_key, payload, headers, source_ip)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (endpoint_id, dedupe_key) where dedupe_key is not null
     do nothing
     returning id`,
    [eventId, endpoint.id, dedupeKey, JSON.stringify(payload), JSON.stringify(kept), sourceIp],
  )

  if (rows.length > 0) return { eventId: rows[0].id, duplicate: false }

  // Conflict: the same delivery already landed. Hand back the original id so
  // the sender can still correlate it.
  const existing = await queryOne<{ id: string }>(
    'select id from events where endpoint_id = $1 and dedupe_key = $2',
    [endpoint.id, dedupeKey],
  )
  return { eventId: existing?.id ?? eventId, duplicate: true }
}
