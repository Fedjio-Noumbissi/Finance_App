import { useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useTranslation } from 'react-i18next'
import { formatMoney } from '#/lib/format'
import { EmptyState } from '#/components/ui/EmptyState'
import { useCategoryName } from '#/lib/i18n/useCategoryName'
import type { CategoryExpense } from '#/lib/stats/server'

interface ExpensesPieChartProps {
  data: CategoryExpense[] | undefined
  isLoading: boolean
}

interface PieEntry {
  name: string
  value: number
  part: number
  fill: string
}

export function ExpensesPieChart({ data, isLoading }
: ExpensesPieChartProps) {
  const { t } = useTranslation()
  const categoryName = useCategoryName()
  const entries = useMemo<PieEntry[]>(
    () =>
      (data ?? []).map((item) => ({
        name: categoryName(item),
        value: item.total,
        part: item.part,
        fill: item.couleur,
      })),
    [categoryName, data],
  )

  const total = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.value, 0),
    [entries],
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('dashboard.expensesByCategory')}
        </h2>
        {total > 0 ? (
          <span className="text-sm font-medium tabular-nums text-slate-700">
            {formatMoney(total)}
          </span>
        ) : null}
      </header>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      ) : entries.length === 0 ? (
        <EmptyState
          compact
          icon="📊"
          title={t('dashboard.noExpenses')}
          description={t('dashboard.noExpensesHint')}
          actionLabel={t('dashboard.addFirstTransaction')}
          to="/transactions"
        />
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={entries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {entries.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as PieEntry | undefined

                    if (!active || !point) {
                      return null
                    }

                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
                        <p className="font-medium text-slate-900">{point.name}</p>
                        <p className="text-slate-600">
                          {formatMoney(point.value)} ·{' '}
                          {point.part.toFixed(1).replace('.', ',')} %
                        </p>
                      </div>
                    )
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-slate-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
            {entries.map((entry) => (
              <li key={entry.name} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="flex-1 truncate text-slate-700">
                  {entry.name}
                </span>
                <span className="tabular-nums text-slate-500">
                  {formatMoney(entry.value)}
                </span>
                <span className="w-14 text-right tabular-nums text-slate-400">
                  {entry.part.toFixed(0)} %
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}