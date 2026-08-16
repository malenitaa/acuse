import Link from 'next/link'
import { formatNumber } from '@/lib/format'
import { dict, type Lang } from '@/lib/i18n'
import type { EndpointHealth, EventStatus } from '@/lib/types'

/**
 * Pages are vertical stacks of ruled sections on the sheet, never floating
 * cards. Sheet wraps a page; Section is one ruled band inside it.
 */
export function Sheet({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-line">{children}</div>
}

export function Section({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={className}>{children}</section>
}

export function SectionTitle({
  children,
  aside,
}: {
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft px-6 pb-3 pt-5">
      <h2 className="font-serif text-[16px] font-semibold tracking-tight">{children}</h2>
      {aside}
    </div>
  )
}

export type TotalItem = {
  label: string
  value: number | string
  hint?: string
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}

const TONE_TEXT = {
  neutral: 'text-text',
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
}

/** Ledger totals: label, dot leader, figure, the way a sum line is written.
 * Columns follow the container (the theme decides how wide that is), not the
 * viewport: 2-up on the «libro» sheet, 4-up on the full-width «instrumento». */
export function Totals({ items, lang = 'es' }: { items: TotalItem[]; lang?: Lang }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-3 px-6 py-5 @2xl:grid-cols-2 @6xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-baseline gap-2 text-[13px]">
            <span className="text-muted">{item.label}</span>
            <span aria-hidden className="flex-1 border-b border-dotted border-line" />
            <span className={`tnum font-mono text-[15px] font-medium ${TONE_TEXT[item.tone ?? 'neutral']}`}>
              {typeof item.value === 'number' ? formatNumber(item.value, lang) : item.value}
            </span>
          </div>
          {item.hint ? (
            <div className="mt-0.5 text-right text-[11px] italic text-faint">{item.hint}</div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

const STATUS_STYLES: Record<EventStatus, string> = {
  delivered: 'border-good/70 text-good',
  pending: 'border-warn/70 text-warn',
  dead: 'border-bad/70 text-bad',
}

/** Rendered as a rubber stamp: bordered, uppercase, no fill. */
export function StatusPill({
  status,
  attempts,
  lang = 'es',
}: {
  status: EventStatus
  attempts?: number
  lang?: Lang
}) {
  const label =
    status === 'pending' && attempts === 0 ? dict[lang].status.queued : dict[lang].status[status]

  return (
    <span
      className={`pill inline-flex items-center border px-2 py-px font-mono text-[10px] uppercase tracking-[0.1em] ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  )
}

const HEALTH_STYLES: Record<EndpointHealth['health'], string> = {
  healthy: 'text-good',
  degraded: 'text-warn',
  down: 'text-bad',
  idle: 'text-faint',
}

export function HealthBadge({
  health,
  lang = 'es',
}: {
  health: EndpointHealth['health']
  lang?: Lang
}) {
  return (
    // Inline layout with vertical-align: middle: the spec centers the square
    // on baseline + half x-height, i.e. the optical middle of the lowercase
    // band, derived from font metrics instead of pixel nudges. Same technique
    // as the composition-bar legend.
    <span className={`text-[12px] font-medium ${HEALTH_STYLES[health]}`}>
      <span aria-hidden className="mr-1.5 inline-block size-1.5 align-middle bg-current" />
      {dict[lang].health[health]}
    </span>
  )
}

export { SubmitButton } from './submit-button'

/** Thin navigation strip at the top of inner pages. */
export function BackStrip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-2.5">
      <Link href={href} className="text-[12px] text-faint transition-colors hover:text-muted">
        ← {children}
      </Link>
    </div>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-10 text-center font-serif text-[14px] italic text-faint">
      {children}
    </div>
  )
}
