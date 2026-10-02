import { createServerFn } from '@tanstack/react-start'
import { and, count, desc, eq, gte, ilike, isNull, or, sql } from 'drizzle-orm'
import { z } from 'zod'

import { requireUserId } from '#/lib/auth/session'
import { db } from '#/lib/db'
import { categories, pageViews, transactions, users } from '#/lib/db/schema'
import type { UserRole } from '#/lib/db/schema'

import {
  dayKey,
  isValidPath,
  requireAdminId,
  sanitizeSource,
  startOfWindow,
} from './guards'

export interface AdminKpis {
  utilisateurs: number
  nouveauxUtilisateurs: number
  transactions: number
  transactionsPeriode: number
  vueTotale: number
  vuePeriode: number
  vuesConnectees: number
  vuesAnonymes: number
  tauxConversion: number
}

export interface AdminTrafficPoint {
  jour: string
  vues: number
  connectes: number
}

export interface AdminTopPath {
  chemin: string
  vues: number
  connectes: number
}

export interface AdminSource {
  source: string
  vues: number
}

export interface AdminOverview {
  jours: number
  kpis: AdminKpis
  trafic: AdminTrafficPoint[]
  topChemins: AdminTopPath[]
  sources: AdminSource[]
  derniersUtilisateurs: {
    id: string
    email: string
    role: UserRole
    languePreferee: string
    devisePreferee: string
    onboardingTerminee: boolean
    derniereActivite: string | null
    dateCreation: string
    transactions: number
  }[]
  activiteParDevise: { devise: string; transactions: number }[]
}

export interface AdminUserRow {
  id: string
  email: string
  role: UserRole
  languePreferee: string
  devisePreferee: string
  onboardingTerminee: boolean
  derniereActivite: string | null
  dateCreation: string
  categories: number
  transactions: number
}

export interface AdminUsersPage {
  lignes: AdminUserRow[]
  total: number
  admins: number
}

const overviewValidator = z.object({
  jours: z.number().int().min(7).max(90).default(30),
})

const usersValidator = z.object({
  recherche: z.string().max(120).default(''),
  page: z.number().int().min(1).max(500).default(1),
  parPage: z.number().int().min(5).max(100).default(20),
})

const roleValidator = z.object({
  id: z.uuid(),
  role: z.enum(['user', 'admin']),
})

/**
 * Enregistre une page vue. Sans cookie ni adresse IP : on ne garde que la page
 * et, si la personne est connectée, son identifiant. `openSession` n'est pas
 * exigé ici pour que le trafic de la page d'accueil publique soit mesuré aussi.
 */
export const trackPageView = createServerFn({ method: 'POST' })
  .validator((data: { chemin: string; source?: string | null }) => {
    if (!data || !isValidPath(data.chemin)) {
      throw new Error('chemin-invalide')
    }

    return { chemin: data.chemin, source: data.source ?? null }
  })
  .handler(async ({ data }) => {
    const source = sanitizeSource(data.source)
    const userId = await currentUserId()

    await db.insert(pageViews).values({ chemin: data.chemin, source, userId })

    if (userId) {
      await db
        .update(users)
        .set({ derniereActivite: new Date() })
        .where(eq(users.id, userId))
    }

    return { ok: true }
  })

/** Identifiant de l'utilisateur si un cookie de session existe, sinon null. */
async function currentUserId(): Promise<string | null> {
  try {
    return await requireUserId()
  } catch {
    return null
  }
}

