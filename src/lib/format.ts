import type { Lang } from './i18n'

const LOCALES: Record<Lang, string> = { es: 'es-AR', en: 'en-US' }

const numberFormats: Record<Lang, Intl.NumberFormat> = {
  es: new Intl.NumberFormat(LOCALES.es),
  en: new Intl.NumberFormat(LOCALES.en),
}

export function formatNumber(value: number, lang: Lang = 'es'): string {
  return numberFormats[lang].format(value)
}

export function formatPercent(part: number, whole: number): string {
  if (whole === 0) return '—'
  return `${((part / whole) * 100).toFixed(1)}%`
}

const timeFormats: Record<Lang, Intl.DateTimeFormat> = Object.fromEntries(
  (Object.keys(LOCALES) as Lang[]).map((lang) => [
    lang,
    new Intl.DateTimeFormat(LOCALES[lang], {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  ]),
) as Record<Lang, Intl.DateTimeFormat>

export function formatTimestamp(value: Date | string | null, lang: Lang = 'es'): string {
  if (!value) return '—'
  return timeFormats[lang].format(new Date(value))
}

const RELATIVE = {
  es: {
    justNow: 'recién',
    inAMoment: 'en un momento',
    ago: (amount: number, unit: string) => `hace ${amount} ${unit}`,
    ahead: (amount: number, unit: string) => `en ${amount} ${unit}`,
    hour: (n: number) => (n === 1 ? 'hora' : 'horas'),
    day: (n: number) => (n === 1 ? 'día' : 'días'),
  },
  en: {
    justNow: 'just now',
    inAMoment: 'in a moment',
    ago: (amount: number, unit: string) => `${amount} ${unit} ago`,
    ahead: (amount: number, unit: string) => `in ${amount} ${unit}`,
    hour: (n: number) => (n === 1 ? 'hour' : 'hours'),
    day: (n: number) => (n === 1 ? 'day' : 'days'),
  },
} satisfies Record<Lang, unknown>

/** "hace 3 min" / "3 min ago". Rendered on the server, so it is a snapshot. */
export function timeAgo(value: Date | string | null, lang: Lang = 'es'): string {
  if (!value) return '—'
  const words = RELATIVE[lang]
  const deltaMs = new Date(value).getTime() - Date.now()
  const future = deltaMs > 0
  const seconds = Math.round(Math.abs(deltaMs) / 1000)

  const say = (amount: number, unit: string) =>
    future ? words.ahead(amount, unit) : words.ago(amount, unit)

  if (seconds < 10) return future ? words.inAMoment : words.justNow
  if (seconds < 60) return say(seconds, 's')
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return say(minutes, 'min')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return say(hours, words.hour(hours))
  const days = Math.round(hours / 24)
  return say(days, words.day(days))
}

export function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length)}…` : value
}
