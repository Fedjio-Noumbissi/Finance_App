import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'
import { MonthPicker } from '#/components/dashboard/MonthPicker'
import { RecentTransactions } from '#/components/dashboard/RecentTransactions'
import { SummaryCards } from '#/components/dashboard/SummaryCards'
import { CategoryRank } from '#/components/ui/CategoryRank'
import { ErrorPanel } from '#/components/ui/ErrorPanel'
import { FirstRunBanner } from '#/components/onboarding/FirstRunBanner'
import { currentMonthKey, isMonthKey } from '#/lib/dates/months'
import {
  useBalanceEvolution,
  useDashboardData,
} from '#/lib/stats/queries'

export const Route = createFileRoute('/_protected/dashboard')({
  validateSearch: (search: Record<string, unknown>): { mois?: string } => {
    const mois = search.mois

    return { mois: isMonthKey(mois) ? mois : undefined }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_protected/dashboard' })
  const navigate = useNavigate()
  const mois = search.mois ?? currentMonthKey()
  const dashboard = useDashboardData(mois)
  const balance = useBalanceEvolution(mois)
  const data = dashboard.data

  const soldes = (balance.data?.points ?? []).map((point) => point.solde)
  const totalDepenses = data?.resume.depenses ?? 0

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t('dashboard.title')}
        </h1>

        <MonthPicker
          value={mois}
          onChange={(next) => {
            void navigate({
              to: '/dashboard',
              search: { mois: next === currentMonthKey() ? undefined : next },
              replace: true,
            })
          }}
        />
      </div>

      {dashboard.isError ? (
        <ErrorPanel
          message={t('dashboard.loadError')}
          retryLabel={t('common.retry')}
          onRetry={() => void dashboard.refetch()}
        />
      ) : null}

      {!dashboard.isPending && data && data.totalTransactions === 0 ? (
        <FirstRunBanner />
      ) : null}

      <SummaryCards
        totals={data?.resume}
        previousTotals={data?.moisPrecedentResume}
        mois={data?.mois ?? ''}
        isLoading={dashboard.isPending}
        evolution={soldes}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {t('dashboard.expensesByCategory')}
          </h2>
          <CategoryRank
            items={data?.depensesParCategorie ?? []}
            total={totalDepenses}
            emptyLabel={
              dashboard.isPending ? '…' : t('dashboard.noCategoryData')
            }
          />
        </section>

        <RecentTransactions
          transactions={data?.dernieresTransactions}
          isLoading={dashboard.isPending}
        />
      </div>
    </main>
  )
}