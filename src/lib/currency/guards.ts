import { eq } from 'drizzle-orm'

import { getSessionUserId, requireUserId } from '#/lib/auth/session'
import { db } from '#/lib/db'
import { currencies, users } from '#/lib/db/schema'

import {
  DEVISE_BASE,
  buildTauxMap,
  type TauxMap,
} from './catalogue'

/**
 * Helpers reserves au code serveur.
 *
 * Ils vivent dans un module distinct de `server.ts` afin que celui-ci n'exporte
 * que des `createServerFn` : le plugin d'import-protection peut alors retirer
 * l'import de `@tanstack/react-start/server` du bundle client.
 */
export async function loadTaux(): Promise<TauxMap> {
  const rows = await db
    .select({ code: currencies.code, tauxVersXof: currencies.tauxVersXof })
    .from(currencies)

  const overrides: Record<string, number> = {}

  for (const row of rows) {
    overrides[row.code] = Number(row.tauxVersXof)
  }

  return buildTauxMap(overrides)
}

/**
 * Devise d'affichage sans exiger de session : les pages publiques ont besoin
 * du catalogue des devises, un visiteur non connecte simplye l'utilise avec la
 * devise de base.
 */
export async function loadUserCurrency(): Promise<{
  userId: string | null
  devise: string
  taux: TauxMap
}> {
  const userId = await getSessionUserId()

  if (!userId) {
    return { userId: null, devise: DEVISE_BASE, taux: await loadTaux() }
  }

  const [user] = await db
    .select({ devisePreferee: users.devisePreferee })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return {
    userId,
    devise: user?.devisePreferee ?? DEVISE_BASE,
    taux: await loadTaux(),
  }
}

export async function requireUserCurrency(): Promise<{
  userId: string
  devise: string
  taux: TauxMap
}> {
  const userId = await requireUserId()

  const [user] = await db
    .select({ devisePreferee: users.devisePreferee })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return {
    userId,
    devise: user?.devisePreferee ?? DEVISE_BASE,
    taux: await loadTaux(),
  }
}
