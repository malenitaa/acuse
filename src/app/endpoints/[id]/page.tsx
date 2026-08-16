import Link from 'next/link'
import { notFound } from 'next/navigation'
import { toggleEndpointAction } from '@/app/actions'
import { CopyButton } from '@/components/copy-button'
import { SecretLine } from '@/components/secret-line'
import {
  BackStrip,
  Empty,
  HealthBadge,
  Section,
  SectionTitle,
  Sheet,
  StatusPill,
  SubmitButton,
  Totals,
} from '@/components/ui'
import { formatPercent, timeAgo, truncate } from '@/lib/format'
import { dict } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import { retryScheduleLabels } from '@/lib/retry'
import { getEndpoint, listEvents } from '@/lib/stats'
import { SendEventForm } from './send-event-form'

export const dynamic = 'force-dynamic'

export default async function EndpointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [lang, endpoint] = await Promise.all([getLang(), getEndpoint(id)])
  if (!endpoint) notFound()
  const t = dict[lang]

  const events = await listEvents({ endpointId: endpoint.id, limit: 40 })
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const ingestUrl = `${appUrl}/api/i/${endpoint.ingest_key}`
  const schedule = retryScheduleLabels(endpoint.max_attempts)

  return (
    <Sheet>
      <BackStrip href="/">{t.events.back}</BackStrip>

      <Section className="px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-tight">{endpoint.name}</h1>
            <div className="mt-1.5">
              <HealthBadge health={endpoint.health} lang={lang} />
            </div>
          </div>
          <form action={toggleEndpointAction}>
            <input type="hidden" name="endpointId" value={endpoint.id} />
            <SubmitButton pendingLabel={t.actions.processing} doneLabel={t.actions.done}>
              {endpoint.paused ? t.actions.resume : t.actions.pause}
            </SubmitButton>
          </form>
        </div>

        <div className="mt-5 space-y-3">
          <UrlLine
            label={t.endpoint.ingestLabel}
            action={
              <CopyButton text={ingestUrl} label={t.actions.copy} doneLabel={t.actions.copied} />
            }
          >
            {ingestUrl}
          </UrlLine>
          <UrlLine label={t.endpoint.deliverLabel}>{endpoint.destination_url}</UrlLine>
          <SecretLine
            secret={endpoint.signing_secret}
            labels={{
              label: t.endpoint.secretLabel,
              help: t.endpoint.secretHelp,
              reveal: t.actions.reveal,
              hide: t.actions.hide,
              copy: t.actions.copy,
              copied: t.actions.copied,
            }}
          />
        </div>

        <p className="mt-5 text-[12px] italic leading-relaxed text-faint">
          {t.endpoint.retrySentence(endpoint.max_attempts, schedule.join(' · '))}
        </p>
      </Section>

      <Totals
        lang={lang}
        items={[
          { label: t.endpoint.received, value: endpoint.total },
          {
            label: t.endpoint.delivered,
            value: endpoint.delivered,
            hint: formatPercent(endpoint.delivered, endpoint.total),
            tone: 'good',
          },
          { label: t.endpoint.rescued, value: endpoint.recovered, tone: 'good' },
          {
            label: t.endpoint.dead,
            value: endpoint.dead,
            tone: endpoint.dead > 0 ? 'bad' : 'neutral',
          },
        ]}
      />

      <Section className="px-6 py-5">
        <h2 className="font-serif text-[16px] font-semibold tracking-tight">
          {t.sendEvent.title}
        </h2>
        <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-muted">{t.sendEvent.intro}</p>
        <SendEventForm endpointId={endpoint.id} lang={lang} />
      </Section>

      <Section>
        <SectionTitle>{t.endpoint.eventsTitle}</SectionTitle>
        {events.length === 0 ? (
          <Empty>{t.endpoint.empty}</Empty>
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
                      {truncate(event.id, 16)}
                    </Link>
                  </td>
                  <td className="px-6 py-2.5">
                    <StatusPill status={event.status} attempts={event.attempt_count} lang={lang} />
                  </td>
                  <td className="tnum px-6 py-2.5 text-right font-mono text-[12px] text-faint">
                    {t.endpoint.attemptsShort(event.attempt_count)}
                  </td>
                  <td className="px-6 py-2.5 text-right text-faint">
                    {timeAgo(event.received_at, lang)}
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

function UrlLine({
  label,
  action,
  children,
}: {
  label: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="text-[11px] uppercase tracking-[0.08em] text-faint">{label}</div>
        {action}
      </div>
      <code className="mt-1 block overflow-x-auto border border-line-soft bg-panel-2 px-3 py-2 font-mono text-[12px] text-accent">
        {children}
      </code>
    </div>
  )
}
