import Link from 'next/link'
import { notFound } from 'next/navigation'
import { toggleEndpointAction } from '@/app/actions'
import {
  BackLink,
  Empty,
  HealthBadge,
  Panel,
  PanelTitle,
  Stat,
  StatusPill,
  SubmitButton,
} from '@/components/ui'
import { formatPercent, timeAgo, truncate } from '@/lib/format'
import { retryScheduleLabels } from '@/lib/retry'
import { getEndpoint, listEvents } from '@/lib/stats'

export const dynamic = 'force-dynamic'

export default async function EndpointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const endpoint = await getEndpoint(id)
  if (!endpoint) notFound()

  const events = await listEvents({ endpointId: endpoint.id, limit: 40 })
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const schedule = retryScheduleLabels(endpoint.max_attempts)

  return (
    <div className="space-y-4">
      <BackLink href="/">volver al panel</BackLink>

      <Panel className="px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-tight">{endpoint.name}</h1>
            <div className="mt-1.5">
              <HealthBadge health={endpoint.health} />
            </div>
          </div>
          <form action={toggleEndpointAction}>
            <input type="hidden" name="endpointId" value={endpoint.id} />
            <SubmitButton>{endpoint.paused ? 'Reanudar entregas' : 'Pausar entregas'}</SubmitButton>
          </form>
        </div>

        <div className="mt-5 space-y-3">
          <UrlLine label="Le pasás esta URL al que manda el webhook">
            {appUrl}/api/i/{endpoint.ingest_key}
          </UrlLine>
          <UrlLine label="Y nosotros entregamos acá">{endpoint.destination_url}</UrlLine>
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-faint">
          Si el destino no contesta, reintentamos {endpoint.max_attempts} veces separando cada
          intento: {schedule.join(' · ')}. Después queda marcado como sin entregar y esperando a una
          persona.
        </p>
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Recibidos" value={endpoint.total} />
        <Stat
          label="Entregados"
          value={endpoint.delivered}
          hint={formatPercent(endpoint.delivered, endpoint.total)}
          tone="good"
        />
        <Stat label="Rescatados" value={endpoint.recovered} tone="good" />
        <Stat
          label="Sin entregar"
          value={endpoint.dead}
          tone={endpoint.dead > 0 ? 'bad' : 'neutral'}
        />
      </div>

      <Panel>
        <PanelTitle>Eventos de esta integración</PanelTitle>
        {events.length === 0 ? (
          <Empty>Todavía no llegó ningún evento acá.</Empty>
        ) : (
          <table className="w-full text-[13px]">
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-line-soft last:border-0 hover:bg-panel-2/60"
                >
                  <td className="px-5 py-2.5">
                    <Link
                      href={`/events/${event.id}`}
                      className="font-mono text-[12px] text-faint hover:text-accent"
                    >
                      {truncate(event.id, 16)}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5">
                    <StatusPill status={event.status} attempts={event.attempt_count} />
                  </td>
                  <td className="tnum px-5 py-2.5 text-right text-faint">
                    {event.attempt_count} int.
                  </td>
                  <td className="px-5 py-2.5 text-right text-faint">
                    {timeAgo(event.received_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  )
}

function UrlLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <code className="mt-1 block overflow-x-auto border border-line-soft bg-panel-2 px-3 py-2 font-mono text-[12px] text-accent">
        {children}
      </code>
    </div>
  )
}
