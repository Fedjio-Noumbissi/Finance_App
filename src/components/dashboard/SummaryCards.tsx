import { useMemo } from 'react'

import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDevise } from '#/lib/currency/store'
import { formatMonthName } from '#/lib/format'
import type { MonthTotals } from '#/lib/stats/server'

import { DeltaPill, StatCard } from '#/components/ui/StatCard'
import { Sparkline } from '#/components/ui/Sparkline'

interface SummaryCardsProps {
  totals: MonthTotals | undefined
  previousTotals: MonthTotals | undefined
  mois: string
  isLoading: boolean
  /** Soldes des derniers mois pour la courbe du solde. */
  evolution: number[]
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
  evolution,
}: SummaryCardsProps) {
  const { t } = useTranslation()
  const { formatMontant } = useDevise()

  const soldeSerie = useMemo(() => evolution.slice(-6), [evolution])

  return (
    <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
      <StatCard
        emphasis
        label={t('dashboard.balance')}
        value={isLoading ? '…' : totals ? formatMontant(totals.solde) : '—'}
        icon={<Scale aria-hidden className="size-4" strokeWidth={1.9} />}
        delta={
          <DeltaPill
            emphasis
            percent={variationPct(totals?.solde, previousTotals?.solde)}
            label={t('dashboard.variationScreenReader')}
          />
        }
        hint={formatMonthName(mois)}
        footer={
          <Sparkline
            values={soldeSerie}
            tone={totals && totals.solde < 0 ? 'expense' : 'income'}
            label={t('dashboard.balanceEvolutionLabel')}
          />
        }
      />

      <StatCard
        tone="income"
        label={t('dashboard.income')}
        value={isLoading ? '…' : totals ? formatMontant(totals.revenus) : '—'}
        icon={<ArrowUpRight aria-hidden className="size-4" strokeWidth={2.2} />}
        delta={
          <DeltaPill
            percent={variationPct(totals?.revenus, previousTotals?.revenus)}
            label={t('dashboard.variationScreenReader')}
          />
        }
        hint={formatMonthName(mois)}
      />

      <StatCard
        tone="expense"
        label={t('dashboard.expense')}
        value={isLoading ? '…' : totals ? formatMontant(totals.depenses) : '—'}
        icon={<ArrowDownRight aria-hidden className="size-4" strokeWidth={2.2} />}
        delta={
          <DeltaPill
            inverted
            percent={variationPct(totals?.depenses, previousTotals?.depenses)}
            label={t('dashboard.variationScreenReader')}
          />
        }
        hint={formatMonthName(mois)}
      />
    </div>
  )
}