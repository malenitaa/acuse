import type { NextRequest } from 'next/server'
import { drainQueue } from '@/lib/delivery'

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
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'no autorizado' }, { status: 401 })
  }

  const summary = await drainQueue()
  return Response.json(summary)
}
