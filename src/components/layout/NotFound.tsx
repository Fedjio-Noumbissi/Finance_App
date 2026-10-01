import { Link } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'

export function NotFound() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        404
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {t('notFound.title')}
      </h1>
      <p className="text-sm text-slate-600">{t('notFound.description')}</p>

      <Link
        to="/dashboard"
        className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        {t('notFound.backToDashboard')}
      </Link>
    </main>
  )
}
