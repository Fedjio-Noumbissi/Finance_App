import { useEffect, useState } from 'react'

import { ChevronDown, Coins, Loader2 } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { useDevise } from '#/lib/currency/store'

/**
 * Selecteur de devise d'affichage : le code est lisible sans passer par un
 * libelle long, la liste complete reste accessible au clavier.
 */
export function CurrencySelector({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const { currencies, devise, isPending, isUpdatingDevise, setDevise } = useDevise()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div aria-hidden className={`h-8 w-20 ${className}`} />
  }

  return (
    <label
      className={`flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white py-1 pr-1 pl-2 transition hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10 ${className}`}
    >
      <span className="sr-only">{t('currency.label')}</span>
      <Coins aria-hidden className="size-3.5 shrink-0 text-slate-400" strokeWidth={1.8} />
      <select
        aria-label={t('currency.label')}
        title={t('currency.hint')}
        disabled={isPending || isUpdatingDevise}
        className="cursor-pointer appearance-none bg-transparent py-0 pr-1 pl-1 text-xs font-semibold tabular-nums text-slate-900 outline-none disabled:opacity-60"
        value={devise}
        onChange={(event) => void setDevise(event.target.value)}
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>
      {isUpdatingDevise ? (
        <Loader2 aria-hidden className="size-3.5 shrink-0 animate-spin text-slate-400" strokeWidth={2} />
      ) : (
        <ChevronDown aria-hidden className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
      )}
    </label>
  )
}