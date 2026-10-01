import { useTranslation } from 'react-i18next'
import { currentMonthKey, shiftMonthKey } from '#/lib/dates/months'
import { monthRange, todayIso } from '#/lib/format'
import { useCategoryName } from '#/lib/i18n/useCategoryName'
import type { TransactionFilters } from '#/lib/transactions/schema'
import type { CategoryOption } from './TransactionForm'

export type PeriodPreset = 'thisMonth' | 'lastMonth' | 'custom'

export interface FiltersState {
  preset: PeriodPreset
  categorieId: string | null
  du: string
  au: string
}

export function initialFilters(): FiltersState {
  return { preset: 'thisMonth', categorieId: null, ...monthRange(new Date()) }
}

export function filtersToQuery(state: FiltersState): TransactionFilters {
  if (state.preset === 'thisMonth') {
    return { categorieId: state.categorieId, ...monthRange(new Date()) }
  }

  if (state.preset === 'lastMonth') {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    return { categorieId: state.categorieId, ...monthRange(lastMonth) }
  }

  return {
    categorieId: state.categorieId,
    du: state.du || null,
    au: state.au || null,
  }
}

export function monthToRange(mois: string): { du: string; au: string } {
  const [year, month] = mois.split('-').map(Number)
  const lastDay = new Date(Date.UTC(year ?? 1970, month ?? 1, 0)).getUTCDate()

  return {
    du: `${mois}-01`,
    au: `${mois}-${String(lastDay).padStart(2, '0')}`,
  }
}

export function filtersToMonthKey(state: FiltersState): string {
  if (state.preset === 'lastMonth') {
    return shiftMonthKey(currentMonthKey(), -1)
  }

  if (state.preset === 'custom' && /^(du|\d{4}-\d{2})/.test(state.du)) {
    const start = state.du.slice(0, 7)
    const end = state.au.slice(0, 7)

    if (start === end && /^\d{4}-\d{2}$/.test(start)) {
      return start
    }
  }

  return currentMonthKey()
}

export function TransactionsFilters({
  state,
  onChange,
  categories,
}: {
  state: FiltersState
  onChange: (next: FiltersState) => void
  categories: CategoryOption[]
}) {
  const { t } = useTranslation()
  const categoryName = useCategoryName()

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-500" htmlFor="filtre-categorie">
          {t('transaction.filters.categorie')}
        </label>
        <select
          id="filtre-categorie"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-900"
          value={state.categorieId ?? ''}
          onChange={(event) =>
            onChange({ ...state, categorieId: event.target.value || null })
          }
        >
          <option value="">{t('transaction.filters.allCategories')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {categoryName(category)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-500">
          {t('transaction.filters.period')}
        </span>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(['thisMonth', 'lastMonth', 'custom'] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange({ ...state, preset })}
              className={
                state.preset === preset
                  ? 'rounded-md bg-white px-3 py-1 text-sm font-medium text-slate-900 shadow-sm'
                  : 'rounded-md px-3 py-1 text-sm text-slate-600 transition hover:text-slate-900'
              }
            >
              {t(`transaction.filters.${preset}` as const)}
            </button>
          ))}
        </div>
      </div>

      {state.preset === 'custom' ? (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500" htmlFor="filtre-du">
              {t('transaction.filters.from')}
            </label>
            <input
              id="filtre-du"
              type="date"
              max={todayIso()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-900"
              value={state.du}
              onChange={(event) => onChange({ ...state, du: event.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500" htmlFor="filtre-au">
              {t('transaction.filters.to')}
            </label>
            <input
              id="filtre-au"
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-900"
              value={state.au}
              onChange={(event) => onChange({ ...state, au: event.target.value })}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}