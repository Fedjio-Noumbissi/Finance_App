import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { categories, transactions } from '#/lib/db/schema'
import { convertMontant, roundCurrency } from '#/lib/currency/catalogue'
import { requireUserCurrency } from '#/lib/currency/guards'
import type { TauxMap } from '#/lib/currency/catalogue'
import {
  currentMonthKey,
  isMonthKey,
  shiftMonthKey,
} from '#/lib/dates/months'

export const APP_TIMEZONE = 'Europe/Paris'

const sumMontant = sql<number>`coalesce(sum(${transactions.montant}::float8), 0)`.mapWith(
  Number,
)

export interface MonthTotals {
  revenus: number
  depenses: number
  solde: number
}

export interface CategoryExpense {
  categorieId: string
  nomFr: string
  nomEn: string | null
  couleur: string
  total: number
  part: number
  nombre: number
}

export interface RecentTransaction {
  id: string
  montant: string
  type: 'revenu' | 'depense'
  date: string
  note: string | null
  categorie: {
    id: string
    nomFr: string
    nomEn: string | null
    couleur: string
  }
}

export interface DashboardData {
  mois: string
  moisPrecedent: string
  devise: string
  deviseParDefaut: string
  resume: MonthTotals
  moisPrecedentResume: MonthTotals
  totalTransactions: number
  depensesParCategorie: CategoryExpense[]
  dernieresTransactions: RecentTransaction[]
}

export interface BalancePoint {
  mois: string
  revenus: number
  depenses: number
  solde: number
}

export interface BalanceEvolution {
  devise: string
  deviseParDefaut: string
  points: BalancePoint[]
}

/**
 * Convertit des sous-totaux agroupes par devise dans la devise d'affichage.
 * Les sommes restent calculées en base (par type et par devise) puis
 * converties ici, ce qui évite de前年lier chaque requête à la table des taux.
 */
function convertirSomme(
  lignes: { devise: string; total: number }[],
  deviseCible: string,
  taux: TauxMap,
): number {
  const total = lignes.reduce(
    (sum, ligne) => sum + convertMontant(ligne.total, ligne.devise, deviseCible, taux),
    0,
  )

  return roundCurrency(total, deviseCible)
}

interface Bounds {
  du: Date
  au: Date
}

function zoneOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? '0')

  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour') % 24,
    read('minute'),
    read('second'),
  )

  return asUtc - date.getTime()
}

function zonedBoundary(
  year: number,
  month: number,
  day: number,
  endOfDay = false,
): Date {
  const naive = Date.UTC(
    year,
    month,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  )

  return new Date(naive - zoneOffsetMs(new Date(naive)))
}

interface YearMonth {
  year: number
  month: number
}

function parisYearMonth(date: Date): YearMonth {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
  }
}

export function currentMonthBounds(reference = new Date()): Bounds {
  const { year, month } = parisYearMonth(reference)

  return {
    du: zonedBoundary(year, month - 1, 1),
    au: zonedBoundary(year, month, 0, true),
  }
}

export function monthBounds(month: string, reference = new Date()): Bounds {
  const current = parisYearMonth(reference)
  const [rawYear, rawMonth] = month.split('-').map(Number)
  const year = Number.isFinite(rawYear) ? (rawYear as number) : current.year
  const monthIndex = Number.isFinite(rawMonth) ? (rawMonth as number) : current.month

  if (monthIndex < 1 || monthIndex > 12) {
    return currentMonthBounds(reference)
  }

  return {
    du: zonedBoundary(year, monthIndex - 1, 1),
    au: zonedBoundary(year, monthIndex, 0, true),
  }
}

export function previousMonthBoundsFor(month: string, reference = new Date()): Bounds {
  const bounds = monthBounds(month, reference)
  const [rawYear, rawMonth] = month.split('-').map(Number)
  const year = Number.isFinite(rawYear) ? (rawYear as number) : bounds.du.getUTCFullYear()
  const monthIndex = Number.isFinite(rawMonth) ? (rawMonth as number) : bounds.du.getUTCMonth() + 1
  const start = new Date(Date.UTC(year, monthIndex - 2, 1))

  return {
    du: zonedBoundary(start.getUTCFullYear(), start.getUTCMonth(), 1),
    au: zonedBoundary(year, monthIndex - 1, 0, true),
  }
}

function monthKeysEndingAt(month: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    shiftMonthKey(month, index - (count - 1)),
  )
}

async function fetchTotals(
  userId: string,
  bounds: Bounds,
  deviseCible: string,
  taux: TauxMap,
): Promise<MonthTotals> {
  const rows = await db
    .select({
      type: transactions.type,
      devise: transactions.devise,
      total: sumMontant,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, bounds.du),
        lte(transactions.date, bounds.au),
      ),
    )
    .groupBy(transactions.type, transactions.devise)

  const revenus = convertirSomme(
    rows.filter((row) => row.type === 'revenu'),
    deviseCible,
    taux,
  )
  const depenses = convertirSomme(
    rows.filter((row) => row.type === 'depense'),
    deviseCible,
    taux,
  )

  return {
    revenus,
    depenses,
    solde: roundCurrency(revenus - depenses, deviseCible),
  }
}

const monthParamSchema = z.object({
  mois: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
})

