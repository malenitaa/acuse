import pg from 'pg'

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET ?? ''

function arg(name: string, fallback: number): number {
  const found = process.argv.find((value) => value.startsWith(`--${name}=`))
  return found ? Number(found.split('=')[1]) : fallback
}

const TOTAL_EVENTS = arg('events', 60)
const DRIVE_SECONDS = arg('seconds', 90)

// Rough share of traffic per integration, in seed order.
const SHARES = [0.6, 0.3, 0.1]

const FIRST_NAMES = ['Malena', 'Joaquín', 'Camila', 'Tomás', 'Sofía', 'Lucas', 'Valentina']
const LAST_NAMES = ['Villa', 'Fernández', 'Gómez', 'Suárez', 'Ríos', 'Paredes']
const PRODUCTS = ['Teclado 60%', 'Monitor 27"', 'Notebook 14"', 'Silla ergonómica', 'Webcam 4K']

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]
const money = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2))

function payloadFor(index: number) {
  const person = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
  const email = `${person.split(' ')[0].toLowerCase()}@ejemplo.com.ar`

  if (index === 0) {
    return {
      topic: 'orders/create',
      order: {
        id: 4800000 + Math.floor(Math.random() * 99999),
        total: money(15000, 320000),
        currency: 'ARS',
        customer: { name: person, email },
        line_items: [{ title: pick(PRODUCTS), quantity: 1 + Math.floor(Math.random() * 3) }],
      },
    }
  }

  if (index === 1) {
    return {
      form: 'contacto-comercial',
      submitted_at: new Date().toISOString(),
      fields: {
        nombre: person,
        email,
        empresa: `${pick(LAST_NAMES)} SRL`,
        mensaje: 'Quiero una demo para el equipo de operaciones.',
      },
    }
  }

  return {
    event: 'invoice.issued',
    invoice: {
      number: `A-0001-${String(10000 + Math.floor(Math.random() * 89999))}`,
      cuit: '30-71234567-8',
      net: money(50000, 900000),
      vat_rate: 0.21,
    },
  }
}

function chooseEndpointIndex(): number {
  const roll = Math.random()
  let cumulative = 0
  for (let i = 0; i < SHARES.length; i++) {
    cumulative += SHARES[i]
    if (roll <= cumulative) return i
  }
  return SHARES.length - 1
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
const { rows: endpoints } = await client.query<{ ingest_key: string; name: string }>(
  'select ingest_key, name from endpoints order by created_at asc',
)
await client.end()

if (endpoints.length === 0) {
  console.error('No hay integraciones. Corré primero: npm run seed')
  process.exit(1)
}

console.log(`Enviando ${TOTAL_EVENTS} eventos a ${APP_URL} ...`)

const sent = new Array(endpoints.length).fill(0)

for (let i = 0; i < TOTAL_EVENTS; i++) {
  const index = Math.min(chooseEndpointIndex(), endpoints.length - 1)
  const endpoint = endpoints[index]

  const response = await fetch(`${APP_URL}/api/i/${endpoint.ingest_key}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Simulador/1.0',
      'x-request-id': `sim-${Date.now()}-${i}`,
    },
    body: JSON.stringify(payloadFor(index)),
  })

  if (!response.ok && response.status !== 202) {
    console.error(`  ✗ ${endpoint.name}: HTTP ${response.status}`)
  } else {
    sent[index]++
  }

  // Spread arrivals out a little so the received-at column looks like traffic
  // rather than a single burst.
  await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 90))
}

for (const [index, endpoint] of endpoints.entries()) {
  console.log(`  ${sent[index]} → ${endpoint.name}`)
}

console.log(`\nProcesando la cola durante ${DRIVE_SECONDS}s (así los reintentos se resuelven)...`)

const deadline = Date.now() + DRIVE_SECONDS * 1000

while (Date.now() < deadline) {
  const response = await fetch(`${APP_URL}/api/cron`, {
    headers: CRON_SECRET ? { authorization: `Bearer ${CRON_SECRET}` } : {},
  })
  const summary = (await response.json()) as {
    claimed: number
    delivered: number
    failed: number
    dead: number
  }

  if (summary.claimed > 0) {
    const remaining = Math.round((deadline - Date.now()) / 1000)
    console.log(
      `  [${remaining}s] tomados ${summary.claimed} · entregados ${summary.delivered} · ` +
        `fallaron ${summary.failed}${summary.dead ? ` · agotados ${summary.dead}` : ''}`,
    )
  }

  await new Promise((resolve) => setTimeout(resolve, 3000))
}

console.log(`\nListo. Abrí ${APP_URL} para ver el resultado.`)
