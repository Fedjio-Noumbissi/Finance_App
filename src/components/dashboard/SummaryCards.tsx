import { useTranslation } from 'react-i18next'
import { formatMonthName, formatMoney } from '#/lib/format'
import type { MonthTotals } from '#/lib/stats/server'

interface SummaryCardsProps {
  totals: MonthTotals | undefined
  previousTotals: MonthTotals | undefined
  mois: string
  isLoading: boolean
}

interface CardData {
  label: string
  value: string
  hint: string
  tone: 'default' | 'income' | 'expense'
  variation: number | null
}

const toneClass: Record<CardData['tone'], string> = {
  default: 'text-slate-900',
  income: 'text-emerald-600',
  expense: 'text-rose-600',
}

function variationPct(
  current: number | undefined,
  previous: number | undefined,
): number | null {
  if (current === undefined || previous === undefined || previous === 0) {
    return null
  }

  return ((current - previous) / Math.abs(previous)) * 100
}

export function SummaryCards({
  totals,
  previousTotals,
  mois,
  isLoading,
}: SummaryCardsProps) {
  const { t } = useTranslation()

  const cards: CardData[] = [
    {
      label: t('dashboard.balance'),
      value: totals ? formatMoney(totals.solde) : '—',
      hint: t('dashboard.balanceHint'),
      tone: totals && totals.solde < 0 ? 'expense' : 'default',
      variation: variationPct(totals?.solde, previousTotals?.solde),
    },
    {
      label: t('dashboard.income'),
      value: totals ? formatMoney(totals.revenus) : '—',
      hint: formatMonthName(mois),
      tone: 'income',
      variation: variationPct(totals?.revenus, previousTotals?.revenus),
    },
    {
      label: t('dashboard.expense'),
      value: totals ? formatMoney(totals.depenses) : '—',
      hint: formatMonthName(mois),
      tone: 'expense',
      variation: variationPct(totals?.depenses, previousTotals?.depenses),
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <p className="text-sm text-slate-500">{card.label}</p>
          <p
            className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${toneClass[card.tone]}`}
          >
            {isLoading ? '…' : card.value}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-xs text-slate-400">{card.hint}</p>
            {card.variation === null ? null : (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                  card.variation > 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : card.variation < 0
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span aria-hidden>
                  {card.variation > 0 ? '↑' : card.variation < 0 ? '↓' : '='}
                </span>
                {`${Math.abs(Math.round(card.variation))} %`}
                <span className="sr-only">
                  {t('dashboard.variationScreenReader')}
                </span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
