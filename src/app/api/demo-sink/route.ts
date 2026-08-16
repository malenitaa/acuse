import type { NextRequest } from 'next/server'

/**
 * A stand-in for a customer's real destination, used only by the demo data.
 *
 * Real integrations fail in specific, boring ways: a server that is down, one
 * that is flaky and recovers, one that hangs. This reproduces those on demand
 * so the console shows a believable day instead of a green wall of nothing.
 *
 *   ?mode=ok                  always accepts
 *   ?mode=recover&after=3     refuses until the 3rd attempt, then accepts
 *   ?mode=down                never accepts
 *   ?mode=slow                hangs past the delivery timeout
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') ?? 'ok'
  const attempt = Number(request.headers.get('acuse-attempt') ?? '1')

  if (mode === 'slow') {
    await new Promise((resolve) => setTimeout(resolve, 15_000))
    return Response.json({ ok: true })
  }

  if (mode === 'down') {
    return Response.json(
      { error: 'upstream connection refused' },
      { status: 502, statusText: 'Bad Gateway' },
    )
  }

  if (mode === 'recover') {
    const after = Number(url.searchParams.get('after') ?? '3')
    if (attempt < after) {
      return Response.json(
        { error: 'database is starting up', retry_after: 30 },
        { status: 503 },
      )
    }
  }

  return Response.json({ ok: true, accepted_attempt: attempt })
}
