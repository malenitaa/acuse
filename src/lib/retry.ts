export const RETRY_BASE_MS = 5_000
export const RETRY_FACTOR = 3
export const RETRY_CAP_MS = 60 * 60 * 1000
export const DELIVERY_TIMEOUT_MS = 10_000

/**
 * Exponential backoff with ±15% jitter: 5s, 15s, 45s, 2m15, 6m45, 20m, 1h, 1h.
 *
 * The jitter matters more than it looks. When a destination comes back up,
 * every event queued against it would otherwise fire in the same instant and
 * knock it straight back down.
 */
export function backoffMs(attemptNumber: number): number {
  const raw = Math.min(RETRY_BASE_MS * RETRY_FACTOR ** (attemptNumber - 1), RETRY_CAP_MS)
  const jitter = raw * 0.3 * (Math.random() - 0.5)
  return Math.round(raw + jitter)
}

/** Human-readable version of the schedule above, for the UI. */
export function retryScheduleLabels(maxAttempts: number): string[] {
  const labels: string[] = []
  for (let n = 1; n < maxAttempts; n++) {
    const ms = Math.min(RETRY_BASE_MS * RETRY_FACTOR ** (n - 1), RETRY_CAP_MS)
    labels.push(formatDuration(ms))
  }
  return labels
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60
  if (minutes < 60) return restSeconds ? `${minutes}m ${restSeconds}s` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60
  return restMinutes ? `${hours}h ${restMinutes}m` : `${hours}h`
}
