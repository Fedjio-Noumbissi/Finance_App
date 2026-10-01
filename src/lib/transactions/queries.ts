import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { waitForServerSession } from '#/lib/auth/store'
import { useCurrencyReady } from '#/lib/currency/queries'
import { statsKeys } from '#/lib/stats/keys'

import { categoriesQueryOptions } from '#/lib/categories/queries'

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './server'
import type { TransactionFilters, TransactionInput } from './schema'

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionFilters) =>
    [...transactionKeys.all, 'list', filters] as const,
}


export function transactionListQueryOptions(filters: TransactionFilters) {
  return queryOptions({
    queryKey: transactionKeys.list(filters),
    queryFn: () => listTransactions({ data: filters }),
  })
}

export function useTransactionList(filters: TransactionFilters) {
  const deviseConnue = useCurrencyReady()

  return useQuery({
    ...transactionListQueryOptions(filters),
    enabled: deviseConnue,
  })
}

export function useCategoryList() {
  return useQuery(categoriesQueryOptions())
}

function useInvalidateTransactions() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
      queryClient.invalidateQueries({ queryKey: statsKeys.all }),
    ])
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions()

  return useMutation({
    mutationFn: (input: TransactionInput) =>
      waitForServerSession().then(() => createTransaction({ data: input })),
    onSuccess: invalidate,
  })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions()

  return useMutation({
    mutationFn: (input: TransactionInput & { id: string }) =>
      waitForServerSession().then(() => updateTransaction({ data: input })),
    onSuccess: invalidate,
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions()

  return useMutation({
    mutationFn: (id: string) =>
      waitForServerSession().then(() => deleteTransaction({ data: id })),
    onSuccess: invalidate,
  })
}