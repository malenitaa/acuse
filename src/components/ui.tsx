import Link from 'next/link'
import { formatNumber } from '@/lib/format'
import type { EndpointHealth, EventStatus } from '@/lib/types'

export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-lg border border-line bg-panel ${className}`}>{children}</section>
  )
}

export function PanelTitle({
  children,
  aside,
}: {
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-3">
      <h2 className="text-[13px] font-semibold tracking-tight">{children}</h2>
      {aside}
    </div>
  )
}

export function Stat({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: number | string
  hint?: string
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}) {
  const toneClass = {
    neutral: 'text-text',
    good: 'text-good',
    warn: 'text-warn',
    bad: 'text-bad',
  }[tone]

  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3.5">
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className={`tnum mt-1.5 text-2xl font-semibold ${toneClass}`}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      {hint ? <div className="mt-0.5 text-[12px] text-faint">{hint}</div> : null}
    </div>
  )
}

const STATUS_STYLES: Record<EventStatus, { label: string; className: string }> = {
  delivered: { label: 'entregado', className: 'border-good/30 bg-good/10 text-good' },
  pending: { label: 'reintentando', className: 'border-warn/30 bg-warn/10 text-warn' },
  dead: { label: 'sin entregar', className: 'border-bad/30 bg-bad/10 text-bad' },
}

export function StatusPill({ status, attempts }: { status: EventStatus; attempts?: number }) {
  const style = STATUS_STYLES[status]
  const label =
    status === 'pending' && attempts === 0 ? 'en cola' : style.label

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {label}
    </span>
  )
}

const HEALTH_STYLES: Record<EndpointHealth['health'], { label: string; dot: string; text: string }> =
  {
    healthy: { label: 'sano', dot: 'bg-good', text: 'text-good' },
    degraded: { label: 'inestable', dot: 'bg-warn', text: 'text-warn' },
    down: { label: 'caído', dot: 'bg-bad', text: 'text-bad' },
    idle: { label: 'sin tráfico', dot: 'bg-faint', text: 'text-faint' },
  }

export function HealthBadge({ health }: { health: EndpointHealth['health'] }) {
  const style = HEALTH_STYLES[health]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${style.text}`}>
      <span aria-hidden className={`inline-block size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}

export function SubmitButton({
  children,
  variant = 'ghost',
}: {
  children: React.ReactNode
  variant?: 'ghost' | 'primary'
}) {
  const variantClass =
    variant === 'primary'
      ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
      : 'border-line bg-panel-2 text-muted hover:border-line hover:text-text'

  return (
    <button
      type="submit"
      className={`cursor-pointer rounded-md border px-3 py-1.5 text-[12px] font-medium transition ${variantClass}`}
    >
      {children}
    </button>
  )
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[12px] text-faint transition hover:text-muted">
      ← {children}
    </Link>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-10 text-center text-[13px] text-faint">{children}</div>
}
