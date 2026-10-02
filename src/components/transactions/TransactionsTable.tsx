import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_datetime,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { Fragment, useMemo, useState } from 'react'

import { useDevise } from '#/lib/currency/store'
import { useTranslation } from 'react-i18next'
import { formatDate } from '#/lib/format'
import { EmptyState } from '#/components/ui/EmptyState'
import { useCategoryName } from '#/lib/i18n/useCategoryName'
import { useDeleteTransaction } from '#/lib/transactions/queries'
import type { TransactionWithCategory } from '#/lib/transactions/server'
import type { TransactionType } from '#/lib/db/schema'

import { TransactionForm, type CategoryOption } from './TransactionForm'
import { ReceiptText } from 'lucide-react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

const EMPTY_ROWS: TransactionWithCategory[] = []

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<typeof features, TransactionWithCategory>()

const sortableHeaderClass =
  'inline-flex cursor-pointer items-center gap-1 hover:text-slate-900'

interface TransactionsTableProps {
  rows: TransactionWithCategory[] | undefined
  categories: CategoryOption[]
  isLoading: boolean
  error: boolean
  onReload: () => void
  onFocusForm: () => void
}

export function TransactionsTable({
  rows,
  categories,
  isLoading,
  error,
  onReload,
  onFocusForm,
}: TransactionsTableProps) {
  const { t } = useTranslation()
  const { formatMontant, formatMontantAvecCode } = useDevise()
  const categoryName = useCategoryName()
  const [editingId, setEditingId] = useState<string | null>(null)

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('date', {
          header: () => t('transaction.table.date'),
          cell: (info) => formatDate(info.getValue()),
          sortFn: sortFn_datetime,
        }),
        columnHelper.accessor((row) => row.categorie, {
          id: 'categorie',
          header: () => t('transaction.table.categorie'),
          cell: (info) => {
            const categorie = info.getValue()

            return (
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: categorie.couleur ?? '#94a3b8' }}
                />
                <span className="text-slate-900">{categoryName(categorie)}</span>
              </span>
            )
          },
        }),
        columnHelper.accessor((row) => Number(row.montant), {
          id: 'montant',
          header: () => t('transaction.table.montant'),
          cell: (info) => {
            const value = info.getValue()
            const { type, deviseSaisie, montantSaisi } = info.row.original
            const isIncome = type === 'revenu'

            return (
              <span className="flex flex-col items-end">
                <span
                  className={
                    isIncome
                      ? 'font-medium tabular-nums text-emerald-600'
                      : 'font-medium tabular-nums text-slate-900'
                  }
                >
                  {isIncome ? '+' : '−'}
                  {formatMontant(value)}
                </span>
                {deviseSaisie && montantSaisi ? (
                  <span
                    title={t('transaction.table.originalAmount')}
                    className="text-[11px] tabular-nums text-slate-400"
                  >
                    {formatMontantAvecCode(montantSaisi, deviseSaisie)}
                  </span>
                ) : null}
              </span>
            )
          },
        }),
        columnHelper.accessor('type', {
          header: () => t('transaction.table.type'),
          cell: (info) => <TypeBadge type={info.getValue()} />,
        }),
        columnHelper.accessor('note', {
          header: () => <span className="hidden md:inline">{t('transaction.table.note')}</span>,
          enableSorting: false,
          cell: (info) => (
            <span className="hidden max-w-[16rem] truncate md:inline">
              {info.getValue() ?? '—'}
            </span>
          ),
        }),
        columnHelper.display({
          id: 'actions',
          header: () => t('transaction.table.actions'),
          cell: (info) => (
            <RowActions
              transaction={info.row.original}
              onEdit={() => setEditingId(info.row.original.id)}
            />
          ),
        }),
      ]),
    // Les cellules referencent le formatage : sans ces dependances, les
    // colonnes garderaient la devise d'affichage capturee au premier rendu.
    [categoryName, formatMontant, formatMontantAvecCode, t],
  )

  const table = useTable({
    features,
    data: rows ?? EMPTY_ROWS,
    columns,
    initialState: { sorting: [{ id: 'date', desc: true }] },
  })

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-500">{t('transaction.table.loading')}</p>
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-2 p-6">
        <p className="text-sm text-red-600">{t('transaction.table.error')}</p>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          type="button"
          onClick={onReload}
        >
          {t('common.retry')}
        </button>
      </div>
    )
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="size-5" strokeWidth={1.75} />}
        title={t('transaction.table.empty')}
        description={t('transaction.table.emptyHint')}
        actionLabel={t('transaction.table.emptyAction')}
        onAction={onFocusForm}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr
              key={group.id}
              className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500"
            >
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  className={`${
                    header.column.id === 'montant' || header.column.id === 'actions'
                      ? 'px-4 py-3 text-right font-medium'
                      : 'px-4 py-3 font-medium'
                  }${header.column.id === 'note' ? ' hidden md:table-cell' : ''}`}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      className={sortableHeaderClass}
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                      <SortIndicator direction={header.column.getIsSorted()} />
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr className="border-b border-slate-100 last:border-0">
                {row.getAllCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`${
                      cell.column.id === 'montant'
                        ? 'px-4 py-3 text-right'
                        : 'px-4 py-3'
                    }${cell.column.id === 'note' ? ' hidden md:table-cell' : ''}`}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>

              {row.original.id === editingId ? (
                <tr>
                  <td className="px-4 pb-6" colSpan={row.getAllCells().length}>
                    <TransactionForm
                      categories={categories}
                      transaction={row.original}
                      onDone={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RowActions({
  transaction,
  onEdit,
}: {
  transaction: TransactionWithCategory
  onEdit: () => void
}) {
  const { t } = useTranslation()
  const remove = useDeleteTransaction()
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        type="button"
        onClick={onEdit}
      >
        {t('transaction.table.edit')}
      </button>

      {confirming ? (
        <>
          <button
            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
            type="button"
            disabled={remove.isPending}
            onClick={() => remove.mutate(transaction.id)}
          >
            {t('transaction.table.confirmDelete')}
          </button>
          <button
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-900"
            type="button"
            onClick={() => setConfirming(false)}
          >
            {t('transaction.form.cancel')}
          </button>
        </>
      ) : (
        <button
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-red-300 hover:text-red-600"
          type="button"
          onClick={() => setConfirming(true)}
        >
          {t('transaction.table.delete')}
        </button>
      )}
    </div>
  )
}

function TypeBadge({ type }: { type: TransactionType }) {
  const { t } = useTranslation()
  const isIncome = type === 'revenu'

  return (
    <span
      className={
        isIncome
          ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
          : 'rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700'
      }
    >
      {t(`transaction.form.${type}` as const)}
    </span>
  )
}

function SortIndicator({
  direction,
}: {
  direction: false | 'asc' | 'desc'
}) {
  if (direction === false) {
    return (
      <ChevronsUpDown
        aria-hidden
        className="size-3.5 text-slate-300"
        strokeWidth={2}
      />
    )
  }

  return direction === 'asc' ? (
    <ArrowUp aria-hidden className="size-3.5" strokeWidth={2.5} />
  ) : (
    <ArrowDown aria-hidden className="size-3.5" strokeWidth={2.5} />
  )
}