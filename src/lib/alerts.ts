/**
 * Outbound failure alerts, error-workflow style: when an event exhausts
 * its retries and lands in the dead-letter state, POST a JSON alert to
 * ALERT_WEBHOOK_URL (if set). Point it at a chat webhook, an automation-platform trigger, or
 * even another Acuse integration — a delivery failure becomes just another
 * webhook your tools can route.
 *
 * Fire-and-forget by design: an alert must never slow down or break a
 * delivery pass. If the alert URL is down, the failure is logged and life
 * goes on — the dead event itself is already safely parked in the console.
 */

const ALERT_TIMEOUT_MS = 5_000

export type DeadEventAlert = {
  type: 'event.dead'
  event_id: string
  endpoint: string
  attempts: number
  last_error: string | null
  console_url: string | null
  at: string
}

export function buildDeadEventAlert(input: {
  eventId: string
  endpointName: string
  attempts: number
  lastError: string | null
}): DeadEventAlert {
  const appUrl = process.env.APP_URL ?? null
  return {
    type: 'event.dead',
    event_id: input.eventId,
    endpoint: input.endpointName,
    attempts: input.attempts,
    last_error: input.lastError,
    console_url: appUrl ? `${appUrl}/events/${input.eventId}` : null,
    at: new Date().toISOString(),
  }
}

export async function sendAlert(alert: DeadEventAlert): Promise<void> {
  const url = process.env.ALERT_WEBHOOK_URL
  if (!url) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'Acuse/0.1 (alerts)' },
      body: JSON.stringify(alert),
      signal: AbortSignal.timeout(ALERT_TIMEOUT_MS),
    })
  } catch (error) {
    console.error('[acuse] alert webhook failed:', error)
  }
}
