import { randomBytes } from 'node:crypto'
import pg from 'pg'

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'

const ALPHABET = '0123456789abcdefghijkmnopqrstuvwxyz'

function newId(prefix: string, length = 18): string {
  let out = ''
  for (const byte of randomBytes(length)) out += ALPHABET[byte % ALPHABET.length]
  return `${prefix}_${out}`
}

/**
 * Three integrations covering the three states an operator actually cares
 * about: one that works, one that fails and recovers, one that is simply down.
 */
const ENDPOINTS = [
  {
    name: 'Tienda online → ERP',
    sink: 'mode=ok',
    maxAttempts: 8,
    share: 0.6,
  },
  {
    name: 'Formularios web → CRM',
    // Refuses the first attempt, accepts the second. This is the endpoint that
    // produces the rescued number on the dashboard.
    sink: 'mode=recover&after=2',
    maxAttempts: 8,
    share: 0.3,
  },
  {
    name: 'Facturación → Contabilidad',
    sink: 'mode=down',
    // Short budget so the demo reaches "sin entregar" in about a minute
    // instead of an hour.
    maxAttempts: 4,
    share: 0.1,
  },
]

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

await client.query('truncate attempts, events, endpoints cascade')

for (const endpoint of ENDPOINTS) {
  await client.query(
    `insert into endpoints (id, name, ingest_key, destination_url, signing_secret, max_attempts)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      newId('ep'),
      endpoint.name,
      newId('ik', 20),
      `${APP_URL}/api/demo-sink?${endpoint.sink}`,
      randomBytes(24).toString('hex'),
      endpoint.maxAttempts,
    ],
  )
  console.log(`  ✓ ${endpoint.name}`)
}

await client.end()
console.log(`\n${ENDPOINTS.length} integraciones creadas. Ahora: npm run simulate`)
