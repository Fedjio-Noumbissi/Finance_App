import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import {
  DEFAULT_LANGUAGE,
  i18n,
  isSupportedLanguage,
  storeLanguage,
  SUPPORTED_LANGUAGES,
  type Language,
} from '#/i18n'
import { useAuth } from '#/lib/auth/context'

export function useLanguageState() {
  const { i18n: instance } = useTranslation()
  const { user, setLanguage: setSessionLanguage } = useAuth()

  const language: Language = isSupportedLanguage(instance.resolvedLanguage)
    ? instance.resolvedLanguage
    : DEFAULT_LANGUAGE

  const changeLanguage = useCallback(
    (next: Language) => {
      if (!isSupportedLanguage(next) || next === language) {
        return
      }

      if (user) {
        setSessionLanguage(next)
        return
      }

      storeLanguage(next)
      void i18n.changeLanguage(next)
    },
    [language, setSessionLanguage, user],
  )

  return {
    language,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
    user,
  }
}
