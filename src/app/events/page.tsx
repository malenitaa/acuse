import Link from 'next/link'
import { BackStrip, Empty, Section, SectionTitle, Sheet, StatusPill } from '@/components/ui'
import { timeAgo, truncate } from '@/lib/format'
import { listEvents } from '@/lib/stats'

export const dynamic = 'force-dynamic'

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'En reintento' },
  { value: 'dead', label: 'Sin entregar' },
  { value: 'delivered', label: 'Entregados' },
]

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'all' } = await searchParams
  const events = await listEvents({ status, limit: 200 })

  return (
    <Sheet>
      <BackStrip href="/">volver al panel</BackStrip>

      <Section>
        <SectionTitle
          aside={
            <div className="flex gap-3">
              {FILTERS.map((filter) => (
                <Link
                  key={filter.value}
                  href={filter.value === 'all' ? '/events' : `/events?status=${filter.value}`}
                  className={`border-b-2 py-0.5 text-[12px] transition-colors ${
                    status === filter.value
                      ? 'border-text text-text'
                      : 'border-transparent text-faint hover:text-muted'
                  }`}
                >
                  {filter.label}
                </Link>
              ))}
            </div>
          }
        >
          Eventos
        </SectionTitle>

        {events.length === 0 ? (
          <Empty>No hay eventos con ese estado.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
            <thead className="text-[11px] uppercase tracking-[0.08em] text-faint">
              <tr className="border-b border-line-soft">
                <th className="px-6 py-2 text-left font-medium">Evento</th>
                <th className="px-6 py-2 text-left font-medium">Integración</th>
                <th className="px-6 py-2 text-left font-medium">Estado</th>
                <th className="px-6 py-2 text-right font-medium">Intentos</th>
                <th className="px-6 py-2 text-right font-medium">Recibido</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-line-soft last:border-0 transition-colors hover:bg-panel-2/60"
                >
                  <td className="px-6 py-2.5">
                    <Link
                      href={`/events/${event.id}`}
                      className="font-mono text-[12px] text-faint hover:text-accent"
                    >
                      {truncate(event.id, 16)}
                    </Link>
                  </td>
                  <td className="px-6 py-2.5 text-muted">{event.endpoint_name}</td>
                  <td className="px-6 py-2.5">
                    <StatusPill status={event.status} attempts={event.attempt_count} />
                  </td>
                  <td className="tnum px-6 py-2.5 text-right font-mono text-[12px] text-faint">
                    {event.attempt_count}
                  </td>
                  <td className="px-6 py-2.5 text-right text-faint">
                    {timeAgo(event.received_at)}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </Section>
    </Sheet>
  )
}
