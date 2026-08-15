import { randomBytes } from 'node:crypto'

const ALPHABET = '0123456789abcdefghijkmnopqrstuvwxyz' // no "l", it reads as "1"

/** Prefixed, URL-safe, sortable-by-eye ids: `evt_9k3fq2...`. */
export function newId(prefix: string, length = 18): string {
  const bytes = randomBytes(length)
  let out = ''
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length]
  return `${prefix}_${out}`
}
