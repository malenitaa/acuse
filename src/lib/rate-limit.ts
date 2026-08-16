/**
 * Fixed-window rate limit for the ingest endpoint (OWASP A04, resource
 * abuse). In-memory on purpose: acuse is single-process by design, and a
 * limiter that survives restarts would need infrastructure the product
 * doesn't otherwise want. Generous default: webhooks are bursty, and a 429
 * tells well-behaved senders to retry later — they all do.
 */

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = Number(process.env.INGEST_MAX_PER_MINUTE ?? 600)
const MAX_TRACKED_KEYS = 10_000

type Window = { startedAt: number; count: number }

const globalForLimiter = globalThis as unknown as { acuseIngestWindows?: Map<string, Window> }
const windows = (globalForLimiter.acuseIngestWindows ??= new Map<string, Window>())

export function allowIngest(key: string): boolean {
  const now = Date.now()
  const current = windows.get(key)

  if (!current || now - current.startedAt >= WINDOW_MS) {
    // A full map of stale windows would grow forever under key scanning;
    // resetting it wholesale is crude but bounded and harmless.
    if (windows.size >= MAX_TRACKED_KEYS) windows.clear()
    windows.set(key, { startedAt: now, count: 1 })
    return true
  }

  current.count += 1
  return current.count <= MAX_PER_WINDOW
}
