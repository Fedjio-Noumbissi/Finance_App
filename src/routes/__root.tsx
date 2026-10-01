import { useEffect } from 'react'

import { NotFound } from '#/components/layout/NotFound'
import { AuthProvider } from '#/lib/auth/context'

import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Finance App',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function AppReady() {
  useEffect(() => {
    document.getElementById('app-loading')?.remove()
  }, [])

  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <div
          id="app-loading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50"
        >
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-3"
          >
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <span className="text-sm text-slate-500">Chargement…</span>
          </div>
        </div>

        <AuthProvider>
          {children}
          <AppReady />
        </AuthProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}