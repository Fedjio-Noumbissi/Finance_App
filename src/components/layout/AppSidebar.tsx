import { Link, useRouterState } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'
import { LogoutButton } from '#/components/auth/LogoutButton'
import { LanguageSelector } from '#/components/layout/LanguageSelector'
import { useAuth } from '#/lib/auth/context'

const ICONS: Record<string, string> = {
  '/dashboard': '▤',
  '/transactions': '⇄',
  '/statistics': '◔',
  '/settings': '⚙',
}

export function AppSidebar() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const links = user
    ? [
        { to: '/dashboard', label: t('nav.dashboard') },
        { to: '/transactions', label: t('nav.transactions') },
        { to: '/statistics', label: t('nav.statistics') },
        { to: '/settings', label: t('nav.settings') },
      ]
    : [
        { to: '/login', label: t('nav.login') },
        { to: '/signup', label: t('nav.signup') },
      ]

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5">
        <Link
          to="/"
          className="text-base font-semibold tracking-tight text-slate-900"
        >
          {t('appName')}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {links.map((link) => {
          const active = pathname === link.to

          return (
            <Link
              key={link.to}
              to={link.to}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-slate-900 font-semibold text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span
                aria-hidden
                className={`w-4 text-center text-sm ${
                  active ? 'text-white' : 'text-slate-400'
                }`}
              >
                {ICONS[link.to] ?? '•'}
              </span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3">
        <div className="mb-2 px-1">
          <LanguageSelector />
        </div>
        <LogoutButton block />
      </div>
    </aside>
  )
}
