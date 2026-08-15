import 'server-only'
import { Pool } from 'pg'

// The dev server re-evaluates modules on every edit. Without stashing the pool
// on globalThis, each reload would open a fresh one and leak connections until
// Postgres starts refusing them.
const globalForDb = globalThis as unknown as { acusePool?: Pool }

export const pool =
  globalForDb.acusePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.acusePool = pool
}

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows as T[]
}

export async function queryOne<T>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}
