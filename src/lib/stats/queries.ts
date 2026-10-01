import { queryOptions, useQuery } from '@tanstack/react-query'

import { statsKeys } from './keys'
import { getBalanceEvolution, getDashboardData } from './server'

export function dashboardQueryOptions(mois?: string) {
  return queryOptions({
    queryKey: statsKeys.dashboard(mois),
    queryFn: () => getDashboardData({ data: { mois } }),
    staleTime: 60 * 1000,
  })
}

export function balanceEvolutionQueryOptions(mois?: string) {
  return queryOptions({
    queryKey: statsKeys.balance(mois),
    queryFn: () => getBalanceEvolution({ data: { mois } }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDashboardData(mois?: string) {
  return useQuery(dashboardQueryOptions(mois))
}

export function useBalanceEvolution(mois?: string) {
  return useQuery(balanceEvolutionQueryOptions(mois))
}