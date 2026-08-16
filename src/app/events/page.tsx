import Link from 'next/link'
import { unarchiveEventAction } from '@/app/actions'
import { BackStrip, Empty, Section, SectionTitle, Sheet, StatusPill, SubmitButton } from '@/components/ui'
import { timeAgo, truncate } from '@/lib/format'
import { dict } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import { listEvents } from '@/lib/stats'

export const dynamic = 'force-dynamic'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'all' } = await searchParams
  const [lang, events] = await Promise.all([getLang(), listEvents({ status, limit: 200 })])
  const t = dict[lang]

  const filters = [
    { value: 'all', label: t.events.filterAll },
    { value: 'pending', label: t.events.filterPending },
    { value: 'dead', label: t.events.filterDead },
    { value: 'delivered', label: t.events.filterDelivered },
    { value: 'archived', label: t.events.filterArchived },
  ]
  const showingArchive = status === 'archived'

  return (
    <Sheet>
      <BackStrip href="/">{t.events.back}</BackStrip>

      <Section>
        <SectionTitle
          aside={
            <div className="flex gap-3">
              {filters.map((filter) => (
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
          {t.events.title}
        </SectionTitle>

        {events.length === 0 ? (
          <Empty>{t.events.empty}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
            <thead className="text-[11px] uppercase tracking-[0.08em] text-faint">
              <tr className="border-b border-line-soft">
                <th className="px-6 py-2 text-left font-medium">{t.events.colEvent}</th>
                <th className="px-6 py-2 text-left font-medium">{t.events.colIntegration}</th>
                <th className="px-6 py-2 text-left font-medium">{t.events.colStatus}</th>
                <th className="px-6 py-2 text-right font-medium">{t.events.colAttempts}</th>
                <th className="px-6 py-2 text-right font-medium">{t.events.colReceived}</th>
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
                    <StatusPill status={event.status} attempts={event.attempt_count} lang={lang} />
                  </td>
                  <td className="tnum px-6 py-2.5 text-right font-mono text-[12px] text-faint">
                    {event.attempt_count}
                  </td>
                  <td className="px-6 py-2.5 text-right text-faint">
                    {timeAgo(event.received_at, lang)}
                  </td>
                  {showingArchive ? (
                    <td className="px-6 py-2.5 text-right">
                      <form action={unarchiveEventAction}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <SubmitButton
                          pendingLabel={dict[lang].actions.processing}
                          doneLabel={t.events.restored}
                        >
                          {t.events.restore}
                        </SubmitButton>
                      </form>
                    </td>
                  ) : null}
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
