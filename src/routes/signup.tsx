import { Navigate, createFileRoute } from '@tanstack/react-router'

import { SignupForm } from '#/components/auth/SignupForm'
import { SiteHeader } from '#/components/layout/SiteHeader'
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
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-10">
        <SignupForm />
      </main>
    </div>
  )
}