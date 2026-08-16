import 'server-only'
import { buildDeadEventAlert, sendAlert } from './alerts'
import { query } from './db'
import { checkDestination } from './destination-guard'
import { sign } from './signature'
import { DELIVERY_TIMEOUT_MS, backoffMs } from './retry'
import type { DeliveryJob, DeliveryResult, EventStatus } from './types'

/** How long a worker may hold an event before another one may steal it back. */
const LEASE_TIMEOUT = '2 minutes'

/**
 * Take ownership of events that are due, in one statement.
 *
 * `for update skip locked` is what makes this safe to run from several workers
 * at once: each one walks past the rows another has already claimed instead of
 * blocking on them, so nobody delivers the same event twice.
 */
export async function claimDueEvents(limit: number): Promise<DeliveryJob[]> {
  return query<DeliveryJob>(
    `update events e
     set locked_at = now()
     from endpoints ep
     where ep.id = e.endpoint_id
       and e.id in (
         select inner_e.id
         from events inner_e
         join endpoints inner_ep on inner_ep.id = inner_e.endpoint_id
         where inner_e.status = 'pending'
           and inner_e.next_attempt_at <= now()
           and not inner_ep.paused
           and (inner_e.locked_at is null
                or inner_e.locked_at < now() - interval '${LEASE_TIMEOUT}')
         order by inner_e.next_attempt_at asc
         limit $1
         for update skip locked
       )
     returning e.id,
               e.endpoint_id,
               e.payload,
               e.attempt_count,
               ep.name  as endpoint_name,
               ep.destination_url,
               ep.signing_secret,
               ep.max_attempts`,
    [limit],
  )
}

/** One HTTP request to the destination. Never throws. */
async function sendOnce(job: DeliveryJob, attemptNumber: number) {
  const body = JSON.stringify(job.payload)
  const timestamp = Math.floor(Date.now() / 1000)
  const startedAt = Date.now()

  let statusCode: number | null = null
  let responseBody: string | null = null
  let error: string | null = null

  // The destination comes from the database, but "trust the database" is how
  // SSRF happens: validate at the moment of use (OWASP A10).
  const guard = checkDestination(job.destination_url)
  if (!guard.ok) {
    return { statusCode, responseBody, error: guard.reason, durationMs: 0, ok: false }
  }

  try {
    const response = await fetch(job.destination_url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Acuse/0.1',
        // Standard Webhooks headers: verifiable with any compliant library.
        'webhook-id': job.id,
        'webhook-timestamp': String(timestamp),
        'webhook-signature': sign(job.signing_secret, job.id, timestamp, body),
        'acuse-attempt': String(attemptNumber),
      },
      body,
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    })
    statusCode = response.status
    // Keep enough of the response to debug with, not enough to bloat the table.
    responseBody = (await response.text()).slice(0, 2000)
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.name === 'TimeoutError'
          ? `sin respuesta en ${DELIVERY_TIMEOUT_MS / 1000}s`
          : `${cause.name}: ${cause.message}`
        : String(cause)
  }

  return {
    statusCode,
    responseBody,
    error,
    durationMs: Date.now() - startedAt,
    ok: statusCode !== null && statusCode >= 200 && statusCode < 300,
  }
}

/**
 * Deliver one claimed event and record what happened, win or lose.
 *
 * The attempt row is written before the event row is updated. If the process
 * dies between the two, the lease expires and the event is retried — a
 * duplicate delivery is recoverable, a silently dropped event is not.
 */
export async function deliverEvent(
  job: DeliveryJob,
  options: { manual?: boolean } = {},
): Promise<DeliveryResult> {
  const attemptNumber = job.attempt_count + 1
  const result = await sendOnce(job, attemptNumber)

  await query(
    `insert into attempts
       (event_id, n, duration_ms, status_code, response_body, error, outcome, manual)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      job.id,
      attemptNumber,
      result.durationMs,
      result.statusCode,
      result.responseBody,
      result.error,
      result.ok ? 'success' : 'failure',
      options.manual ?? false,
    ],
  )

  let status: EventStatus

  if (result.ok) {
    status = 'delivered'
    await query(
      `update events
       set status = 'delivered', delivered_at = now(), attempt_count = $2,
           locked_at = null, last_error = null
       where id = $1`,
      [job.id, attemptNumber],
    )
  } else {
    const exhausted = attemptNumber >= job.max_attempts
    status = exhausted ? 'dead' : 'pending'
    const summary = result.error ?? `HTTP ${result.statusCode}`
    await query(
      `update events
       set status = $2,
           attempt_count = $3,
           next_attempt_at = now() + make_interval(secs => $4::float8),
           locked_at = null,
           last_error = $5
       where id = $1`,
      [job.id, status, attemptNumber, backoffMs(attemptNumber) / 1000, summary],
    )

    if (exhausted) {
      // Fire-and-forget: the alert must never delay or fail the pass.
      void sendAlert(
        buildDeadEventAlert({
          eventId: job.id,
          endpointName: job.endpoint_name,
          attempts: attemptNumber,
          lastError: summary,
        }),
      )
    }
  }

  return {
    eventId: job.id,
    attempt: attemptNumber,
    ok: result.ok,
    statusCode: result.statusCode,
    error: result.error,
    durationMs: result.durationMs,
    status,
  }
}

export type DrainSummary = {
  claimed: number
  delivered: number
  failed: number
  dead: number
}

/** One pass over the queue. Called by the scheduler and by the console button. */
export async function drainQueue(limit = 50): Promise<DrainSummary> {
  const jobs = await claimDueEvents(limit)

  // Destinations are independent, so there is no reason to wait on them in
  // turn — one slow endpoint would stall every other endpoint's queue.
  const results = await Promise.all(jobs.map((job) => deliverEvent(job)))

  return {
    claimed: jobs.length,
    delivered: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    dead: results.filter((r) => r.status === 'dead').length,
  }
}

/**
 * Re-drive a single event on demand, including one already given up on.
 * This is the whole reason the payload is kept: without it "reenviar" would be
 * a button that apologises instead of a button that works.
 */
export async function replayEvent(eventId: string): Promise<DeliveryResult | null> {
  const jobs = await query<DeliveryJob>(
    `update events e
     set locked_at = now(), status = 'pending', next_attempt_at = now()
     from endpoints ep
     where ep.id = e.endpoint_id and e.id = $1
     returning e.id,
               e.endpoint_id,
               e.payload,
               e.attempt_count,
               ep.name as endpoint_name,
               ep.destination_url,
               ep.signing_secret,
               ep.max_attempts`,
    [eventId],
  )

  if (jobs.length === 0) return null

  // A manual replay should not be the attempt that exhausts the budget and
  // buries the event again, so give it room to run.
  const job = { ...jobs[0], max_attempts: jobs[0].attempt_count + 2 }
  return deliverEvent(job, { manual: true })
}
