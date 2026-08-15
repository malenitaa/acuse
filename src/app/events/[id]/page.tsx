import Link from 'next/link'
import { notFound } from 'next/navigation'
import { replayEventAction } from '@/app/actions'
import { BackStrip, Section, SectionTitle, Sheet, StatusPill, SubmitButton } from '@/components/ui'
import { formatTimestamp, timeAgo } from '@/lib/format'
import { getAttempts, getEvent } from '@/lib/stats'
import type { Attempt } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  const attempts = await getAttempts(event.id)

  return (
    <Sheet>
      <BackStrip href="/">volver al panel</BackStrip>

      <Section className="px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[13px] text-muted">{event.id}</div>
            <div className="mt-2 flex items-center gap-3">
              <StatusPill status={event.status} attempts={event.attempt_count} />
              <Link
                href={`/endpoints/${event.endpoint_id}`}
                className="text-[13px] text-muted hover:text-accent"
              >
                {event.endpoint_name}
              </Link>
            </div>
          </div>
          <form action={replayEventAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <SubmitButton variant={event.status === 'dead' ? 'primary' : 'ghost'}>
              Reenviar ahora
            </SubmitButton>
          </form>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-[12px] sm:grid-cols-4">
          <Field label="Recibido" value={formatTimestamp(event.received_at)} />
          <Field
            label="Entregado"
            value={event.delivered_at ? formatTimestamp(event.delivered_at) : '—'}
          />
          <Field label="Intentos" value={String(event.attempt_count)} />
          <Field
            label={event.status === 'pending' ? 'Próximo intento' : 'Último error'}
            value={
              event.status === 'pending'
                ? timeAgo(event.next_attempt_at)
                : (event.last_error ?? '—')
            }
          />
        </dl>
      </Section>

      <Section>
        <SectionTitle>Intentos de entrega</SectionTitle>
        {attempts.length === 0 ? (
          <div className="px-6 py-8 text-center font-serif text-[14px] italic text-faint">
            Todavía no se intentó entregar. El evento ya está guardado.
          </div>
        ) : (
          <ol className="divide-y divide-line-soft">
            {attempts.map((attempt) => (
              <AttemptRow key={attempt.id} attempt={attempt} />
            ))}
          </ol>
        )}
      </Section>

      <Section>
        <SectionTitle>Contenido recibido</SectionTitle>
        <pre className="overflow-x-auto px-6 py-4 font-mono text-[12px] leading-relaxed text-muted">
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </Section>
    </Sheet>
  )
}

function AttemptRow({ attempt }: { attempt: Attempt }) {
  const ok = attempt.outcome === 'success'

  return (
    <li className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-3">
      <span
        className={`tnum inline-flex size-5 shrink-0 items-center justify-center border font-mono text-[11px] font-medium ${
          ok ? 'border-good/60 text-good' : 'border-bad/60 text-bad'
        }`}
      >
        {attempt.n}
      </span>
      <span className={`tnum font-mono text-[13px] font-medium ${ok ? 'text-good' : 'text-bad'}`}>
        {attempt.status_code ? `HTTP ${attempt.status_code}` : 'sin respuesta'}
      </span>
      <span className="text-[12px] text-faint">{formatTimestamp(attempt.started_at)}</span>
      <span className="tnum text-[12px] text-faint">{attempt.duration_ms}ms</span>
      {attempt.manual ? (
        <span className="border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
          manual
        </span>
      ) : null}
      {attempt.error ? (
        <span className="w-full font-mono text-[12px] text-bad/80">{attempt.error}</span>
      ) : null}
      {attempt.response_body && !ok ? (
        <span className="w-full font-mono text-[12px] text-faint">{attempt.response_body}</span>
      ) : null}
    </li>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.08em] text-faint">{label}</dt>
      <dd className="tnum mt-0.5 text-muted">{value}</dd>
    </div>
  )
}
