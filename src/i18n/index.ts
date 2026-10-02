import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en.json'
import fr from './fr.json'

export const DEFAULT_LANGUAGE = 'fr'

export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_STORAGE_KEY = 'finance.langue'

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

function readStoredLanguage(): Language | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

    return isSupportedLanguage(stored) ? stored : null
  } catch {
    return null
  }
}

export function storeLanguage(language: Language): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    return
  }
}

void i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLanguage() ?? DEFAULT_LANGUAGE,
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
