import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, isNull, lte, or } from 'drizzle-orm'

import { requireUserId } from '#/lib/auth/session'
import { convertMontant } from '#/lib/currency/catalogue'
import { requireUserCurrency } from '#/lib/currency/guards'
import { i18n } from '#/i18n'
import { db } from '#/lib/db'
import { categories, transactions } from '#/lib/db/schema'

import {
  transactionFiltersSchema,
  transactionIdSchema,
  transactionSchema,
  transactionUpdateSchema,
} from './schema'

export interface TransactionWithCategory {
  id: string
  /** Montant converti dans la devise d'affichage. */
  montant: string
  devise: string
  deviseParDefaut: string
  /** Montant et devise d'origine, quand ils diffèrent de la devise d'affichage. */
  montantSaisi: string | null
  deviseSaisie: string | null
  type: 'revenu' | 'depense'
  date: string
  note: string | null
  dateCreation: string
  categorie: {
    id: string
    nomFr: string
    nomEn: string
    icone: string | null
    couleur: string | null
  }
}

async function assertCategoryOwnership(
  userId: string,
  categorieId: string,
): Promise<void> {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.id, categorieId),
        or(isNull(categories.userId), eq(categories.userId, userId)),
      ),
    )
    .limit(1)

  if (!category) {
    throw new Error(i18n.t('serverError.categoryNotFound'))
  }
}

export const listTransactions = createServerFn({ method: 'POST' })
  .validator((input: unknown) => transactionFiltersSchema.parse(input))
  .handler(async ({ data }): Promise<TransactionWithCategory[]> => {
    const { userId, devise, taux } = await requireUserCurrency()

    const conditions = [eq(transactions.userId, userId)]

    if (data.categorieId) {
      conditions.push(eq(transactions.categoryId, data.categorieId))
    }

    if (data.du) {
      conditions.push(gte(transactions.date, new Date(`${data.du}T00:00:00`)))
    }

    if (data.au) {
      conditions.push(lte(transactions.date, new Date(`${data.au}T23:59:59.999`)))
    }

    const rows = await db
      .select({
        id: transactions.id,
        montant: transactions.montant,
        devise: transactions.devise,
        type: transactions.type,
        date: transactions.date,
        note: transactions.note,
        dateCreation: transactions.dateCreation,
        categorieId: categories.id,
        categorieNomFr: categories.nomFr,
        categorieNomEn: categories.nomEn,
        categorieIcone: categories.icone,
        categorieCouleur: categories.couleur,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.date), desc(transactions.dateCreation))

    return rows.map((row) => {
      const converti = convertMontant(
        Number(row.montant),
        row.devise,
        devise,
        taux,
      )
      const deviseDifferente = row.devise !== devise

      return {
      id: row.id,
      montant: converti.toFixed(2),
      devise,
      deviseParDefaut: 'XOF',
      montantSaisi: deviseDifferente ? row.montant : null,
      deviseSaisie: deviseDifferente ? row.devise : null,
      type: row.type,
      date: row.date.toISOString(),
      note: row.note,
      dateCreation: row.dateCreation.toISOString(),
      categorie: {
        id: row.categorieId,
        nomFr: row.categorieNomFr,
        nomEn: row.categorieNomEn,
        icone: row.categorieIcone,
        couleur: row.categorieCouleur,
      },
      }
    })
  })

export const createTransaction = createServerFn({ method: 'POST' })
  .validator((input: unknown) => transactionSchema.parse(input))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const userId = await requireUserId()

    await assertCategoryOwnership(userId, data.categorieId)

    const [created] = await db
      .insert(transactions)
      .values({
        userId,
        montant: data.montant.toFixed(2),
        devise: data.devise,
        type: data.type,
        categoryId: data.categorieId,
        date: new Date(`${data.date}T12:00:00`),
        note: data.note?.trim() ? data.note.trim() : null,
      })
      .returning({ id: transactions.id })

    return created
  })

export const updateTransaction = createServerFn({ method: 'POST' })
  .validator((input: unknown) => transactionUpdateSchema.parse(input))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const userId = await requireUserId()

    const [existing] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(
          eq(transactions.id, data.id),
          eq(transactions.userId, userId),
        ),
      )
      .limit(1)

    if (!existing) {
      throw new Error(i18n.t('serverError.transactionNotFound'))
    }

    await assertCategoryOwnership(userId, data.categorieId)

    await db
      .update(transactions)
      .set({
        montant: data.montant.toFixed(2),
        devise: data.devise,
        type: data.type,
        categoryId: data.categorieId,
        date: new Date(`${data.date}T12:00:00`),
        note: data.note?.trim() ? data.note.trim() : null,
      })
      .where(eq(transactions.id, data.id))

    return { id: data.id }
  })

export const deleteTransaction = createServerFn({ method: 'POST' })
  .validator((input: unknown) => transactionIdSchema.parse(input))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const userId = await requireUserId()

    const deleted = await db
      .delete(transactions)
      .where(
        and(eq(transactions.id, data), eq(transactions.userId, userId)),
      )
      .returning({ id: transactions.id })

    if (deleted.length === 0) {
      throw new Error(i18n.t('serverError.transactionNotFound'))
    }

    return { id: data }
  })
