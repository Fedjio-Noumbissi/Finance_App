import { createFileRoute } from '@tanstack/react-router'

import { AdminDashboard } from '#/components/admin/AdminDashboard'
import { useAuth } from '#/lib/auth/context'
import { requireAdmin } from '#/lib/auth/guard'

export const Route = createFileRoute('/_protected/admin')({
  beforeLoad: async ({ location }) => {
    await requireAdmin(location.href)
  },
  component: AdminPage,
})

function AdminPage() {
  const { profile } = useAuth()

  return (
    <main className="px-4 py-8 sm:px-6">
      <AdminDashboard adminId={profile?.id ?? ''} />
    </main>
  )
}
