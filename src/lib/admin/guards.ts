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
 *
 * Les fonctions sans dependance (voir `utils.ts`) sont separees pour rester
 * testables sans base de donnees.
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