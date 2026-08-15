const numberFormat = new Intl.NumberFormat('es-AR')

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatPercent(part: number, whole: number): string {
  if (whole === 0) return '—'
  return `${((part / whole) * 100).toFixed(1)}%`
}

const timeFormat = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function formatTimestamp(value: Date | string | null): string {
  if (!value) return '—'
  return timeFormat.format(new Date(value))
}

/** "hace 3 min" / "en 45 s". Rendered on the server, so it is a snapshot. */
export function timeAgo(value: Date | string | null): string {
  if (!value) return '—'
  const deltaMs = new Date(value).getTime() - Date.now()
  const future = deltaMs > 0
  const seconds = Math.round(Math.abs(deltaMs) / 1000)

  const say = (amount: number, unit: string) =>
    future ? `en ${amount} ${unit}` : `hace ${amount} ${unit}`

  if (seconds < 10) return future ? 'en un momento' : 'recién'
  if (seconds < 60) return say(seconds, 's')
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return say(minutes, 'min')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return say(hours, hours === 1 ? 'hora' : 'horas')
  const days = Math.round(hours / 24)
  return say(days, days === 1 ? 'día' : 'días')
}

export function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length)}…` : value
}
