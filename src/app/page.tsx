import Link from 'next/link'
import { processQueueAction } from './actions'
import { AutoRefresh } from '@/components/auto-refresh'
import { PanelSections } from '@/components/panel-sections'
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
import { dict, type Lang } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import { getEndpointHealth, getNextRetryAt, getStats, listEvents } from '@/lib/stats'
import type { Stats } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [lang, stats, endpoints, events, nextRetryAt] = await Promise.all([
    getLang(),
    getStats(),
    getEndpointHealth(),
    listEvents({ limit: 12 }),
    getNextRetryAt(),
  ])
  const t = dict[lang]

  const broken = endpoints.filter((endpoint) => endpoint.health === 'down')

  const numberSection = (
    <div className="divide-y divide-line">
      <Headline stats={stats} lang={lang} />
      {broken.length > 0 ? <MarginNote names={broken.map((e) => e.name)} lang={lang} /> : null}
    </div>
  )

  const totalsSection = (
    <Totals
        lang={lang}
        items={[
          { label: t.dashboard.received, value: stats.received },
          {
            label: t.dashboard.delivered,
            value: stats.delivered,
            hint: t.dashboard.ofTotal(formatPercent(stats.delivered, stats.received)),
            tone: 'good',
          },
          {
            label: t.dashboard.retrying,
            value: stats.retrying,
            hint: nextRetryAt
              ? t.dashboard.nextRetry(timeAgo(nextRetryAt, lang))
              : t.dashboard.queueEmpty,
            tone: stats.retrying > 0 ? 'warn' : 'neutral',
          },
          {
            label: t.dashboard.dead,
            value: stats.dead,
            hint: stats.dead > 0 ? t.dashboard.needHuman : t.dashboard.none,
            tone: stats.dead > 0 ? 'bad' : 'neutral',
          },
        ]}
      />
  )

  const integrationsSection = (
      <Section>
        <SectionTitle
          aside={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="/endpoints/new"
                className="text-[12px] text-accent transition-colors hover:text-text"
              >
                {t.newEndpoint.dashboardLink}
              </Link>
              <form action={processQueueAction}>
                <SubmitButton
                  variant="primary"
                  pendingLabel={t.actions.processing}
                  doneLabel={t.actions.recorded}
                >
                  {t.actions.processQueue}
                </SubmitButton>
              </form>
            </div>
          }
        >
          {t.dashboard.integrations}
        </SectionTitle>
        {endpoints.length === 0 ? (
          <Onboarding lang={lang} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="text-[11px] uppercase tracking-[0.08em] text-faint">
                <tr className="border-b border-line-soft">
                  <th className="px-6 py-2 text-left font-medium">{t.dashboard.colName}</th>
                  <th className="px-6 py-2 text-left font-medium">{t.dashboard.colStatus}</th>
                  <th className="px-6 py-2 text-right font-medium">{t.dashboard.colReceived}</th>
                  <th className="px-6 py-2 text-right font-medium">{t.dashboard.colRescued}</th>
                  <th className="px-6 py-2 text-right font-medium">{t.dashboard.colDead}</th>
                  <th className="px-6 py-2 text-right font-medium">
                    {t.dashboard.colLastDelivery}
                  </th>
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
                        <span className="ml-2 text-[11px] italic text-faint">
                          {t.dashboard.paused}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-2.5">
                      <HealthBadge health={endpoint.health} lang={lang} />
                    </td>
                    <td className="tnum px-6 py-2.5 text-right font-mono text-[12px] text-muted">
                      {formatNumber(endpoint.total, lang)}
                    </td>
                    <td className="tnum px-6 py-2.5 text-right font-mono text-[12px] text-good">
                      {endpoint.recovered > 0 ? formatNumber(endpoint.recovered, lang) : '—'}
                    </td>
                    <td className="tnum px-6 py-2.5 text-right font-mono text-[12px]">
                      <span className={endpoint.dead > 0 ? 'text-bad' : 'text-faint'}>
                        {endpoint.dead > 0 ? formatNumber(endpoint.dead, lang) : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 text-right text-faint">
                      {timeAgo(endpoint.last_delivered_at, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
  )

  const latestSection = (
      <Section>
        <SectionTitle
          aside={
            <Link href="/events" className="text-[12px] text-faint transition-colors hover:text-muted">
              {t.dashboard.viewAll}
            </Link>
          }
        >
          {t.dashboard.latestEvents}
        </SectionTitle>
        {events.length === 0 ? (
          <Empty>
            {t.dashboard.emptyEvents} <code className="font-mono">npm run simulate</code>.
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
                      <StatusPill status={event.status} attempts={event.attempt_count} lang={lang} />
                    </td>
                    <td className="tnum px-6 py-2.5 text-right text-faint">
                      {t.dashboard.attempts(event.attempt_count)}
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
  )

  return (
    <Sheet>
      <AutoRefresh />
      <PanelSections
        customizeLabel={t.dashboard.customize}
        labels={{
          number: t.dashboard.sectionNumber,
          totals: t.dashboard.sectionTotals,
          integrations: t.dashboard.integrations,
          latest: t.dashboard.latestEvents,
        }}
        sections={{
          number: numberSection,
          totals: totalsSection,
          integrations: integrationsSection,
          latest: latestSection,
        }}
      />
    </Sheet>
  )
}

/**
 * The one number the whole product exists to produce. Everything else on the
 * sheet is evidence that this number is real.
 */
function Headline({ stats, lang }: { stats: Stats; lang: Lang }) {
  const t = dict[lang]
  return (
    <Section className="px-6 py-7">
      <p className="font-serif text-[15px] italic text-muted">{t.dashboard.headline}</p>
      <div className="tnum mt-1 font-serif text-6xl font-semibold text-good">
        {formatNumber(stats.recovered, lang)}
      </div>
      <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-muted">
        {t.dashboard.headlineDesc(formatNumber(stats.recovered, lang))}
      </p>
      {stats.received > 0 ? <CompositionBar stats={stats} lang={lang} /> : null}
    </Section>
  )
}

/**
 * Every event received, split by how it ended. The rescued number needs a
 * denominator to mean anything — and the events still unlanded belong in the
 * same picture, or the bar flatters the product.
 */
function CompositionBar({ stats, lang }: { stats: Stats; lang: Lang }) {
  const t = dict[lang]
  const segments = [
    { key: 'firstTry', value: stats.firstTry, label: t.dashboard.barFirstTry, bar: 'bg-good/35' },
    { key: 'recovered', value: stats.recovered, label: t.dashboard.barRescued, bar: 'bg-good' },
    { key: 'pending', value: stats.pending, label: t.dashboard.barRetrying, bar: 'bg-warn' },
    { key: 'dead', value: stats.dead, label: t.dashboard.barDead, bar: 'bg-bad' },
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

/**
 * What a fresh install shows instead of an empty table: the three steps of
 * the whole product, in the operator's language, with the door to step one.
 * The npm hint stays as a smaller aside for people evaluating the demo.
 */
function Onboarding({ lang }: { lang: Lang }) {
  const t = dict[lang].onboarding
  return (
    <div className="px-6 py-8">
      <h3 className="font-serif text-[16px] font-semibold">{t.title}</h3>
      <ol className="mt-4 max-w-xl list-decimal space-y-3 pl-5 text-[13px] leading-relaxed text-muted">
        <li>{t.step1}</li>
        <li>{t.step2}</li>
        <li>{t.step3}</li>
      </ol>
      <Link
        href="/endpoints/new"
        className="mt-5 inline-block border border-text px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-text hover:text-panel"
      >
        {t.cta}
      </Link>
      <p className="mt-5 text-[11px] italic text-faint">
        {t.demoHint} <code className="font-mono not-italic">npm run seed && npm run simulate</code>
      </p>
    </div>
  )
}

/** A broken integration is an annotation on the record, not an app banner. */
function MarginNote({ names, lang }: { names: string[]; lang: Lang }) {
  const t = dict[lang]
  return (
    <div className="note-enter px-6 py-3">
      <p className="text-[13px] leading-relaxed">
        <span className="font-semibold text-bad">
          ☞{' '}
          {names.length === 1
            ? t.dashboard.noteOne(names[0])
            : t.dashboard.noteMany(names.length, names.join(', '))}
        </span>{' '}
        <span className="italic text-muted">{t.dashboard.noteTail}</span>
      </p>
    </div>
  )
}
