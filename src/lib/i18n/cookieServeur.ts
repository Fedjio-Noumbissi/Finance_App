import { createServerFn } from '@tanstack/react-start'

import type { Language } from '#/i18n'

import { lireCookieLangue } from './cookieGuardes'

/**
 * Langue annoncee par le cookie de la requete en cours.
 *
 * Le serveur ne peut pas lire localStorage : sans cette valeur, le HTML arrive
 * en langue par defaut alors que le client se recharge dans celle du visiteur,
 * et React leve une erreur d'hydratation.
 */
export const lireLangueCookie = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Language | null> => lireCookieLangue(),
)
