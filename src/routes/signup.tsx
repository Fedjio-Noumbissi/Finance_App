import { Navigate, createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '#/components/auth/AuthLayout'
import { SignupForm } from '#/components/auth/SignupForm'
import { useAuth } from '#/lib/auth/context'
import { redirectIfAuthenticated } from '#/lib/auth/guard'

export const Route = createFileRoute('/signup')({
  beforeLoad: async () => {
    await redirectIfAuthenticated()
  },
  component: SignupPage,
})

function SignupPage() {
  const { status } = useAuth()

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" />
  }

  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  )
}