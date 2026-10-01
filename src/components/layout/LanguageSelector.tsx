import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useLanguageState } from '#/lib/i18n/useLanguage'

export function LanguageSelector({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const { language, changeLanguage, languages } = useLanguageState()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div aria-hidden className={`h-7 w-24 ${className}`} />
  }

  return (
    <label className={`flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        title={t('language.hint')}
        className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        value={language}
        onChange={(event) =>
          changeLanguage(event.target.value as typeof language)
        }
      >
        {languages.map((code) => (
          <option key={code} value={code}>
            {t(`language.${code}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
