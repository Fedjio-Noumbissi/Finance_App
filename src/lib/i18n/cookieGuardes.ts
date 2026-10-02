import { getRequestHeaders } from '@tanstack/react-start/server'

import { isSupportedLanguage, LANGUAGE_COOKIE, type Language } from '#/i18n'

/**
 * Helpers reserves au code serveur.
 *
 * Module separe de `cookieServeur.ts` afin que celui-ci n'importe que
 * `createServerFn` : le plugin d'import-protection peut alors retirer
 * l'import de `@tanstack/react-start/server` du bundle client.
 */
export async function lireCookieLangue(): Promise<Language | null> {
  let cookie: string

  try {
    const headers = await getRequestHeaders()
    cookie = headers.get('cookie') ?? ''
  } catch {
    return null
  }

  for (const part of cookie.split(';')) {
    const [cle, ...reste] = part.trim().split('=')

    if (cle !== LANGUAGE_COOKIE) {
      continue
    }

    const valeur = decodeURIComponent(reste.join('='))

    return isSupportedLanguage(valeur) ? valeur : null
  }

  return null
}
