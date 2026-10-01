import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { waitForServerSession } from '#/lib/auth/store'

import {
  listCurrencies,
  updateCurrencyRate,
  updatePreferredCurrency,
} from './server'

export const currenciesQueryKey = ['devises'] as const

export function useCurrenciesQuery() {
  return useQuery({
    queryKey: currenciesQueryKey,
    queryFn: () => listCurrencies(),
    // Le serveur convertit les montants dans cette devise : la reponse doit
    // toujours etre fraiche, sinon le client formate des montants convertis
    // avec la devise precedente.
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

/**
 * Les requetes de donnees ne doivent pas demarrer avant de connaitre la devise
 * d'affichage, sinon le client formate des montants convertis avec
 * l'ancienne devise.
 */
export function useCurrencyReady(): boolean {
  return useCurrenciesQuery().isSuccess
}

/**
 * Les montants renvoyes par le serveur dependent de la devise et des taux :
 * les modifier doit donc invalider toutes les requetes, pas seulement celle
 * des devises.
 */
function useInvalidateAll() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: currenciesQueryKey })

    return queryClient.invalidateQueries()
  }
}

export function useUpdateCurrencyRate() {
  const invalidateAll = useInvalidateAll()

  return useMutation({
    mutationFn: (input: { code: string; taux: number }) =>
      waitForServerSession().then(() => updateCurrencyRate({ data: input })),
    onSuccess: invalidateAll,
  })
}

export function useUpdatePreferredCurrency() {
  const invalidateAll = useInvalidateAll()

  return useMutation({
    mutationFn: (input: { devise: string }) =>
      waitForServerSession().then(() => updatePreferredCurrency({ data: input })),
    onSuccess: invalidateAll,
  })
}
