import 'dotenv/config'

import { isNull, sql } from 'drizzle-orm'

import { closeDb, db } from './index'
import { categories } from './schema'

const defaultCategories = [
  { nomFr: 'Nourriture', nomEn: 'Food', icone: 'utensils', couleur: '#f97316' },
  { nomFr: 'Transport', nomEn: 'Transport', icone: 'car', couleur: '#3b82f6' },
  { nomFr: 'Loyer', nomEn: 'Rent', icone: 'house', couleur: '#8b5cf6' },
  { nomFr: 'Santé', nomEn: 'Health', icone: 'heart-pulse', couleur: '#ef4444' },
  { nomFr: 'Loisirs', nomEn: 'Leisure', icone: 'film', couleur: '#a855f7' },
  { nomFr: 'Épargne', nomEn: 'Savings', icone: 'piggy-bank', couleur: '#10b981' },
  { nomFr: 'Autre', nomEn: 'Other', icone: 'shapes', couleur: '#64748b' },
] as const

interface ConnectionInfo {
  base: string
  role: string
  version: string
}

async function main() {
  const rows = (await db.execute(
    sql`select current_database() as base, current_user as role, version() as version`,
  )) as unknown as ConnectionInfo[]

  const connection = rows[0]

  console.log(`Connexion PostgreSQL : ${connection.base} (role ${connection.role})`)
  console.log(`Version : ${connection.version.split(' ').slice(0, 2).join(' ')}`)

  const existing = await db
    .select({ nomFr: categories.nomFr })
    .from(categories)
    .where(isNull(categories.userId))

  const existingNames = new Set(existing.map((row) => row.nomFr))
  const missing = defaultCategories.filter(
    (category) => !existingNames.has(category.nomFr),
  )

  if (missing.length === 0) {
    console.log(`Catégories par défaut : ${existing.length} déjà présentes.`)
    return
  }

  const inserted = await db
    .insert(categories)
    .values(missing.map((category) => ({ ...category, userId: null })))
    .returning({ id: categories.id, nomFr: categories.nomFr })

  for (const category of inserted) {
    console.log(`  + ${category.nomFr} (${category.id})`)
  }

  const total = await db
    .select({ nomFr: categories.nomFr })
    .from(categories)
    .where(isNull(categories.userId))

  console.log(`Catégories par défaut : ${total.length} au total.`)
}

main()
  .then(closeDb)
  .catch(async (error) => {
    console.error('Échec du seed :', error)
    await closeDb()
    process.exit(1)
  })