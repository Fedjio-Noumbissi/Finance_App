import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en.json'
import fr from './fr.json'

export const DEFAULT_LANGUAGE = 'fr'

export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_STORAGE_KEY = 'finance.langue'

/**
 * La langue est aussi stockee dans un cookie : le serveur ne peut pas lire
 * localStorage, et un rendu serveur en francais face a un client en anglais
 * provoque une erreur d'hydratation.
 */
export const LANGUAGE_COOKIE = 'finance_langue'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  for (const part of document.cookie.split(';')) {
    const [cle, ...reste] = part.trim().split('=')

    if (cle === name) {
      return decodeURIComponent(reste.join('='))
    }
  }

  return null
}

const resources = {
  fr: { translation: fr },
  en: { translation: en },
} as const

export function isSupportedLanguage(value: unknown): value is Language {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
  )
}

/**
 * Langue utilisee pour le premier rendu, cote serveur comme cote client.
 *
 * Le cookie est la seule source partagee : le serveur lui rend la meme valeur
 * que le client, donc les deux rendus produits exactement le meme texte.
 */
export function readInitialLanguage(): Language | null {
  const cookie = readCookie(LANGUAGE_COOKIE)

  if (isSupportedLanguage(cookie)) {
    return cookie
  }

  return null
}

export function storeLanguage(language: Language): void {
  if (typeof window === 'undefined') {
    return
  }

  document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(language)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    return
  }
}

void i18n.use(initReactI18next).init({
  resources,
  lng: readInitialLanguage() ?? DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
  },
  react: { useSuspense: false },
})

export function getLocale(language: string = i18n.resolvedLanguage ?? i18n.language): string {
  return language?.startsWith('en') ? 'en-GB' : 'fr-FR'
}

export { i18n }
