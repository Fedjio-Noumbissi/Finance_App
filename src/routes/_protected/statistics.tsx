import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'

import { CalendarRange, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDevise } from '#/lib/currency/store'
import { MonthPicker } from '#/components/dashboard/MonthPicker'
import { BalanceLineChart } from '#/components/stats/BalanceLineChart'
import { ErrorPanel } from '#/components/ui/ErrorPanel'
import { Sparkline } from '#/components/ui/Sparkline'
import { StatCard } from '#/components/ui/StatCard'
import { currentMonthKey, isMonthKey } from '#/lib/dates/months'

import { useBalanceEvolution } from '#/lib/stats/queries'

export const Route = createFileRoute('/_protected/statistics')({
  validateSearch: (search: Record<string, unknown>): { mois?: string } => {
    const mois = search.mois

    return { mois: isMonthKey(mois) ? mois : undefined }
  },
  component: StatisticsPage,
})

function StatisticsPage() {
  const { t } = useTranslation()
  const { formatMontant } = useDevise()
  const search = useSearch({ from: '/_protected/statistics' })
  const navigate = useNavigate()
  const mois = search.mois ?? currentMonthKey()
  const evolution = useBalanceEvolution(mois)
  const points = evolution.data?.points
  const last = points?.at(-1)
  const cumulSolde = points?.reduce((sum, point) => sum + point.solde, 0) ?? 0

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('stats.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t('stats.subtitle')}</p>
        </div>

        <MonthPicker
          value={mois}
          onChange={(next) => {
            void navigate({
              to: '/statistics',
              search: { mois: next === currentMonthKey() ? undefined : next },
              replace: true,
            })
          }}
        />
      </div>

      {evolution.isError ? (
        <ErrorPanel
          message={t('stats.loadError')}
          retryLabel={t('common.retry')}
          onRetry={() => void evolution.refetch()}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label={t('stats.currentBalance')}
          value={evolution.isPending || !last ? '…' : formatMontant(last.solde)}
          tone={last && last.solde < 0 ? 'expense' : 'default'}
          icon={<CalendarRange aria-hidden className="size-4" strokeWidth={1.9} />}
          hint={t('stats.lastSixMonths')}
          footer={
            <Sparkline
              values={(points ?? []).map((point) => point.solde)}
              tone={last && last.solde < 0 ? 'expense' : 'income'}
              label={t('stats.sparklineLabel')}
            />
          }
        />

        <StatCard
          label={t('stats.cumulativeBalance')}
          value={evolution.isPending ? '…' : formatMontant(cumulSolde)}
          tone={cumulSolde < 0 ? 'expense' : 'income'}
          icon={<Layers aria-hidden className="size-4" strokeWidth={1.9} />}
          hint={t('stats.cumulativeHint')}
          footer={
            <div className="flex h-9 items-end gap-1" aria-hidden>
              {(points ?? []).map((point) => {
                const max = Math.max(
                  ...(points ?? []).map((p) => Math.abs(p.solde)),
                  1,
                )

                return (
                  <span
                    key={point.mois}
                    className={`flex-1 rounded-t-sm ${
                      point.solde < 0 ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                    style={{
                      height: `${Math.max(
                        6,
                        (Math.abs(point.solde) / max) * 100,
                      )}%`,
                    }}
                  />
                )
              })}
            </div>
          }
        />
      </div>

      <BalanceLineChart points={points} isLoading={evolution.isPending} />
    </main>
  )
}