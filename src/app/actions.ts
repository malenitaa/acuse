'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { drainQueue, replayEvent } from '@/lib/delivery'
import { checkDestination } from '@/lib/destination-guard'
import { newId } from '@/lib/ids'
import { newSigningSecret } from '@/lib/signature'

/**
 * In production the scheduler drains the queue. The console keeps a button for
 * it too, because "esperá al próximo minuto" is a bad answer for an operator
 * who is watching an outage happen.
 */
export async function processQueueAction() {
  await drainQueue()
  refresh()
}

export async function replayEventAction(formData: FormData) {
  const eventId = String(formData.get('eventId') ?? '')
  if (eventId) await replayEvent(eventId)
  refresh()
}

export type CreateEndpointState = { error?: 'name' | 'destination' }

/**
 * Create an integration from the console. The ingest key and signing secret
 * are generated server-side, never chosen by the user: a guessable key would
 * be an open mailbox. On success, redirects to the endpoint page, which
 * shows the ingest URL to paste into the emitting system.
 */
export async function createEndpointAction(
  _prev: CreateEndpointState,
  formData: FormData,
): Promise<CreateEndpointState> {
  const name = String(formData.get('name') ?? '')
    .trim()
    .slice(0, 120)
  const destination = String(formData.get('destination') ?? '').trim()
  const rawAttempts = Number(formData.get('maxAttempts') ?? 8)
  const maxAttempts = Math.min(12, Math.max(1, Number.isFinite(rawAttempts) ? rawAttempts : 8))

  if (!name) return { error: 'name' }
  if (!checkDestination(destination).ok) return { error: 'destination' }

  const id = newId('ep')
  await query(
    `insert into endpoints (id, name, ingest_key, destination_url, signing_secret, max_attempts)
     values ($1, $2, $3, $4, $5, $6)`,
    [id, name, newId('ik', 20), destination, newSigningSecret(), maxAttempts],
  )

  redirect(`/endpoints/${id}`)
}

export type SendEventState = { error?: 'json' | 'date' | 'endpoint' }

/**
 * Queue an event by hand: for testing an integration, or for scheduling a
 * webhook ("it should go out at 2am; I want to sleep"). No new machinery —
 * a scheduled send IS an event whose next_attempt_at hasn't arrived yet,
 * so the existing queue, retries and audit trail all apply.
 */
export async function sendEventAction(
  _prev: SendEventState,
  formData: FormData,
): Promise<SendEventState> {
  const endpointId = String(formData.get('endpointId') ?? '')
  if (!endpointId) return { error: 'endpoint' }

  let payload: unknown
  try {
    payload = JSON.parse(String(formData.get('payload') ?? ''))
  } catch {
    return { error: 'json' }
  }

  const rawWhen = String(formData.get('scheduledAt') ?? '').trim()
  let when: Date | null = null
  if (rawWhen) {
    when = new Date(rawWhen)
    if (Number.isNaN(when.getTime())) return { error: 'date' }
  }

  await query(
    `insert into events (id, endpoint_id, payload, status, next_attempt_at)
     values ($1, $2, $3, 'pending', coalesce($4::timestamptz, now()))`,
    [newId('evt'), endpointId, JSON.stringify(payload), when?.toISOString() ?? null],
  )

  refresh()
  return {}
}

/**
 * Archive / restore by hand. Nothing in Acuse is deletable — archiving moves
 * an event out of the operational lists into the browsable archive, and
 * restoring brings it back. Pending events cannot be archived: they are work
 * still owed.
 */
export async function archiveEventAction(formData: FormData) {
  const eventId = String(formData.get('eventId') ?? '')
  if (eventId) {
    await query(
      `update events set archived_at = now() where id = $1 and status <> 'pending'`,
      [eventId],
    )
  }
  refresh()
}

export async function unarchiveEventAction(formData: FormData) {
  const eventId = String(formData.get('eventId') ?? '')
  if (eventId) {
    await query(`update events set archived_at = null where id = $1`, [eventId])
  }
  refresh()
}

export async function toggleEndpointAction(formData: FormData) {
  const endpointId = String(formData.get('endpointId') ?? '')
  if (endpointId) {
    await query('update endpoints set paused = not paused where id = $1', [endpointId])
  }
  refresh()
}
