import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useTranslation } from 'react-i18next'

import { FormAlert } from '#/components/auth/AuthCard'
import { useAdminOverview, useAdminUsers, useSetUserRole } from '#/lib/admin/queries'
import { extractErrorMessage } from '#/lib/errors'

const PERIODES = [7, 30, 90] as const

function formatDay(iso: string, locale: string): string {
  const [annee, mois, jour] = iso.split('-').map(Number)

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
  }).format(new Date(Date.UTC(annee, mois - 1, jour)))
}

function formatDateTime(iso: string | null, locale: string): string {
  if (!iso) return '—'

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function hostOf(source: string): string {
  try {
    return new URL(source).host.replace(/^www\./, '')
  } catch {
    return source
  }
}

interface KpiCardProps {
  label: string
  value: string | number
  hint?: string
  tone: 'neutral' | 'emerald' | 'indigo' | 'amber'
  loading: boolean
}

const TONES: Record<KpiCardProps['tone'], string> = {
  neutral: 'from-slate-900 to-slate-700',
  emerald: 'from-emerald-600 to-emerald-500',
  indigo: 'from-indigo-600 to-indigo-500',
  amber: 'from-amber-500 to-amber-400',
}

function KpiCard({ label, value, hint, tone, loading }: KpiCardProps) {
  return (
    <article
      className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-sm ${TONES[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-white/70">
        {label}
      </p>
      {loading ? (
        <p className="mt-3 h-8 w-20 animate-pulse rounded bg-white/25" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      )}
      {hint ? <p className="mt-1 text-xs text-white/70">{hint}</p> : null}
    </article>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}

export function AdminDashboard({ adminId }: { adminId: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'fr'
  const [jours, setJours] = useState<number>(30)
  const [recherche, setRecherche] = useState('')
  const [page, setPage] = useState(1)
  const [erreur, setErreur] = useState<string | null>(null)

  const overview = useAdminOverview(jours)
  const users = useAdminUsers(recherche, page)
  const setRole = useSetUserRole()

  const data = overview.data
  const trafic = useMemo(
    () =>
      (data?.trafic ?? []).map((point) => ({
        ...point,
        label: formatDay(point.jour, locale),
        anonymes: Math.max(point.vues - point.connectes, 0),
      })),
    [data?.trafic, locale],
  )

  const maxVues = useMemo(
    () => Math.max(1, ...(data?.topChemins ?? []).map((chemin) => chemin.vues)),
    [data?.topChemins],
  )

  const total = users.data?.total ?? 0
  const parPage = 20
  const pages = Math.max(1, Math.ceil(total / parPage))

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            {t('admin.badge')}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {t('admin.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t('admin.subtitle')}</p>
        </div>

        <div
          role="group"
          aria-label={t('admin.period')}
          className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
        >
          {PERIODES.map((valeur) => (
            <button
              key={valeur}
              type="button"
              aria-pressed={jours === valeur}
              onClick={() => setJours(valeur)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                jours === valeur
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('admin.periode', { jours: valeur })}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t('admin.kpiUsers')}
          value={data?.kpis.utilisateurs ?? 0}
          hint={t('admin.kpiUsersHint', {
            nouveaux: data?.kpis.nouveauxUtilisateurs ?? 0,
          })}
          tone="indigo"
          loading={overview.isPending}
        />
        <KpiCard
          label={t('admin.kpiViews')}
          value={data?.kpis.vuePeriode ?? 0}
          hint={t('admin.kpiViewsHint', { total: data?.kpis.vueTotale ?? 0 })}
          tone="neutral"
          loading={overview.isPending}
        />
        <KpiCard
          label={t('admin.kpiConversion')}
          value={`${data?.kpis.tauxConversion ?? 0} %`}
          hint={t('admin.kpiConversionHint', {
            connectes: data?.kpis.vuesConnectees ?? 0,
          })}
          tone="emerald"
          loading={overview.isPending}
        />
        <KpiCard
          label={t('admin.kpiTransactions')}
          value={data?.kpis.transactions ?? 0}
          hint={t('admin.kpiTransactionsHint', {
            periode: data?.kpis.transactionsPeriode ?? 0,
          })}
          tone="amber"
          loading={overview.isPending}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <SectionCard
            title={t('admin.trafficTitle')}
            subtitle={t('admin.trafficHint')}
          >
            {overview.isPending ? (
              <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
            ) : data && data.kpis.vuePeriode > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trafic}
                    margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="adminVues" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      minTickGap={18}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.75rem',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Legend
                      iconType="plainline"
                      iconSize={14}
                      formatter={(valeur: string) => (
                        <span className="text-xs text-slate-600">{valeur}</span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="vues"
                      name={t('admin.serieViews')}
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fill="url(#adminVues)"
                    />
                    <Area
                      type="monotone"
                      dataKey="connectes"
                      name={t('admin.serieConnected')}
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-20 text-center text-sm text-slate-500">
                {t('admin.trafficEmpty')}
              </p>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title={t('admin.topPathsTitle')}
          subtitle={t('admin.topPathsHint')}
        >
          {overview.isPending ? (
            <ul className="space-y-3">
              {[0, 1, 2, 3].map((index) => (
                <li key={index} className="h-8 animate-pulse rounded bg-slate-100" />
              ))}
            </ul>
          ) : data && data.topChemins.length > 0 ? (
            <ul className="space-y-3">
              {data.topChemins.map((chemin) => (
                <li key={chemin.chemin} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-mono text-xs text-slate-700">
                      {chemin.chemin}
                    </span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500">
                      {chemin.vues}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.max(4, (chemin.vues / maxVues) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              {t('admin.topPathsEmpty')}
            </p>
          )}

          {data && data.sources.length > 0 ? (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('admin.sourcesTitle')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.sources.map((entree) => (
                  <span
                    key={entree.source}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                  >
                    {hostOf(entree.source)} · {entree.vues}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title={t('admin.newUsersTitle')}
          subtitle={t('admin.newUsersHint')}
        >
          {overview.isPending ? (
            <ul className="space-y-2">
              {[0, 1, 2].map((index) => (
                <li key={index} className="h-12 animate-pulse rounded bg-slate-100" />
              ))}
            </ul>
          ) : data && data.derniersUtilisateurs.length > 0 ? (
            <ul className="space-y-2">
              {data.derniersUtilisateurs.map((utilisateur) => (
                <li
                  key={utilisateur.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {utilisateur.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(utilisateur.dateCreation, locale)} ·{' '}
                      {utilisateur.transactions} {t('admin.transactionsLabel')}
                    </p>
                  </div>
                  {utilisateur.role === 'admin' ? (
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {t('admin.roleAdmin')}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              {t('admin.newUsersEmpty')}
            </p>
          )}
        </SectionCard>

        <div className="min-w-0 lg:col-span-2">
          <SectionCard
            title={t('admin.usersTitle')}
            subtitle={t('admin.usersHint', { admins: users.data?.admins ?? 0 })}
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                value={recherche}
                onChange={(event) => {
                  setRecherche(event.target.value)
                  setPage(1)
                }}
                placeholder={t('admin.searchPlaceholder')}
                aria-label={t('admin.searchPlaceholder')}
                className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
              <span className="text-xs text-slate-500">
                {t('admin.total', { total })}
              </span>
            </div>

            {erreur ? (
              <div className="mb-3">
                <FormAlert message={erreur} />
              </div>
            ) : null}

            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-2 font-medium">{t('admin.columnUser')}</th>
                    <th className="px-2 py-2 font-medium">{t('admin.columnActivity')}</th>
                    <th className="px-2 py-2 font-medium">{t('admin.columnContent')}</th>
                    <th className="px-2 py-2 font-medium">{t('admin.columnJoined')}</th>
                    <th className="px-2 py-2 text-right font-medium">
                      {t('admin.columnRole')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(users.data?.lignes ?? []).map((utilisateur) => (
                    <tr key={utilisateur.id} className="hover:bg-slate-50">
                      <td className="px-2 py-2.5">
                        <p className="font-medium text-slate-900">
                          {utilisateur.email}
                        </p>
                        <p className="text-xs text-slate-500">
                          {utilisateur.languePreferee.toUpperCase()} ·{' '}
                          {utilisateur.devisePreferee}
                          {utilisateur.onboardingTerminee ? '' : ` · ${t('admin.onboardingTodo')}`}
                        </p>
                      </td>
                      <td className="px-2 py-2.5 text-xs text-slate-600">
                        {formatDateTime(utilisateur.derniereActivite, locale)}
                      </td>
                      <td className="px-2 py-2.5 text-xs text-slate-600">
                        {utilisateur.transactions} {t('admin.transactionsLabel')} ·{' '}
                        {utilisateur.categories} {t('admin.categoriesLabel')}
                      </td>
                      <td className="px-2 py-2.5 text-xs text-slate-600">
                        {formatDateTime(utilisateur.dateCreation, locale)}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <button
                          type="button"
                          disabled={
                            setRole.isPending || utilisateur.id === adminId
                          }
                          onClick={() => {
                            setErreur(null)
                            setRole
                              .mutate(
                                {
                                  id: utilisateur.id,
                                  role:
                                    utilisateur.role === 'admin' ? 'user' : 'admin',
                                },
                                {
                                  onError: (cause) =>
                                    setErreur(
                                      extractErrorMessage(
                                        cause,
                                        t('admin.roleUpdateError'),
                                      ),
                                    ),
                                },
                              )
                          }}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            utilisateur.role === 'admin'
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {utilisateur.role === 'admin'
                            ? t('admin.roleAdmin')
                            : t('admin.roleUser')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!users.isPending && (users.data?.lignes.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {t('admin.searchEmpty')}
              </p>
            ) : null}

            {pages > 1 ? (
              <nav className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  disabled={page <= 1 || users.isFetching}
                  onClick={() => setPage((valeur) => Math.max(1, valeur - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 transition disabled:opacity-40"
                >
                  {t('admin.previous')}
                </button>
                <span className="text-xs text-slate-500">
                  {page} / {pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pages || users.isFetching}
                  onClick={() => setPage((valeur) => Math.min(pages, valeur + 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 transition disabled:opacity-40"
                >
                  {t('admin.next')}
                </button>
              </nav>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
