import { useEffect, useState } from 'react'

import { Languages } from 'lucide-react'

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
    return <div aria-hidden className={`h-8 w-16 ${className}`} />
  }

  return (
    <label
      className={`flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 transition hover:border-slate-300 ${className}`}
      title={t('language.hint')}
    >
      <Languages aria-hidden className="size-4 shrink-0 text-slate-500" strokeWidth={1.9} />
      <span className="sr-only">{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        className="cursor-pointer appearance-none bg-transparent pr-0.5 text-xs font-semibold uppercase tracking-wide text-slate-700 outline-none"
        value={language}
        onChange={(event) =>
          changeLanguage(event.target.value as typeof language)
        }
      >
        {languages.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </label>
  )
}