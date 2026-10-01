import { queryOptions, useQuery } from '@tanstack/react-query'

import { useCurrencyReady } from '#/lib/currency/queries'

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
  const deviseConnue = useCurrencyReady()

  return useQuery({ ...dashboardQueryOptions(mois), enabled: deviseConnue })
}

export function useBalanceEvolution(mois?: string) {
  const deviseConnue = useCurrencyReady()

  return useQuery({
    ...balanceEvolutionQueryOptions(mois),
    enabled: deviseConnue,
  })
}