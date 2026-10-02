import { useMemo } from 'react'

import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDevise } from '#/lib/currency/store'
import type { TransactionWithCategory } from '#/lib/transactions/server'

import { StatCard } from '#/components/ui/StatCard'

/**
 * Bandeau de totaux de la periode filtree : les chiffres repondent a la
 * question « combien ? » sans obliger a parcourir le tableau.
 */
export function TransactionTotals({
  rows,
  isLoading,
}: {
  rows: TransactionWithCategory[] | undefined
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const { formatMontant } = useDevise()

  const totaux = useMemo(() => {
    let revenus = 0
    let depenses = 0

    for (const row of rows ?? []) {
      const montant = Number(row.montant)

      if (row.type === 'revenu') {
        revenus += montant
      } else {
        depenses += montant
      }
    }

    return { revenus, depenses, solde: revenus - depenses, nombre: rows?.length ?? 0 }
  }, [rows])

  const loading = isLoading || rows === undefined

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard
        label={t('transaction.totals.solde')}
        value={loading ? '…' : formatMontant(totaux.solde)}
        tone={totaux.solde < 0 ? 'expense' : 'default'}
        icon={<Scale aria-hidden className="size-4" strokeWidth={1.9} />}
        hint={`${totaux.nombre}`}
      />
      <StatCard
        label={t('transaction.totals.income')}
        value={loading ? '…' : formatMontant(totaux.revenus)}
        tone="income"
        icon={<ArrowUpRight aria-hidden className="size-4" strokeWidth={2.2} />}
      />
      <StatCard
        label={t('transaction.totals.expense')}
        value={loading ? '…' : formatMontant(totaux.depenses)}
        tone="expense"
        icon={<ArrowDownRight aria-hidden className="size-4" strokeWidth={2.2} />}
      />
    </div>
  )
}