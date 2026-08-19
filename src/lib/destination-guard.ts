/**
 * Validation for outbound delivery URLs (OWASP A10, SSRF).
 *
 * Single-tenant reality check: the operator configures their own
 * destinations, and delivering to internal services is a legitimate use of a
 * self-hosted gateway ("your webhooks never leave your network"). So private
 * addresses are allowed by default and only the URL scheme is always
 * enforced. An instance exposed to untrusted operators should set
 * BLOCK_PRIVATE_DESTINATIONS=1, which refuses loopback/private/link-local
 * hosts outright.
 */

const PRIVATE_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /\.local$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, // link-local / cloud metadata neighborhood
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i, // IPv6 unique-local
  /^\[?fe80:/i, // IPv6 link-local
]

export function isPrivateHost(hostname: string): boolean {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))
}

export function checkDestination(rawUrl: string): { ok: true } | { ok: false; reason: string } {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return { ok: false, reason: 'invalid destination: not a URL' }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: `invalid destination: scheme ${url.protocol} not allowed` }
  }

  if (process.env.BLOCK_PRIVATE_DESTINATIONS === '1' && isPrivateHost(url.hostname)) {
    return { ok: false, reason: 'destination blocked: private address (BLOCK_PRIVATE_DESTINATIONS)' }
  }

  return { ok: true }
}