export const getAdminOverview = createServerFn({ method: 'GET' })
  .validator(overviewValidator)
  .handler(async ({ data }): Promise<AdminOverview> => {
    await requireAdminId()

    const debut = startOfWindow(data.jours)

    const [
      [utilisateurs],
      [nouveauxUtilisateurs],
      [totalTransactions],
      [transactionsPeriode],
      [vueTotale],
      [vuePeriode],
      [connectes],
      [anonymes],
      traficBrut,
      chemins,
      sources,
      derniers,
      devises,
    ] = await Promise.all([
      db.select({ valeur: count() }).from(users),
      db
        .select({ valeur: count() })
        .from(users)
        .where(gte(users.dateCreation, debut)),
      db.select({ valeur: count() }).from(transactions),
      db
        .select({ valeur: count() })
        .from(transactions)
        .where(gte(transactions.dateCreation, debut)),
      db.select({ valeur: count() }).from(pageViews),
      db
        .select({ valeur: count() })
        .from(pageViews)
        .where(gte(pageViews.dateCreation, debut)),
      db
        .select({ valeur: count() })
        .from(pageViews)
        .where(
          and(gte(pageViews.dateCreation, debut), sql`${pageViews.userId} is not null`),
        ),
      db
        .select({ valeur: count() })
        .from(pageViews)
        .where(
          and(gte(pageViews.dateCreation, debut), isNull(pageViews.userId)),
        ),
      db
        .select({
          jour: sql<string>`to_char(date_trunc('day', ${pageViews.dateCreation} at time zone 'UTC'), 'YYYY-MM-DD')`,
          vues: count(),
          connectes: sql<number>`count(${pageViews.userId})::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.dateCreation, debut))
        .groupBy(
          sql`date_trunc('day', ${pageViews.dateCreation} at time zone 'UTC')`,
        )
        .orderBy(sql`date_trunc('day', ${pageViews.dateCreation} at time zone 'UTC')`),
      db
        .select({
          chemin: pageViews.chemin,
          vues: count(),
          connectes: sql<number>`count(${pageViews.userId})::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.dateCreation, debut))
        .groupBy(pageViews.chemin)
        .orderBy(desc(count()))
        .limit(8),
      db
        .select({ source: sql<string>`${pageViews.source}`, vues: count() })
        .from(pageViews)
        .where(
          and(
            gte(pageViews.dateCreation, debut),
            sql`${pageViews.source} is not null`,
          ),
        )
        .groupBy(pageViews.source)
        .orderBy(desc(count()))
        .limit(6),
      db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          languePreferee: users.languePreferee,
          devisePreferee: users.devisePreferee,
          onboardingTerminee: users.onboardingTerminee,
          derniereActivite: users.derniereActivite,
          dateCreation: users.dateCreation,
          transactions: count(transactions.id),
        })
        .from(users)
        .leftJoin(transactions, eq(transactions.userId, users.id))
        .groupBy(users.id)
        .orderBy(desc(users.dateCreation))
        .limit(6),
      db
        .select({ devise: transactions.devise, transactions: count() })
        .from(transactions)
        .groupBy(transactions.devise)
        .orderBy(desc(count()))
        .limit(8),
    ])

    const traficParJour = new Map(
      traficBrut.map((row) => [row.jour, row]),
    )
    const trafic: AdminTrafficPoint[] = []

    for (let offset = 0; offset < data.jours; offset += 1) {
      const jour = new Date(debut)
      jour.setUTCDate(jour.getUTCDate() + offset)
      const cle = dayKey(jour)
      const row = traficParJour.get(cle)

      trafic.push({
        jour: cle,
        vues: row?.vues ?? 0,
        connectes: row?.connectes ?? 0,
      })
    }

    return {
      jours: data.jours,
      kpis: {
        utilisateurs: utilisateurs.valeur,
        nouveauxUtilisateurs: nouveauxUtilisateurs.valeur,
        transactions: totalTransactions.valeur,
        transactionsPeriode: transactionsPeriode.valeur,
        vueTotale: vueTotale.valeur,
        vuePeriode: vuePeriode.valeur,
        vuesConnectees: connectes.valeur,
        vuesAnonymes: anonymes.valeur,
        tauxConversion:
          vuePeriode.valeur > 0
            ? Math.round((connectes.valeur / vuePeriode.valeur) * 1000) / 10
            : 0,
      },
      trafic,
      topChemins: chemins,
      sources,
      derniersUtilisateurs: derniers.map((row) => ({
        ...row,
        derniereActivite: row.derniereActivite?.toISOString() ?? null,
        dateCreation: row.dateCreation.toISOString(),
      })),
      activiteParDevise: devises,
    }
  })

export const getAdminUsers = createServerFn({ method: 'GET' })
  .validator(usersValidator)
  .handler(async ({ data }): Promise<AdminUsersPage> => {
    await requireAdminId()

    const recherche = data.recherche.trim()
    const filtre = recherche
      ? or(ilike(users.email, `%${recherche}%`), ilike(users.firebaseUid, `%${recherche}%`))
      : undefined
    const debut = (data.page - 1) * data.parPage

    const [lignes, [total], [admins]] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          languePreferee: users.languePreferee,
          devisePreferee: users.devisePreferee,
          onboardingTerminee: users.onboardingTerminee,
          derniereActivite: users.derniereActivite,
          dateCreation: users.dateCreation,
          categories: sql<number>`count(distinct ${categories.id})`.mapWith(Number),
          transactions: sql<number>`count(distinct ${transactions.id})`.mapWith(Number),
        })
        .from(users)
        .leftJoin(categories, eq(categories.userId, users.id))
        .leftJoin(transactions, eq(transactions.userId, users.id))
        .where(filtre)
        .groupBy(users.id)
        .orderBy(desc(users.dateCreation))
        .limit(data.parPage)
        .offset(debut),
      db.select({ valeur: count() }).from(users).where(filtre),
      db
        .select({ valeur: count() })
        .from(users)
        .where(eq(users.role, 'admin')),
    ])

    return {
      lignes: lignes.map((row) => ({
        ...row,
        derniereActivite: row.derniereActivite?.toISOString() ?? null,
        dateCreation: row.dateCreation.toISOString(),
      })),
      total: total.valeur,
      admins: admins.valeur,
    }
  })

/** Empêche l'administrateur de se retirer lui-même son propre rôle. */
export const setUserRole = createServerFn({ method: 'POST' })
  .validator(roleValidator)
  .handler(async ({ data }) => {
    const adminId = await requireAdminId()

    if (data.id === adminId && data.role !== 'admin') {
      throw new Error('self-demote-refusee')
    }

    await db
      .update(users)
      .set({ role: data.role })
      .where(eq(users.id, data.id))

    return { id: data.id, role: data.role }
  })
