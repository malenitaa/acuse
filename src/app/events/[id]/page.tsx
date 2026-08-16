import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  archiveEventAction,
  postponeEventAction,
  replayEventAction,
  unarchiveEventAction,
} from '@/app/actions'
import { BackStrip, Section, SectionTitle, Sheet, StatusPill, SubmitButton } from '@/components/ui'
import { formatTimestamp, timeAgo } from '@/lib/format'
import { dict, type Lang } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import { getAttempts, getEvent } from '@/lib/stats'
import type { Attempt } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [lang, event] = await Promise.all([getLang(), getEvent(id)])
  if (!event) notFound()
  const t = dict[lang]

  const attempts = await getAttempts(event.id)

  return (
    <Sheet>
      <BackStrip href="/">{t.events.back}</BackStrip>

      <Section className="px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[13px] text-muted">{event.id}</div>
            <div className="mt-2 flex items-center gap-3">
              <StatusPill status={event.status} attempts={event.attempt_count} lang={lang} />
              <Link
                href={`/endpoints/${event.endpoint_id}`}
                className="text-[13px] text-muted hover:text-accent"
              >
                {event.endpoint_name}
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form action={replayEventAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <SubmitButton
                variant={event.status === 'dead' ? 'primary' : 'ghost'}
                pendingLabel={t.actions.processing}
                doneLabel={t.actions.redelivered}
              >
                {t.actions.redeliver}
              </SubmitButton>
            </form>
            {/* Keys keep React from recycling one form's SubmitButton (and its
                «✓ done» flash) into the other when the branch flips. */}
            {event.archived_at ? (
              <form key="restore" action={unarchiveEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <SubmitButton pendingLabel={t.actions.processing} doneLabel={t.events.restored}>
                  {t.events.restore}
                </SubmitButton>
              </form>
            ) : event.status !== 'pending' ? (
              <form key="archive" action={archiveEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <SubmitButton pendingLabel={t.actions.processing} doneLabel={t.actions.done}>
                  {t.events.archive}
                </SubmitButton>
              </form>
            ) : null}
          </div>
        </div>

        {event.archived_at ? (
          <p className="mt-4 max-w-xl text-[12px] italic leading-relaxed text-faint">
            ☞ {t.events.archivedNote}
          </p>
        ) : null}

        {event.status === 'pending' ? (
          <form action={postponeEventAction} className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-2">
            <input type="hidden" name="eventId" value={event.id} />
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.08em] text-faint">
                {t.event.postponeLabel}
              </span>
              <input
                name="until"
                type="datetime-local"
                required
                className="mt-1 block border border-line bg-panel px-3 py-1.5 text-[12px]"
              />
            </label>
            <SubmitButton pendingLabel={t.actions.processing} doneLabel={t.event.postponed}>
              {t.event.postpone}
            </SubmitButton>
          </form>
        ) : null}

        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-[12px] sm:grid-cols-4">
          <Field label={t.event.received} value={formatTimestamp(event.received_at, lang)} />
          <Field
            label={t.event.delivered}
            value={event.delivered_at ? formatTimestamp(event.delivered_at, lang) : '—'}
          />
          <Field label={t.event.attempts} value={String(event.attempt_count)} />
          <Field
            label={event.status === 'pending' ? t.event.nextAttempt : t.event.lastError}
            value={
              event.status === 'pending'
                ? timeAgo(event.next_attempt_at, lang)
                : (event.last_error ?? '—')
            }
          />
        </dl>
      </Section>

      <Section>
        <SectionTitle>{t.event.attemptsTitle}</SectionTitle>
        {attempts.length === 0 ? (
          <div className="px-6 py-8 text-center font-serif text-[14px] italic text-faint">
            {t.event.noAttempts}
          </div>
        ) : (
          <ol className="divide-y divide-line-soft">
            {attempts.map((attempt) => (
              <AttemptRow key={attempt.id} attempt={attempt} lang={lang} />
            ))}
          </ol>
        )}
      </Section>

      <Section>
        <SectionTitle>{t.event.payloadTitle}</SectionTitle>
        <pre className="overflow-x-auto px-6 py-4 font-mono text-[12px] leading-relaxed text-muted">
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </Section>
    </Sheet>
  )
}

function AttemptRow({ attempt, lang }: { attempt: Attempt; lang: Lang }) {
  const t = dict[lang]
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
        {attempt.status_code ? `HTTP ${attempt.status_code}` : t.event.noResponse}
      </span>
      <span className="text-[12px] text-faint">{formatTimestamp(attempt.started_at, lang)}</span>
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
