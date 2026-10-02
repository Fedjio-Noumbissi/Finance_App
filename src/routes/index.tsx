import { Link, createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays,
  ChartLine,
  Coins,
  Languages,
  LayoutDashboard,
  Tags,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { useAuth } from '#/lib/auth/context'

export const Route = createFileRoute('/')({ component: Home })

const features: { key: string; icon: LucideIcon }[] = [
  { key: 'feature1', icon: LayoutDashboard },
  { key: 'feature2', icon: Tags },
  { key: 'feature3', icon: ChartLine },
  { key: 'feature4', icon: CalendarDays },
  { key: 'feature5', icon: Languages },
  { key: 'feature6', icon: Coins },
]

const steps = ['step1', 'step2', 'step3'] as const

function Home() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl">
        {/* ---------- Héro ---------- */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(45rem_22rem_at_50%_0%,var(--tw-gradient-stops))] from-sky-100 via-sky-50 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-sky-100/70 blur-3xl"
          />

          <div className="relative px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t('home.badge')}
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                {t('home.title')}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {t('home.subtitle')}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700"
                >
                  {t('home.primaryCta')}
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  {t('home.secondaryCta')}
                </Link>
              </div>

              <dl className="mt-14 grid w-full max-w-lg grid-cols-3 gap-3">
                {(['heroStat1', 'heroStat2', 'heroStat3'] as const).map((stat) => (
                  <div
                    key={stat}
                    className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-4 backdrop-blur"
                  >
                    <dd className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {t(`home.${stat}Value`)}
                    </dd>
                    <dt className="mt-1 text-xs text-slate-500">
                      {t(`home.${stat}Label`)}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------- Aperçu produit ---------- */}
        <section className="px-4 pb-4 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-6">
            <div className="flex items-center gap-2 pb-4">
              <span aria-hidden className="h-3 w-3 rounded-full bg-rose-400" />
              <span aria-hidden className="h-3 w-3 rounded-full bg-amber-400" />
              <span aria-hidden className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: t('dashboard.balance'), value: '245 000,00 F CFA', tone: 'text-slate-900' },
                { label: t('dashboard.income'), value: '320 000,00 F CFA', tone: 'text-emerald-600' },
                { label: t('dashboard.expense'), value: '75 000,00 F CFA', tone: 'text-rose-600' },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className={`mt-1.5 text-sm font-bold tabular-nums sm:text-base ${card.tone}`}>
                    {card.value}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <TrendingUp aria-hidden className="size-3" strokeWidth={2.5} />
                    12 %
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-32 items-end gap-2">
                {[38, 52, 44, 66, 58, 80].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col gap-1">
                    <div
                      className="rounded-t-md bg-sky-400/80"
                      style={{ height: `${height * 0.6}%` }}
                    />
                    <div
                      className="rounded-t-md bg-rose-300/70"
                      style={{ height: `${height * 0.3}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Fonctionnalités ---------- */}
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t('home.featuresTitle')}
              </h2>
              <p className="mt-3 text-base text-slate-600">
                {t('home.featuresSubtitle')}
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icone = feature.icon

                return (
                  <div
                    key={feature.key}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5"
                  >
                    <span
                      aria-hidden
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition group-hover:bg-slate-900 group-hover:text-white"
                    >
                      <Icone className="size-5" strokeWidth={2} />
                    </span>
                    <h3 className="mt-4 font-semibold text-slate-900">
                      {t(`home.${feature.key}Title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {t(`home.${feature.key}Body`)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ---------- Comment ça marche ---------- */}
        <section className="border-y border-slate-200 bg-slate-50 px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t('home.stepsTitle')}
              </h2>
              <p className="mt-3 text-base text-slate-600">
                {t('home.stepsSubtitle')}
              </p>
            </div>

            <ol className="mt-12 grid gap-6 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    {index < steps.length - 1 ? (
                      <span
                        aria-hidden
                        className="hidden h-px flex-1 bg-slate-300 sm:block"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">
                    {t(`home.${step}Title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {t(`home.${step}Body`)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Appel à l'action ---------- */}
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center sm:px-14">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('home.ctaTitle')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
              {t('home.ctaBody')}
            </p>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {user ? t('nav.dashboard') : t('home.ctaButton')}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p className="font-medium text-slate-900">{t('appName')}</p>
          <p>{t('home.footerNote')}</p>
        </div>
      </footer>
    </div>
  )
}
