import { Link, useRouterState } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'

const HIDDEN_ROUTES = new Set(['/', '/login', '/signup', '/settings'])

export function QuickAddFab() {
  const { t } = useTranslation()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (HIDDEN_ROUTES.has(pathname)) {
    return null
  }

  return (
    <Link
      to="/transactions"
      search={{ quick: true }}
      className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl text-white shadow-lg transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:bottom-8 sm:right-8"
      aria-label={t('transaction.addTitle')}
      title={t('transaction.addTitle')}
    >
      <span aria-hidden>+</span>
    </Link>
  )
}
