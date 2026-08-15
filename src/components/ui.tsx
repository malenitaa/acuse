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
  return <section className={`border border-line bg-panel ${className}`}>{children}</section>
}

export function PanelTitle({
  children,
  aside,
}: {
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-3 border-double border-line px-5 py-3">
      <h2 className="font-serif text-[15px] font-semibold tracking-tight">{children}</h2>
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
    <div className="border border-line bg-panel px-4 py-3.5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-faint">{label}</div>
      <div className={`tnum mt-1.5 font-mono text-2xl font-medium ${toneClass}`}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      {hint ? <div className="mt-0.5 text-[12px] text-faint">{hint}</div> : null}
    </div>
  )
}

const STATUS_STYLES: Record<EventStatus, { label: string; className: string }> = {
  delivered: { label: 'entregado', className: 'border-good/70 text-good' },
  pending: { label: 'reintentando', className: 'border-warn/70 text-warn' },
  dead: { label: 'sin entregar', className: 'border-bad/70 text-bad' },
}

/** Rendered as a rubber stamp: bordered, uppercase, no fill. */
export function StatusPill({ status, attempts }: { status: EventStatus; attempts?: number }) {
  const style = STATUS_STYLES[status]
  const label = status === 'pending' && attempts === 0 ? 'en cola' : style.label

  return (
    <span
      className={`inline-flex items-center border px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.1em] ${style.className}`}
    >
      {label}
    </span>
  )
}

const HEALTH_STYLES: Record<EndpointHealth['health'], { label: string; text: string }> = {
  healthy: { label: 'sano', text: 'text-good' },
  degraded: { label: 'inestable', text: 'text-warn' },
  down: { label: 'caído', text: 'text-bad' },
  idle: { label: 'sin tráfico', text: 'text-faint' },
}

export function HealthBadge({ health }: { health: EndpointHealth['health'] }) {
  const style = HEALTH_STYLES[health]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${style.text}`}>
      <span aria-hidden className="inline-block size-1.5 bg-current" />
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
      ? 'border-text bg-text text-panel hover:bg-transparent hover:text-text'
      : 'border-line text-muted hover:border-text hover:text-text'

  return (
    <button
      type="submit"
      className={`cursor-pointer border px-3 py-1.5 text-[12px] font-medium transition ${variantClass}`}
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
  return (
    <div className="px-5 py-10 text-center font-serif text-[14px] italic text-faint">
      {children}
    </div>
  )
}
