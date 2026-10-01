import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface BilingualCategory {
  nomFr: string
  nomEn: string | null
}

export function useCategoryName() {
  const { i18n, t } = useTranslation()

  return useCallback(
    (categorie: BilingualCategory): string => {
      const useEnglish = i18n.resolvedLanguage?.startsWith('en')

      if (useEnglish) {
        return categorie.nomEn ?? categorie.nomFr
      }

      return categorie.nomFr || t('category.fallback')
    },
    [i18n.resolvedLanguage, t],
  )
}
