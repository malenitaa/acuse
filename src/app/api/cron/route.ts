import { timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { drainQueue } from '@/lib/delivery'
import { archiveOldEvents } from '@/lib/retention'

export const dynamic = 'force-dynamic'

/**
 * One pass over the delivery queue. Vercel Cron calls this every minute with
 * `Authorization: Bearer $CRON_SECRET`.
 *
 * It is safe to call concurrently: workers claim events with `for update skip
 * locked`, so two overlapping runs split the queue instead of double-sending.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const given = request.headers.get('authorization') ?? ''
    const expected = `Bearer ${secret}`
    // Constant-time comparison: a plain !== leaks how many leading
    // characters matched through response timing.
    const a = Buffer.from(given)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const summary = await drainQueue()
  const archived = await archiveOldEvents()
  return Response.json({ ...summary, archived })
}
