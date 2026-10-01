import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'
import { MonthPicker } from '#/components/dashboard/MonthPicker'
import { ExpensesPieChart } from '#/components/dashboard/ExpensesPieChart'
import { RecentTransactions } from '#/components/dashboard/RecentTransactions'
import { SummaryCards } from '#/components/dashboard/SummaryCards'
import { ErrorPanel } from '#/components/ui/ErrorPanel'
import { FirstRunBanner } from '#/components/onboarding/FirstRunBanner'
import { useAuth } from '#/lib/auth/context'
import { currentMonthKey, isMonthKey } from '#/lib/dates/months'
import { useDashboardData } from '#/lib/stats/queries'

export const Route = createFileRoute('/_protected/dashboard')({
  validateSearch: (search: Record<string, unknown>): { mois?: string } => {
    const mois = search.mois

    return { mois: isMonthKey(mois) ? mois : undefined }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const search = useSearch({ from: '/_protected/dashboard' })
  const navigate = useNavigate()
  const mois = search.mois ?? currentMonthKey()
  const dashboard = useDashboardData(mois)
  const data = dashboard.data

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t('dashboard.hello')}</p>
        </div>

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
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ExpensesPieChart
          data={data?.depensesParCategorie}
          isLoading={dashboard.isPending}
        />
        <RecentTransactions
          transactions={data?.dernieresTransactions}
          isLoading={dashboard.isPending}
        />
      </div>

      <p className="text-xs text-slate-400">
        {t('dashboard.loggedInAs')} : {user?.email ?? '—'}
      </p>
    </main>
  )
}
