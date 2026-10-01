import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'
import { useDevise } from '#/lib/currency/store'
import { MonthPicker } from '#/components/dashboard/MonthPicker'
import { BalanceLineChart } from '#/components/stats/BalanceLineChart'
import { ErrorPanel } from '#/components/ui/ErrorPanel'
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">{t('stats.currentBalance')}</p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums ${last && last.solde < 0 ? 'text-rose-600' : 'text-slate-900'}`}
          >
            {evolution.isPending || !last ? '…' : formatMontant(last.solde)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {t('stats.lastSixMonths')}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">{t('stats.cumulativeBalance')}</p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums ${cumulSolde < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
          >
            {evolution.isPending ? '…' : formatMontant(cumulSolde)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {t('stats.cumulativeHint')}
          </p>
        </div>
      </div>

      <BalanceLineChart points={points} isLoading={evolution.isPending} />
    </main>
  )
}