import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FormAlert } from '#/components/auth/AuthCard'
import { DEVISE_BASE, formatTaux, roundCurrency } from '#/lib/currency/catalogue'
import {
  useCurrenciesQuery,
  useUpdateCurrencyRate,
  useUpdatePreferredCurrency,
} from '#/lib/currency/queries'
import { extractErrorMessage } from '#/lib/errors'
import { useCategoryName } from '#/lib/i18n/useCategoryName'

function RateRow({
  code,
  nomFr,
  nomEn,
  decimales,
  tauxVersXof,
  deviseParDefaut,
  deviseActive,
  onSave,
  isSaving,
  error,
}: {
  code: string
  nomFr: string
  nomEn: string
  decimales: number
  tauxVersXof: number
  deviseParDefaut: string
  deviseActive: string
  onSave: (taux: number) => void
  isSaving: boolean
  error: string | null
}) {
  const { t } = useTranslation()
  const categoryName = useCategoryName()
  const [value, setValue] = useState(() => String(tauxVersXof))

  useEffect(() => {
    setValue(String(tauxVersXof))
  }, [tauxVersXof])

  const parsed = Number(value.replace(',', '.'))
  const valide = Number.isFinite(parsed) && parsed > 0
  const modifie = valide && parsed !== tauxVersXof
  const verrouille = code === deviseParDefaut

  return (
    <li className="flex flex-col gap-1.5 border-b border-slate-100 py-2 last:border-0 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="w-12 shrink-0 font-mono text-sm font-semibold text-slate-900">
          {code}
        </span>
        <span className="truncate text-sm text-slate-600">
          {categoryName({ nomFr, nomEn })}
        </span>
        {code === deviseActive ? (
          <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {t('settings.currency.active')}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 sm:w-72">
        <label className="sr-only" htmlFor={`taux-${code}`}>
          {t('settings.currency.rateFor', { devise: code })}
        </label>
        <input
          id={`taux-${code}`}
          inputMode="decimal"
          disabled={verrouille || isSaving}
          value={verrouille ? formatTaux(1) : value}
          onChange={(event) => setValue(event.target.value)}
          className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-right text-sm tabular-nums text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-400"
        />
        <span className="flex-1 text-xs text-slate-500">
          {t('settings.currency.perUnit', { devise: code })}
        </span>
        <button
          type="button"
          disabled={!modifie || isSaving}
          onClick={() => onSave(parsed)}
          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
        >
          {t('settings.currency.save')}
        </button>
      </div>

      {error ? <p className="text-xs text-red-600 sm:ml-[4.5rem]">{error}</p> : null}
      {decimales === 0 ? (
        <p className="text-[11px] text-slate-400 sm:ml-[4.5rem]">
          {t('settings.currency.noDecimals')}
        </p>
      ) : null}
    </li>
  )
}

export function CurrencyPanel() {
  const { t } = useTranslation()
  const categoryName = useCategoryName()
  const currencies = useCurrenciesQuery()
  const updateRate = useUpdateCurrencyRate()
  const updatePreference = useUpdatePreferredCurrency()
  const [filtre, setFiltre] = useState('')

  const data = currencies.data
  const devise = data?.devise ?? DEVISE_BASE

  const liste = (data?.currencies ?? []).filter((currency) => {
    if (!filtre.trim()) {
      return true
    }

    const recherche = filtre.trim().toLowerCase()

    return (
      currency.code.toLowerCase().includes(recherche) ||
      currency.nomFr.toLowerCase().includes(recherche) ||
      currency.nomEn.toLowerCase().includes(recherche)
    )
  })

  // Exemple de conversion : 100 unites de la devise de reference valent
  // combien dans la devise d'affichage. Les taux sont exprimes en XOF, donc
  //   montant_base = montant * tauxVersXof(source)
  //   montant_cible = montant_base / tauxVersXof(cible)
  const apercu = data
    ? (100 * (data.taux[data.deviseParDefaut] ?? 1)) /
      (data.taux[devise] ?? 1)
    : 100

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="devise-preference"
        >
          {t('settings.currency.display')}
        </label>
        <select
          id="devise-preference"
          value={devise}
          disabled={updatePreference.isPending || currencies.isPending}
          onChange={(event) =>
            updatePreference.mutate({ devise: event.target.value })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        >
          {(data?.currencies ?? []).map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} — {categoryName({ nomFr: currency.nomFr, nomEn: currency.nomEn })}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500">
          {t('settings.currency.displayHint')}
        </p>
        {updatePreference.isError ? (
          <FormAlert
            message={extractErrorMessage(
              updatePreference.error,
              t('settings.currency.saveError'),
            )}
          />
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p>
          {t('settings.currency.preview', {
            montant: '100',
            devise: data?.deviseParDefaut ?? DEVISE_BASE,
            resultat: formatTaux(
              roundCurrency(apercu, devise),
            ),
            deviseCible: devise,
          })}
        </p>
        {data?.deviseMiseAJour ? (
          <p className="mt-1 text-slate-400">
            {t('settings.currency.updatedAt', {
              date: new Date(data.deviseMiseAJour).toLocaleDateString(),
            })}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="devise-filtre"
        >
          {t('settings.currency.search')}
        </label>
        <input
          id="devise-filtre"
          type="search"
          value={filtre}
          placeholder={t('settings.currency.searchPlaceholder')}
          onChange={(event) => setFiltre(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
        <p className="text-xs text-slate-500">
          {t('settings.currency.ratesHint')}
        </p>
      </div>

      {currencies.isPending ? (
        <ul className="flex flex-col gap-2" aria-hidden>
          {[0, 1, 2, 3, 4].map((index) => (
            <li key={index} className="h-9 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </ul>
      ) : currencies.isError ? (
        <FormAlert
          message={extractErrorMessage(
            currencies.error,
            t('settings.currency.loadError'),
          )}
        />
      ) : (
        <ul className="max-h-96 overflow-y-auto pr-1">
          {liste.map((currency) => (
            <RateRow
              key={currency.code}
              code={currency.code}
              nomFr={currency.nomFr}
              nomEn={currency.nomEn}
              decimales={currency.decimales}
              tauxVersXof={currency.tauxVersXof}
              deviseParDefaut={data?.deviseParDefaut ?? DEVISE_BASE}
              deviseActive={devise}
              isSaving={updateRate.isPending}
              error={
                updateRate.isError
                  ? extractErrorMessage(
                      updateRate.error,
                      t('settings.currency.saveError'),
                    )
                  : null
              }
              onSave={(taux) =>
                updateRate.mutate({ code: currency.code, taux })
              }
            />
          ))}
          {liste.length === 0 ? (
            <li className="py-3 text-xs text-slate-400">
              {t('settings.currency.noResult')}
            </li>
          ) : null}
        </ul>
      )}
    </div>
  )
}
