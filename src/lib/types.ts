export type EventStatus = 'pending' | 'delivered' | 'dead'

export type Endpoint = {
  id: string
  name: string
  ingest_key: string
  destination_url: string
  signing_secret: string
  max_attempts: number
  paused: boolean
  created_at: Date
}

export type EventRow = {
  id: string
  endpoint_id: string
  dedupe_key: string | null
  payload: unknown
  headers: Record<string, string>
  source_ip: string | null
  status: EventStatus
  attempt_count: number
  next_attempt_at: Date
  received_at: Date
  delivered_at: Date | null
  last_error: string | null
  locked_at: Date | null
  archived_at: Date | null
}

export type Attempt = {
  id: string
  event_id: string
  n: number
  started_at: Date
  duration_ms: number | null
  status_code: number | null
  response_body: string | null
  error: string | null
  outcome: 'success' | 'failure'
  manual: boolean
}

/** An event joined with everything the delivery worker needs to send it. */
export type DeliveryJob = {
  id: string
  endpoint_id: string
  endpoint_name: string
  payload: unknown
  attempt_count: number
  destination_url: string
  signing_secret: string
  max_attempts: number
}

export type DeliveryResult = {
  eventId: string
  attempt: number
  ok: boolean
  statusCode: number | null
  error: string | null
  durationMs: number
  /** Status the event landed in after this attempt. */
  status: EventStatus
}

export type Stats = {
  received: number
  delivered: number
  /** Delivered, but not on the first try. The events that would have been lost. */
  recovered: number
  dead: number
  pending: number
  retrying: number
  firstTry: number
}

export type EndpointHealth = Endpoint & {
  total: number
  delivered: number
  recovered: number
  retrying: number
  dead: number
  last_delivered_at: Date | null
  last_failure_at: Date | null
  health: 'healthy' | 'degraded' | 'down' | 'idle'
}
