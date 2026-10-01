import { createFileRoute } from '@tanstack/react-router'

import { TransactionsPage } from '#/components/transactions/TransactionsPage'

export const Route = createFileRoute('/_protected/transactions')({
  validateSearch: (search: Record<string, unknown>): { quick?: boolean } => ({
    quick: search.quick === true || search.quick === '1' ? true : undefined,
  }),
  component: TransactionsRoute,
})

function TransactionsRoute() {
  return <TransactionsPage />
}
