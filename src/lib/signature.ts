import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Delivery signatures, Stripe-style: the timestamp travels inside the signed
 * material, so a captured request cannot be replayed later, and the header
 * self-describes its version (`v1`) for future rotation.
 *
 * `verifySignature` is what a destination runs to accept only genuine,
 * recent deliveries — kept here as executable documentation of the scheme.
 */

export function sign(secret: string, timestamp: number, body: string): string {
  const digest = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  return `t=${timestamp},v1=${digest}`
}

export function verifySignature(
  secret: string,
  header: string,
  body: string,
  options: { toleranceSeconds?: number; nowSeconds?: number } = {},
): boolean {
  const match = /^t=(\d+),v1=([a-f0-9]{64})$/.exec(header)
  if (!match) return false

  const timestamp = Number(match[1])
  const tolerance = options.toleranceSeconds ?? 300
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > tolerance) return false

  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  const given = Buffer.from(match[2])
  const wanted = Buffer.from(expected)
  return given.length === wanted.length && timingSafeEqual(given, wanted)
}
