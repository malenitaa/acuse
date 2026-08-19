import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const schemaPath = fileURLToPath(new URL('../db/schema.sql', import.meta.url))
const schema = await readFile(schemaPath, 'utf8')

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
await client.query(schema)
await client.end()

console.log('Database recreated from db/schema.sql')
