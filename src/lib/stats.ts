import 'server-only'
import { query, queryOne } from './db'
import type { Attempt, EndpointHealth, EventRow, Stats } from './types'

export async function getStats(): Promise<Stats> {
  const row = await queryOne<Stats>(
    `select
       count(*)::int                                                          as received,
       count(*) filter (where status = 'delivered')::int                      as delivered,
       count(*) filter (where status = 'delivered' and attempt_count > 1)::int as recovered,
       count(*) filter (where status = 'delivered' and attempt_count = 1)::int as "firstTry",
       count(*) filter (where status = 'dead')::int                           as dead,
       count(*) filter (where status = 'pending')::int                        as pending,
       count(*) filter (where status = 'pending' and attempt_count > 0)::int  as retrying
     from events`,
  )

  return row ?? { received: 0, delivered: 0, recovered: 0, firstTry: 0, dead: 0, pending: 0, retrying: 0 }
}

/**
 * Health is derived from the queue, not from a heartbeat. An integration that
 * has quietly stopped working looks exactly like a healthy one from the
 * outside; the only tell is that events are piling up behind it.
 */
export async function getEndpointHealth(): Promise<EndpointHealth[]> {
  const rows = await query<Omit<EndpointHealth, 'health'>>(
    `select ep.*,
            count(e.id)::int                                                          as total,
            count(e.id) filter (where e.status = 'delivered')::int                    as delivered,
            count(e.id) filter (where e.status = 'delivered' and e.attempt_count > 1)::int as recovered,
            count(e.id) filter (where e.status = 'pending' and e.attempt_count > 0)::int   as retrying,
            count(e.id) filter (where e.status = 'dead')::int                         as dead,
            max(e.delivered_at)                                                       as last_delivered_at,
            max(e.received_at) filter (where e.status <> 'delivered')                 as last_failure_at
     from endpoints ep
     left join events e on e.endpoint_id = ep.id
     group by ep.id
     order by ep.created_at asc`,
  )

  return rows.map((row) => ({ ...row, health: classify(row) }))
}

function classify(row: Omit<EndpointHealth, 'health'>): EndpointHealth['health'] {
  if (row.total === 0) return 'idle'
  // Events that ran out of attempts mean deliveries are being lost right now.
  if (row.dead > 0) return 'down'
  // A handful of events stuck retrying is the earliest honest signal that the
  // far side broke, and it shows up before anything is lost.
  if (row.retrying >= 3) return 'down'
  if (row.retrying > 0) return 'degraded'
  return 'healthy'
}

export async function getEndpoint(id: string): Promise<EndpointHealth | null> {
  const all = await getEndpointHealth()
  return all.find((endpoint) => endpoint.id === id) ?? null
}

export type EventListItem = EventRow & { endpoint_name: string }

export async function listEvents(options: {
  endpointId?: string
  status?: string
  limit?: number
}): Promise<EventListItem[]> {
  const conditions: string[] = []
  const params: unknown[] = []

  if (options.endpointId) {
    params.push(options.endpointId)
    conditions.push(`e.endpoint_id = $${params.length}`)
  }
  // Operational lists hide archived events; the «archived» pseudo-status IS
  // the archive browser. Lifetime totals (getStats) keep counting everything.
  if (options.status === 'archived') {
    conditions.push('e.archived_at is not null')
  } else {
    conditions.push('e.archived_at is null')
    if (options.status && options.status !== 'all') {
      params.push(options.status)
      conditions.push(`e.status = $${params.length}`)
    }
  }

  params.push(options.limit ?? 50)

  return query<EventListItem>(
    `select e.*, ep.name as endpoint_name
     from events e
     join endpoints ep on ep.id = e.endpoint_id
     ${conditions.length ? `where ${conditions.join(' and ')}` : ''}
     order by e.received_at desc
     limit $${params.length}`,
    params,
  )
}

export async function getEvent(id: string): Promise<EventListItem | null> {
  return queryOne<EventListItem>(
    `select e.*, ep.name as endpoint_name
     from events e
     join endpoints ep on ep.id = e.endpoint_id
     where e.id = $1`,
    [id],
  )
}

export async function getAttempts(eventId: string): Promise<Attempt[]> {
  return query<Attempt>(
    'select * from attempts where event_id = $1 order by n asc, started_at asc',
    [eventId],
  )
}

/** Feeds the "próximo reintento" line on the dashboard. */
export async function getNextRetryAt(): Promise<Date | null> {
  const row = await queryOne<{ next: Date | null }>(
    `select min(next_attempt_at) as next from events where status = 'pending'`,
  )
  return row?.next ?? null
}
