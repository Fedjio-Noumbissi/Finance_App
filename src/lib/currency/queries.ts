import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
    // toujours etre fraiche, sinon le client formate avec une devise
    // perimee pendant que les requetes de donnees renvoient la nouvelle.
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

/**
 * Les montants renvoyes par le serveur sont convertis dans la devise
 * d'affichage : changer de devise ou de taux doit donc invalider toutes les
 * requetes de donnees, pas seulement celle des devises.
 */
/**
 * Le serveur convertit tous les montants dans la devise d'affichage : les
 * requetes de donnees ne doivent demarrer qu'une fois cette devise connue,
 * sinon le client formate des montants convertis avec l'ancienne devise.
 */
export function useCurrencyReady(): boolean {
  return useCurrenciesQuery().isSuccess
}

export function useUpdateCurrencyRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { code: string; taux: number }) =>
      updateCurrencyRate({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currenciesQueryKey })
      return queryClient.invalidateQueries()
    },
  })
}

export function useUpdatePreferredCurrency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { devise: string }) =>
      updatePreferredCurrency({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currenciesQueryKey })
      return queryClient.invalidateQueries()
    },
  })
}
