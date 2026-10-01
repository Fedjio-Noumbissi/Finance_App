import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useTranslation } from 'react-i18next'
import { useDevise } from '#/lib/currency/store'
import { formatShortMonth } from '#/lib/format'
import type { BalancePoint } from '#/lib/stats/server'

interface BalanceLineChartProps {
  points: BalancePoint[] | undefined
  isLoading: boolean
}

interface ChartPoint {
  mois: string
  label: string
  revenus: number
  depenses: number
  solde: number
}

export function BalanceLineChart({ points, isLoading }
: BalanceLineChartProps) {
  const { formatMontant, formatCompact } = useDevise()
  const { t, i18n } = useTranslation()
  const data = useMemo<ChartPoint[]>(
    () =>
      (points ?? []).map((point) => ({
        mois: point.mois,
        label: formatShortMonth(point.mois),
        revenus: point.revenus,
        depenses: point.depenses,
        solde: point.solde,
      })),
    [i18n.resolvedLanguage, points],
  )

  const hasData = data.some((point) => point.solde !== 0)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('stats.balanceEvolution')}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {t('stats.balanceEvolutionHint')}
        </p>
      </header>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
      ) : !hasData ? (
        <p className="py-20 text-center text-sm text-slate-500">
          {t('stats.noData')}
        </p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(value: number) => formatCompact(value)}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatMontant(typeof value === 'number' ? value : Number(value)),
                  String(name),
                ]}
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.75rem',
                }}
              />
              <Legend
                iconType="plainline"
                iconSize={14}
                formatter={(value: string) => (
                  <span className="text-xs text-slate-600">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="solde"
                name={t('stats.serieSolde')}
                stroke="#0f172a"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0f172a' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="revenus"
                name={t('stats.serieIncome')}
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="depenses"
                name={t('stats.serieExpense')}
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}