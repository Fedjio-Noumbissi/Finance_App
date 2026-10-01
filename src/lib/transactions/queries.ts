import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

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
  return useQuery(transactionListQueryOptions(filters))
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
    mutationFn: (input: TransactionInput) => createTransaction({ data: input }),
    onSuccess: invalidate,
  })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions()

  return useMutation({
    mutationFn: (input: TransactionInput & { id: string }) =>
      updateTransaction({ data: input }),
    onSuccess: invalidate,
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions()

  return useMutation({
    mutationFn: (id: string) => deleteTransaction({ data: id }),
    onSuccess: invalidate,
  })
}