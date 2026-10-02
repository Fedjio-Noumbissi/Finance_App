import { Link } from '@tanstack/react-router'

import { useDevise } from '#/lib/currency/store'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '#/components/ui/EmptyState'
import { formatDate } from '#/lib/format'
import { useCategoryName } from '#/lib/i18n/useCategoryName'
import type { RecentTransaction } from '#/lib/stats/server'
import { ReceiptText } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: RecentTransaction[] | undefined
  isLoading: boolean
}

export function RecentTransactions({
  transactions,
  isLoading,
}
: RecentTransactionsProps) {
  const { t } = useTranslation()
  const { formatMontant } = useDevise()
  const categoryName = useCategoryName()
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('dashboard.recentTransactions')}
        </h2>
        <Link
          className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
          to="/transactions"
        >
          {t('dashboard.viewAll')}
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : (transactions ?? []).length === 0 ? (
        <EmptyState
          compact
          icon={<ReceiptText className="size-5" strokeWidth={1.75} />}
          title={t('dashboard.noTransactions')}
          description={t('dashboard.noTransactionsHint')}
          actionLabel={t('dashboard.addFirstTransaction')}
          to="/transactions"
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {(transactions ?? []).map((transaction) => {
            const isIncome = transaction.type === 'revenu'

            return (
              <li
                key={transaction.id}
                className="flex items-center gap-3 py-2.5"
              >
                <span
                  aria-hidden
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: transaction.categorie.couleur }}
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {transaction.note ?? categoryName(transaction.categorie)}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {categoryName(transaction.categorie)} ·{' '}
                    {formatDate(transaction.date)}
                  </span>
                </span>

                <span
                  className={
                    isIncome
                      ? 'shrink-0 text-sm font-semibold tabular-nums text-emerald-600'
                      : 'shrink-0 text-sm font-semibold tabular-nums text-slate-900'
                  }
                >
                  {isIncome ? '+' : '−'}
                  {formatMontant(transaction.montant)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}