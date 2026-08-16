import 'server-only'
import { query } from './db'

/**
 * Retention that never deletes. Svix keeps payloads 30 days and then they are
 * gone; Acuse's answer is archiving: with RETENTION_DAYS set, delivered
 * events older than that move out of the operational lists into the archive
 * («Archivo» filter on the events page), where they stay browsable and
 * restorable forever. Unset (the default) nothing is ever archived.
 *
 * Only DELIVERED events are archived automatically: pending and dead events
 * represent work owed to a human and never leave the operational view on
 * their own.
 */

export function retentionDays(): number | null {
  const raw = Number(process.env.RETENTION_DAYS ?? 0)
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : null
}

export async function archiveOldEvents(): Promise<number> {
  const days = retentionDays()
  if (!days) return 0

  const rows = await query<{ id: string }>(
    `update events
     set archived_at = now()
     where archived_at is null
       and status = 'delivered'
       and delivered_at < now() - make_interval(days => $1)
     returning id`,
    [days],
  )

  if (rows.length > 0) {
    console.log(`[acuse] archived ${rows.length} delivered events older than ${days} days`)
  }
  return rows.length
}
