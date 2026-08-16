import Link from 'next/link'
import { processQueueAction } from './actions'
import { AutoRefresh } from '@/components/auto-refresh'
import {
  Empty,
  HealthBadge,
  Section,
  SectionTitle,
  Sheet,
  StatusPill,
  SubmitButton,
  Totals,
} from '@/components/ui'
import { formatNumber, formatPercent, timeAgo, truncate } from '@/lib/format'
import { getEndpointHealth, getNextRetryAt, getStats, listEvents } from '@/lib/stats'
import type { Stats } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, endpoints, events, nextRetryAt] = await Promise.all([
    getStats(),
    getEndpointHealth(),
    listEvents({ limit: 12 }),
    getNextRetryAt(),
  ])

  const broken = endpoints.filter((endpoint) => endpoint.health === 'down')

  return (
    <Sheet>
      <AutoRefresh />
      <Headline stats={stats} />

      {broken.length > 0 ? <MarginNote names={broken.map((e) => e.name)} /> : null}

      <Totals
        items={[
          { label: 'Eventos recibidos', value: stats.received },
          {
            label: 'Entregados',
            value: stats.delivered,
            hint: `${formatPercent(stats.delivered, stats.received)} del total`,
            tone: 'good',
          },
          {
            label: 'En reintento',
            value: stats.retrying,
            hint: nextRetryAt ? `próximo ${timeAgo(nextRetryAt)}` : 'cola vacía',
            tone: stats.retrying > 0 ? 'warn' : 'neutral',
          },
          {
            label: 'Sin entregar',
            value: stats.dead,
            hint: stats.dead > 0 ? 'necesitan una persona' : 'ninguno',
            tone: stats.dead > 0 ? 'bad' : 'neutral',
          },
        ]}
      />

      <Section>
        <SectionTitle
          aside={
            <form action={processQueueAction}>
              <SubmitButton variant="primary" doneLabel="asentado">
                Procesar cola ahora
              </SubmitButton>
            </form>
          }
        >
          Integraciones
        </SectionTitle>
        {endpoints.length === 0 ? (
          <Empty>
            No hay integraciones todavía. Corré <code className="font-mono">npm run seed</code>.
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
            <thead className="text-[11px] uppercase tracking-[0.08em] text-faint">
              <tr className="border-b border-line-soft">
                <th className="px-6 py-2 text-left font-medium">Nombre</th>
                <th className="px-6 py-2 text-left font-medium">Estado</th>
                <th className="px-6 py-2 text-right font-medium">Recibidos</th>
                <th className="px-6 py-2 text-right font-medium">Rescatados</th>
                <th className="px-6 py-2 text-right font-medium">Sin entregar</th>
                <th className="px-6 py-2 text-right font-medium">Última entrega</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint) => (
                <tr
                  key={endpoint.id}
                  className="border-b border-line-soft last:border-0 transition-colors hover:bg-panel-2/60"
                >
                  <td className="px-6 py-2.5">
                    <Link href={`/endpoints/${endpoint.id}`} className="hover:text-accent">
                      {endpoint.name}
                    </Link>
                    {endpoint.paused ? (
                      <span className="ml-2 text-[11px] italic text-faint">(en pausa)</span>
                    ) : null}
                  </td>
                  <td className="px-6 py-2.5">
                    <HealthBadge health={endpoint.health} />
                  </td>
                  <td className="tnum px-6 py-2.5 text-right font-mono text-[12px] text-muted">
                    {formatNumber(endpoint.total)}
                  </td>
                  <td className="tnum px-6 py-2.5 text-right font-mono text-[12px] text-good">
                    {endpoint.recovered > 0 ? formatNumber(endpoint.recovered) : '—'}
                  </td>
                  <td className="tnum px-6 py-2.5 text-right font-mono text-[12px]">
                    <span className={endpoint.dead > 0 ? 'text-bad' : 'text-faint'}>
                      {endpoint.dead > 0 ? formatNumber(endpoint.dead) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-2.5 text-right text-faint">
                    {timeAgo(endpoint.last_delivered_at)}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section>
        <SectionTitle
          aside={
            <Link href="/events" className="text-[12px] text-faint transition-colors hover:text-muted">
              ver todos →
            </Link>
          }
        >
          Últimos eventos
        </SectionTitle>
        {events.length === 0 ? (
          <Empty>
            Todavía no llegó ningún evento. Corré{' '}
            <code className="font-mono">npm run simulate</code>.
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
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
                      {truncate(event.id, 14)}
                    </Link>
                  </td>
                  <td className="px-6 py-2.5 text-muted">{event.endpoint_name}</td>
                  <td className="px-6 py-2.5">
                    <StatusPill status={event.status} attempts={event.attempt_count} />
                  </td>
                  <td className="tnum px-6 py-2.5 text-right text-faint">
                    {event.attempt_count === 0
                      ? 'sin intentos'
                      : `${event.attempt_count} ${event.attempt_count === 1 ? 'intento' : 'intentos'}`}
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

/**
 * The one number the whole product exists to produce. Everything else on the
 * sheet is evidence that this number is real.
 */
function Headline({ stats }: { stats: Stats }) {
  return (
    <Section className="px-6 py-7">
      <p className="font-serif text-[15px] italic text-muted">Eventos rescatados</p>
      <div className="tnum mt-1 font-serif text-6xl font-semibold text-good">
        {formatNumber(stats.recovered)}
      </div>
      <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-muted">
        Entregas que fallaron en el primer intento y terminaron llegando gracias a los reintentos.
        Sin Acuse en el medio, estas {formatNumber(stats.recovered)} se perdían en silencio.
      </p>
      {stats.received > 0 ? <CompositionBar stats={stats} /> : null}
    </Section>
  )
}

/**
 * Every event received, split by how it ended. The rescued number needs a
 * denominator to mean anything — and the events still unlanded belong in the
 * same picture, or the bar flatters the product.
 */
function CompositionBar({ stats }: { stats: Stats }) {
  const segments = [
    { key: 'firstTry', value: stats.firstTry, label: 'primer intento', bar: 'bg-good/35' },
    { key: 'recovered', value: stats.recovered, label: 'rescatados', bar: 'bg-good' },
    { key: 'pending', value: stats.pending, label: 'en reintento', bar: 'bg-warn' },
    { key: 'dead', value: stats.dead, label: 'sin entregar', bar: 'bg-bad' },
  ].filter((segment) => segment.value > 0)

  return (
    <div className="mt-5 max-w-xl">
      <div className="draw-in flex h-2 border border-line-soft bg-panel-2">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={segment.bar}
            style={{ width: `${(segment.value / stats.received) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-faint">
        {segments.map((segment) => (
          <span key={segment.key}>
            <span className={`mr-1.5 inline-block size-2 align-middle ${segment.bar}`} />
            {segment.label} · {formatPercent(segment.value, stats.received)}
          </span>
        ))}
      </div>
    </div>
  )
}

/** A broken integration is an annotation on the record, not an app banner. */
function MarginNote({ names }: { names: string[] }) {
  return (
    <div className="note-enter px-6 py-3">
      <p className="text-[13px] leading-relaxed">
        <span className="font-semibold text-bad">
          ☞ {names.length === 1
            ? `«${names[0]}» dejó de responder.`
            : `${names.length} integraciones dejaron de responder: ${names.join(', ')}.`}
        </span>{' '}
        <span className="italic text-muted">
          Los eventos siguen guardados y se reintentan solos; esta anotación aparece antes de que
          se pierda nada.
        </span>
      </p>
    </div>
  )
}
