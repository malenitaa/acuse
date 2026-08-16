import { NextResponse, type NextRequest } from 'next/server'

/**
 * Optional console lock (OWASP A01, broken access control). Setting
 * CONSOLE_PASSWORD turns on HTTP Basic Auth for the operator console. The
 * machine endpoints keep their own protections and stay out of the matcher:
 * ingest is public by design, cron checks CRON_SECRET, demo-sink is a demo
 * target. Without the variable, behavior is unchanged (open console for
 * local demos) — the README tells deployers to set it.
 */

/** Constant-time-ish comparison; the edge runtime has no timingSafeEqual. */
function safeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length)
  let diff = a.length === b.length ? 0 : 1
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

export function proxy(request: NextRequest) {
  const password = process.env.CONSOLE_PASSWORD
  if (!password) return NextResponse.next()

  const header = request.headers.get('authorization') ?? ''
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6))
      const given = decoded.slice(decoded.indexOf(':') + 1)
      if (safeEqual(given, password)) return NextResponse.next()
    } catch {
      // Malformed base64: fall through to the challenge.
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'www-authenticate': 'Basic realm="acuse console"' },
  })
}

export const config = {
  matcher: [
    // Everything except: ingest, cron, demo-sink, static assets.
    '/((?!api/i/|api/cron|api/demo-sink|_next/|favicon).*)',
  ],
}
