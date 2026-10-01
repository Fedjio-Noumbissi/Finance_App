import { createServerFn } from '@tanstack/react-start'
import { and, eq, isNull, or, sql } from 'drizzle-orm'

import { i18n } from '#/i18n'
import { requireUserId } from '#/lib/auth/session'
import { db } from '#/lib/db'
import { categories, transactions } from '#/lib/db/schema'

import {
  categoryCreateSchema,
  categoryDeleteSchema,
  categoryUpdateSchema,
} from './schema'

export interface CategoryItem {
  id: string
  nomFr: string
  nomEn: string
  icone: string | null
  couleur: string | null
  isDefault: boolean
}

const CATEGORY_FIELDS = {
  id: categories.id,
  nomFr: categories.nomFr,
  nomEn: categories.nomEn,
  icone: categories.icone,
  couleur: categories.couleur,
  userId: categories.userId,
}

function serialize(row: typeof categories.$inferSelect): CategoryItem {
  return {
    id: row.id,
    nomFr: row.nomFr,
    nomEn: row.nomEn,
    icone: row.icone,
    couleur: row.couleur,
    isDefault: row.userId === null,
  }
}

async function findOwnCategory(
  userId: string,
  id: string,
): Promise<typeof categories.$inferSelect | undefined> {
  const [row] = await db
    .select(CATEGORY_FIELDS)
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1)

  return row
}

export const getCategories = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CategoryItem[]> => {
    const userId = await requireUserId()

    const rows = await db
      .select(CATEGORY_FIELDS)
      .from(categories)
      .where(or(isNull(categories.userId), eq(categories.userId, userId)))
      .orderBy(sql`${categories.userId} is null desc`, categories.nomFr)

    return rows.map(serialize)
  },
)

export const createCategory = createServerFn({ method: 'POST' })
  .inputValidator(categoryCreateSchema)
  .handler(async ({ data }): Promise<CategoryItem> => {
    const userId = await requireUserId()
    const { nomFr, nomEn, couleur } = data

    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        sql`lower(${categories.nomFr}) = lower(${nomFr}) and (${categories.userId} is null or ${categories.userId} = ${userId})`,
      )
      .limit(1)

    if (existing) {
      throw new Error(i18n.t('settings.category.existsError'))
    }

    const [row] = await db
      .insert(categories)
      .values({ userId, nomFr, nomEn, couleur: couleur ?? null })
      .returning(CATEGORY_FIELDS)

    return serialize(row)
  })

export const updateCategory = createServerFn({ method: 'POST' })
  .inputValidator(categoryUpdateSchema)
  .handler(async ({ data }): Promise<CategoryItem> => {
    const userId = await requireUserId()
    const { id, nomFr, nomEn } = data
    const existing = await findOwnCategory(userId, id)

    if (!existing) {
      throw new Error(i18n.t('settings.category.notEditable'))
    }

    const [duplicate] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        sql`lower(${categories.nomFr}) = lower(${nomFr}) and ${categories.id} <> ${id} and (${categories.userId} is null or ${categories.userId} = ${userId})`,
      )
      .limit(1)

    if (duplicate) {
      throw new Error(i18n.t('settings.category.existsError'))
    }

    const [row] = await db
      .update(categories)
      .set({ nomFr, nomEn })
      .where(eq(categories.id, id))
      .returning(CATEGORY_FIELDS)

    return serialize(row)
  })

export const deleteCategory = createServerFn({ method: 'POST' })
  .inputValidator(categoryDeleteSchema)
  .handler(async ({ data }): Promise<{ id: string }> => {
    const userId = await requireUserId()
    const existing = await findOwnCategory(userId, data.id)

    if (!existing) {
      throw new Error(i18n.t('settings.category.notEditable'))
    }

    const [used] = await db
      .select({ count: sql<number>`count(*)::int`.mapWith(Number) })
      .from(transactions)
      .where(eq(transactions.categoryId, data.id))

    if ((used?.count ?? 0) > 0) {
      throw new Error(i18n.t('settings.category.inUseError'))
    }

    await db.delete(categories).where(eq(categories.id, data.id))

    return { id: data.id }
  })
