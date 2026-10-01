import { Outlet, createFileRoute } from '@tanstack/react-router'

import { AppSidebar } from '#/components/layout/AppSidebar'
import { SiteHeader } from '#/components/layout/SiteHeader'
import { DeviseProvider } from '#/lib/currency/store'
import { OnboardingFlow } from '#/components/onboarding/OnboardingFlow'
import { QuickAddFab } from '#/components/transactions/QuickAddFab'
import { requireAuth } from '#/lib/auth/guard'

export const Route = createFileRoute('/_protected')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <div className="lg:pl-60">
        <SiteHeader className="lg:hidden" />
        <DeviseProvider>
          <Outlet />
        </DeviseProvider>
      </div>
      <QuickAddFab />
      <OnboardingFlow />
    </div>
  )
}