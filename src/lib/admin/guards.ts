import { eq } from 'drizzle-orm'

import { requireUserId } from '#/lib/auth/session'
import { db } from '#/lib/db'
import { users } from '#/lib/db/schema'

/**
 * Helpers reserves au code serveur.
 *
 * Ils vivent dans un module distinct de `server.ts` afin que celui-ci n'exporte
 * que des `createServerFn` : le plugin d'import-protection peut alors retirer
 * l'import de `@tanstack/react-start/server` du bundle client.
 */
export class ForbiddenError extends Error {
  constructor() {
    super('forbidden')
  }
}

/** Exige le rôle administrateur : protège toutes les requêtes du dashboard. */
export async function requireAdminId(): Promise<string> {
  const userId = await requireUserId()

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (user?.role !== 'admin') {
    throw new ForbiddenError()
  }

  return userId
}

/** Jour ISO (`AAAA-MM-JJ`) servant d'axe aux séries du dashboard. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Début de la fenêtre analysée, jour UTC inclus. */
export function startOfWindow(days: number): Date {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - (days - 1))

  return date
}

export function isValidPath(value: string): boolean {
  return /^\/[A-Za-z0-9\-_/?.=&%]*$/.test(value) && value.length <= 200
}

/** On ne conserve une source que si c'est une URL http(s) : pas d'injection. */
export function sanitizeSource(value: string | null | undefined): string | null {
  if (!value) return null

  const source = value.slice(0, 200)

  return /^https?:\/\//i.test(source) ? source : null
}
