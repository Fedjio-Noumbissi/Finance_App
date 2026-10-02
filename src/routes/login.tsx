import { Navigate, createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '#/components/auth/AuthLayout'
import { LoginForm } from '#/components/auth/LoginForm'
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
    <AuthLayout>
      <LoginForm redirect={redirect} />
    </AuthLayout>
  )
}