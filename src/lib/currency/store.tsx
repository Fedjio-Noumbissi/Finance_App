import { createContext, use, useMemo } from 'react'
import type { ReactNode } from 'react'

import { formatCompactMoney, formatConverted, formatMoney } from '#/lib/format'

import { useCurrenciesQuery, useUpdatePreferredCurrency } from './queries'

export interface DeviseContextValue {
  /** Devise d'affichage choisie par l'utilisateur. */
  devise: string
  deviseParDefaut: string
  deviseEtrangere: boolean
  deviseMiseAJour: string | null
  currencies: {
    code: string
    nomFr: string
    nomEn: string
    decimales: number
    tauxVersXof: number
  }[]
  isPending: boolean
  /** Vrai pendant l'enregistrement d'un changement de devise d'affichage. */
  isUpdatingDevise: boolean
  /**
   * Change la devise d'affichage : elle est enregistree pour l'utilisateur et
   * tous les montants (totaux, listes, graphiques) sont convertis.
   */
  setDevise: (code: string) => Promise<void>
  /** Formate un montant dans la devise d'affichage. */
  formatMontant: (value: string | number) => string
  /** Version abrégée pour les axes de graphiques. */
  formatCompact: (value: string | number) => string
  /** Formate un montant avec son code de devise (utile pour les lignes saisies). */
  formatMontantAvecCode: (value: string | number, code: string) => string
}

const DeviseContext = createContext<DeviseContextValue | null>(null)

export function DeviseProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = useCurrenciesQuery()
  const updateDevise = useUpdatePreferredCurrency()
  const devise = data?.devise ?? 'XOF'
  const enregistrerDevise = updateDevise.mutateAsync

  const value = useMemo<DeviseContextValue>(
    () => ({
      devise,
      deviseParDefaut: data?.deviseParDefaut ?? 'XOF',
      deviseEtrangere: data?.deviseEtrangere ?? false,
      deviseMiseAJour: data?.deviseMiseAJour ?? null,
      currencies: data?.currencies ?? [],
      isPending,
      isUpdatingDevise: updateDevise.isPending,
      setDevise: async (code: string) => {
        if (code === devise) {
          return
        }

        await enregistrerDevise({ devise: code })
      },
      formatMontant: (montant) => formatConverted(Number(montant), devise),
      formatCompact: (montant) => formatCompactMoney(Number(montant), devise),
      formatMontantAvecCode: (montant, code) =>
        `${formatMoney(montant, code)} ${code}`,
    }),
    [data, devise, isPending, enregistrerDevise, updateDevise.isPending],
  )

  return <DeviseContext value={value}>{children}</DeviseContext>
}

export function useDevise(): DeviseContextValue {
  const context = use(DeviseContext)

  if (!context) {
    throw new Error('useDevise doit être utilisé dans un DeviseProvider')
  }

  return context
}
