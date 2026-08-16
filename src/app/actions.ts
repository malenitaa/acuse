'use server'

import { randomBytes } from 'node:crypto'
import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { drainQueue, replayEvent } from '@/lib/delivery'
import { checkDestination } from '@/lib/destination-guard'
import { newId } from '@/lib/ids'

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
    [id, name, newId('ik', 20), destination, randomBytes(24).toString('hex'), maxAttempts],
  )

  redirect(`/endpoints/${id}`)
}

export async function toggleEndpointAction(formData: FormData) {
  const endpointId = String(formData.get('endpointId') ?? '')
  if (endpointId) {
    await query('update endpoints set paused = not paused where id = $1', [endpointId])
  }
  refresh()
}
