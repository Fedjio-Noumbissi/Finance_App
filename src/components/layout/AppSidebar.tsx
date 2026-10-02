import { Link, useRouterState } from '@tanstack/react-router'
import {
  ArrowLeftRight,
  ChartPie,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { LogoutButton } from '#/components/auth/LogoutButton'
import { CurrencySelector } from '#/components/layout/CurrencySelector'
import { LanguageSelector } from '#/components/layout/LanguageSelector'
import { useAuth } from '#/lib/auth/context'

const ICONS: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/transactions': ArrowLeftRight,
  '/statistics': ChartPie,
  '/settings': Settings,
  '/admin': ShieldCheck,
}

export function AppSidebar() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const liens = user
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

  const liensAdmin =
    profile?.role === 'admin'
      ? [{ to: '/admin', label: t('nav.admin') }]
      : []

  const links = [...liens, ...liensAdmin]

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
          const Icone = ICONS[link.to]

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
              {Icone ? (
                <Icone
                  aria-hidden
                  className={`size-4 shrink-0 ${
                    active ? 'text-white' : 'text-slate-400'
                  }`}
                  strokeWidth={2}
                />
              ) : null}
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-2 px-1">
          <CurrencySelector className="min-w-0 flex-1" />
          <LanguageSelector />
        </div>
        <LogoutButton block />
      </div>
    </aside>
  )
}