export const getDashboardData = createServerFn({ method: 'GET' })
  .validator((input: unknown) => monthParamSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<DashboardData> => {
    const { userId, devise, taux } = await requireUserCurrency()
    const mois = isMonthKey(data.mois) ? data.mois : currentMonthKey()
    const bounds = monthBounds(mois)
    const previousBounds = previousMonthBoundsFor(mois)

    const [previousResume, totalTransactions] = await Promise.all([
      fetchTotals(userId, previousBounds, devise, taux),

      db
        .select({ total: sql<number>`count(*)::int`.mapWith(Number) })
        .from(transactions)
        .where(eq(transactions.userId, userId)),
    ])

    const [resume, byCategory, lastTransactions] = await Promise.all([
      fetchTotals(userId, bounds, devise, taux),

      db
        .select({
          categorieId: categories.id,
          nomFr: categories.nomFr,
          nomEn: categories.nomEn,
          couleur: categories.couleur,
          devise: transactions.devise,
          total: sumMontant,
          nombre: sql<number>`count(*)::int`.mapWith(Number),
        })
        .from(transactions)
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, 'depense'),
            gte(transactions.date, bounds.du),
            lte(transactions.date, bounds.au),
          ),
        )
        .groupBy(
          categories.id,
          categories.nomFr,
          categories.nomEn,
          categories.couleur,
          transactions.devise,
        ),

      db
        .select({
          id: transactions.id,
          montant: transactions.montant,
          devise: transactions.devise,
          type: transactions.type,
          date: transactions.date,
          note: transactions.note,
          categorieId: categories.id,
          nomFr: categories.nomFr,
          nomEn: categories.nomEn,
          couleur: categories.couleur,
        })
        .from(transactions)
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date), desc(transactions.dateCreation))
        .limit(5),
    ])
    // Le groupement SQL inclut la devise (les montants sont convertis en JS) :
    // une categorie dont les depenses sont saisies dans plusieurs devises
    // revient donc en plusieurs lignes qu'il faut fusionner.
    const parCategorie = new Map<string, CategoryExpense>()

    for (const row of byCategory) {
      const total = convertMontant(row.total, row.devise, devise, taux)
      const existante = parCategorie.get(row.categorieId)

      if (existante) {
        existante.total += total
        existante.nombre += row.nombre
        continue
      }

      parCategorie.set(row.categorieId, {
        categorieId: row.categorieId,
        nomFr: row.nomFr,
        nomEn: row.nomEn,
        couleur: row.couleur ?? '#94a3b8',
        total,
        part: 0,
        nombre: row.nombre,
      })
    }

    const totalDepenses = [...parCategorie.values()].reduce(
      (sum, row) => sum + row.total,
      0,
    )

    return {
      mois,
      moisPrecedent: shiftMonthKey(mois, -1),
      devise,
      deviseParDefaut: 'XOF',
      resume,
      moisPrecedentResume: previousResume,
      totalTransactions: totalTransactions[0]?.total ?? 0,
      depensesParCategorie: [...parCategorie.values()]
        .sort((a, b) => b.total - a.total)
        .map((row) => ({
          ...row,
          part: totalDepenses > 0 ? round2((row.total / totalDepenses) * 100) : 0,
        })),
      dernieresTransactions: lastTransactions.map((row) => ({
        id: row.id,
        montant: convertMontant(
          Number(row.montant),
          row.devise,
          devise,
          taux,
        ).toFixed(2),
        type: row.type,
        date: row.date.toISOString(),
        note: row.note,
        categorie: {
          id: row.categorieId,
          nomFr: row.nomFr,
          nomEn: row.nomEn,
          couleur: row.couleur ?? '#94a3b8',
        },
      })),
    }
  },
)

export const getBalanceEvolution = createServerFn({ method: 'GET' })
  .validator((input: unknown) => monthParamSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<BalanceEvolution> => {
    const { userId, devise, taux } = await requireUserCurrency()
    const months = 6
    const selected = isMonthKey(data.mois) ? data.mois : currentMonthKey()
    const bounds = monthBounds(selected)
    const keys = monthKeysEndingAt(selected, months)

    // Les paramètres de date sont sérialisés en chaînes ISO : le chemin
    // `db.execute` de drizzle-orm ne gère pas les objets Date avec le pilote
    // postgres.js (erreur « must be of type string »).
    const du = bounds.du.toISOString()
    const au = bounds.au.toISOString()

    const rows = await db.execute<{
      mois: string
      type: 'revenu' | 'depense'
      devise: string
      total: number
    }>(sql`
      with monthly_transactions as (
        select
          to_char(${transactions.date} at time zone 'Europe/Paris', 'YYYY-MM') as mois,
          ${transactions.type} as type,
          ${transactions.devise} as devise,
          ${transactions.montant}::float8 as montant
        from ${transactions}
        where
          ${transactions.userId} = ${userId}
          and ${transactions.date} >= ${du}::timestamptz
          and ${transactions.date} <= ${au}::timestamptz
      )
      select
        mois,
        type,
        coalesce(sum(montant), 0::float8) as total
      from monthly_transactions
      group by mois, type, devise
    `)

    const points = keys.map((mois) => {
      const forMonth = rows.filter((row) => row.mois === mois)
      const revenus = convertirSomme(
        forMonth.filter((row) => row.type === 'revenu'),
        devise,
        taux,
      )
      const depenses = convertirSomme(
        forMonth.filter((row) => row.type === 'depense'),
        devise,
        taux,
      )

      return {
        mois,
        revenus,
        depenses,
        solde: roundCurrency(revenus - depenses, devise),
      }
    })

    return { devise, deviseParDefaut: 'XOF', points }
  },
)

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}