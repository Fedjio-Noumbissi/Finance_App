import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { waitForServerSession } from '#/lib/auth/store'

import { getAdminOverview, getAdminUsers, setUserRole } from './server'

export const adminKeys = {
  all: ['admin'] as const,
  overview: (jours: number) => [...adminKeys.all, 'overview', jours] as const,
  users: (recherche: string, page: number) =>
    [...adminKeys.all, 'users', recherche, page] as const,
}

export function adminOverviewQueryOptions(jours: number) {
  return queryOptions({
    queryKey: adminKeys.overview(jours),
    queryFn: () => getAdminOverview({ data: { jours } }),
    staleTime: 30 * 1000,
  })
}

export function adminUsersQueryOptions(recherche: string, page: number) {
  return queryOptions({
    queryKey: adminKeys.users(recherche, page),
    queryFn: () => getAdminUsers({ data: { recherche, page, parPage: 20 } }),
    staleTime: 30 * 1000,
  })
}

export function useAdminOverview(jours: number) {
  return useQuery(adminOverviewQueryOptions(jours))
}

export function useAdminUsers(recherche: string, page: number) {
  return useQuery(adminUsersQueryOptions(recherche, page))
}

export function useSetUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: string; role: 'user' | 'admin' }) =>
      waitForServerSession().then(() => setUserRole({ data: input })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  })
}
