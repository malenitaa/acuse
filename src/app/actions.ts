'use server'

import { refresh } from 'next/cache'
import { query } from '@/lib/db'
import { drainQueue, replayEvent } from '@/lib/delivery'

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

export async function toggleEndpointAction(formData: FormData) {
  const endpointId = String(formData.get('endpointId') ?? '')
  if (endpointId) {
    await query('update endpoints set paused = not paused where id = $1', [endpointId])
  }
  refresh()
}
