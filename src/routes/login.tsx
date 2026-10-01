import { Navigate, createFileRoute } from '@tanstack/react-router'

import { LoginForm } from '#/components/auth/LoginForm'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { redirectIfAuthenticated } from '#/lib/auth/guard'
import { useAuth } from '#/lib/auth/context'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async () => {
    await redirectIfAuthenticated()
  },
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  const { status } = useAuth()

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-10">
        <LoginForm redirect={redirect} />
      </main>
    </div>
  )
}