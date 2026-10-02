import { useTranslation } from 'react-i18next'
import { useCategoryName } from '#/lib/i18n/useCategoryName'
import { useDevise } from '#/lib/currency/store'

interface RankItem {
  categorieId: string
  nomFr: string
  nomEn: string | null
  couleur: string
  total: number
  part: number
}

/**
 * Repartition des depenses : une barre unique montre les parts, la liste
 * ci-dessous donne le detail sans repeter la devise partout.
 */
export function CategoryRank({
  items,
  total,
  emptyLabel,
}: {
  items: RankItem[]
  total: number
  emptyLabel: string
}) {
  const { t } = useTranslation()
  const { formatMontant } = useDevise()
  const categoryName = useCategoryName()

  if (items.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div>
      <div
        aria-hidden
        className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
      >
        {items.map((item) => (
          <span
            key={item.categorieId}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${Math.max(item.part, 1.5)}%`,
              backgroundColor: item.couleur ?? '#94a3b8',
            }}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.categorieId} className="flex items-center gap-3">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.couleur ?? '#94a3b8' }}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
              {categoryName(item)}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
              {formatMontant(item.total)}
            </span>
            <span className="w-11 shrink-0 text-right text-xs font-medium tabular-nums text-slate-400">
              {`${Math.round(item.part)} %`}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-slate-400">
        {t('dashboard.categoryTotal', { total: formatMontant(total) })}
      </p>
    </div>
  )
}