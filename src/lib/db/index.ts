import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL manquant : copiez .env.example vers .env et renseignez la valeur.',
  )
}

const globalForDb = globalThis as typeof globalThis & {
  __financeAppSql?: postgres.Sql
}

// Render, Supabase ou Neon exigent TLS : DATABASE_SSL=require l'active
// (un `?sslmode=require` dans l'URL fonctionne deja de base).
const client =
  globalForDb.__financeAppSql ??
  postgres(
    connectionString,
    process.env.DATABASE_SSL === 'require' ? { ssl: 'require' } : undefined,
  )

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__financeAppSql = client
}

export const db = drizzle(client, { schema, casing: 'snake_case' })

export async function closeDb() {
  await client.end({ timeout: 5 })
}

export { schema }