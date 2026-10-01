import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Link, useRouterState } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'
import { LogoutButton } from '#/components/auth/LogoutButton'
import { LanguageSelector } from '#/components/layout/LanguageSelector'
import { useAuth } from '#/lib/auth/context'

const MENU_ID = 'site-header-menu'

function MenuIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

export function SiteHeader({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [open, setOpen] = useState(false)

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

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <header
      className={`sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 ${className}`}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link className="font-semibold text-slate-900" to="/">
          {t('appName')}
        </Link>

        <nav
          aria-label={t('nav.primary')}
          className="hidden items-center gap-5 text-sm lg:flex"
        >
          <LanguageSelector />

          {links.map((link) => {
            const active = pathname === link.to

            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap transition ${
                  active
                    ? 'font-semibold text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {user ? <LogoutButton /> : null}
        </nav>

        <button
          type="button"
          aria-controls={MENU_ID}
          aria-expanded={open}
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          onClick={() => setOpen((previous) => !previous)}
          className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open ? (
        <>
          {createPortal(
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              aria-label={t('nav.closeMenu')}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 cursor-default bg-slate-900/20 lg:hidden"
            />,
            document.body,
          )}

          <div
            className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-white shadow-lg lg:hidden"
          >
            <nav
              id={MENU_ID}
              aria-label={t('nav.menu')}
              className="mx-auto flex w-full max-w-5xl flex-col px-4 py-2 sm:px-6"
            >
              {links.map((link) => {
                const active = pathname === link.to

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`-mx-2 rounded-lg px-2 py-3 text-base transition ${
                      active
                        ? 'bg-slate-100 font-semibold text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-200 py-3">
                <LanguageSelector />
                {user ? <LogoutButton /> : null}
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  )
}
