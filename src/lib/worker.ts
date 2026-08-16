import { drainQueue } from './delivery'

const INTERVAL_MS = 30_000

// The dev server re-evaluates modules on edit; the flag on globalThis keeps
// a single ticker alive instead of stacking one per reload.
const globalForWorker = globalThis as unknown as { acuseWorkerStarted?: boolean }

/**
 * Embedded delivery worker, for self-hosted deployments where there is no
 * external cron (Docker, a bare server, someone's laptop). One pass every 30
 * seconds; overlapping passes are safe because events are claimed with
 * `FOR UPDATE SKIP LOCKED`. On Vercel this stays off — serverless processes
 * do not stay alive between requests, so Vercel Cron does the ticking there.
 */
export function startEmbeddedWorker() {
  if (globalForWorker.acuseWorkerStarted) return
  globalForWorker.acuseWorkerStarted = true

  console.log(`[acuse] embedded worker: draining the queue every ${INTERVAL_MS / 1000}s`)
  setInterval(async () => {
    try {
      const summary = await drainQueue()
      if (summary.claimed > 0) {
        console.log(
          `[acuse] worker pass: ${summary.claimed} claimed, ${summary.delivered} delivered, ${summary.failed} failed`,
        )
      }
    } catch (error) {
      console.error('[acuse] worker pass failed:', error)
    }
  }, INTERVAL_MS)
}
