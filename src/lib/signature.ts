import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Delivery signatures implementing the Standard Webhooks spec
 * (https://www.standardwebhooks.com): HMAC-SHA256 over `id.timestamp.body`,
 * sent as `webhook-signature: v1,<base64>` alongside `webhook-id` and
 * `webhook-timestamp`. Destinations can verify Acuse deliveries with any
 * Standard Webhooks library (Svix's included) or with `verifySignature`
 * below, kept here as executable documentation.
 *
 * Secrets: new ones are generated spec-style (`whsec_` + base64 key). Plain
 * strings are also accepted as raw UTF-8 keys, so older rows keep verifying.
 */

function secretBytes(secret: string): Buffer {
  if (secret.startsWith('whsec_')) return Buffer.from(secret.slice(6), 'base64')
  return Buffer.from(secret, 'utf8')
}

/** Spec-recommended size: 24 random bytes, base64, `whsec_` prefix. */
export function newSigningSecret(): string {
  return `whsec_${randomBytes(24).toString('base64')}`
}

export function sign(secret: string, id: string, timestamp: number, body: string): string {
  const digest = createHmac('sha256', secretBytes(secret))
    .update(`${id}.${timestamp}.${body}`)
    .digest('base64')
  return `v1,${digest}`
}

export function verifySignature(
  secret: string,
  headers: { id: string; timestamp: string | number; signature: string },
  body: string,
  options: { toleranceSeconds?: number; nowSeconds?: number } = {},
): boolean {
  const timestamp = Number(headers.timestamp)
  if (!Number.isInteger(timestamp)) return false

  const tolerance = options.toleranceSeconds ?? 300
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > tolerance) return false

  const expected = sign(secret, headers.id, timestamp, body)
  const wanted = Buffer.from(expected)

  // The header is a space-delimited list; any matching v1 signature accepts.
  return headers.signature.split(' ').some((candidate) => {
    const given = Buffer.from(candidate.trim())
    return given.length === wanted.length && timingSafeEqual(given, wanted)
  })
}
