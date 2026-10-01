import { useEffect, useRef, useState } from 'react'

import { useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { MonthPicker } from '#/components/dashboard/MonthPicker'
import { ErrorPanel } from '#/components/ui/ErrorPanel'
import { extractErrorMessage } from '#/lib/errors'
import {
  useCategoryList,
  useTransactionList,
} from '#/lib/transactions/queries'

import { TransactionForm } from './TransactionForm'
import { TransactionsTable } from './TransactionsTable'
import {
  filtersToMonthKey,
  filtersToQuery,
  initialFilters,
  monthToRange,
  TransactionsFilters,
  type FiltersState,
} from './TransactionsFilters'

export function TransactionsPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<FiltersState>(initialFilters)
  const search = useSearch({ from: '/_protected/transactions' })
  const navigate = useNavigate()
  const formSectionRef = useRef<HTMLElement>(null)

  function focusForm() {
    const section = formSectionRef.current

    if (!section) {
      return
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'center' })

    section
      .querySelector<HTMLInputElement>('input[name="montant"]')
      ?.focus()
  }

  useEffect(() => {
    if (!search.quick) {
      return
    }

    focusForm()

    void navigate({
      to: '/transactions',
      search: { quick: undefined },
      replace: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.quick])

  const categoriesQuery = useCategoryList()
  const transactionsQuery = useTransactionList(filtersToQuery(filters))

  const categories = categoriesQuery.data ?? []

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('transaction.title')}
          </h1>
          <p className="mt-1 text-slate-600">{t('transaction.subtitle')}</p>
        </div>

        <MonthPicker
          value={filtersToMonthKey(filters)}
          onChange={(mois) => {
            setFilters({ ...filters, preset: 'custom', ...monthToRange(mois) })
          }}
        />
      </header>

      {categoriesQuery.isError ? (
        <ErrorPanel
          message={extractErrorMessage(
            categoriesQuery.error,
            t('settings.categories.loadError'),
          )}
          retryLabel={t('common.retry')}
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : null}

      <section
        ref={formSectionRef}
        id="transaction-form"
        className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('transaction.addTitle')}
        </h2>
        <TransactionForm categories={categories} />
      </section>

      <TransactionsFilters
        state={filters}
        onChange={setFilters}
        categories={categories}
      />

      <section className="rounded-2xl border border-slate-200 bg-white">
        <TransactionsTable
          rows={transactionsQuery.data}
          categories={categories}
          isLoading={transactionsQuery.isPending}
          error={transactionsQuery.isError}
          onReload={() => void transactionsQuery.refetch()}
          onFocusForm={focusForm}
        />
      </section>
    </main>
  )
}
