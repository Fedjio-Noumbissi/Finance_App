import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CategoryFormValues, CategoryUpdateValues } from './schema'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from './server'

export const categoriesKey = ['categories'] as const

export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: categoriesKey,
    queryFn: () => getCategories(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategories() {
  return useQuery(categoriesQueryOptions())
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: categoriesKey }),
      queryClient.invalidateQueries({ queryKey: ['stats'] }),
    ])
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (input: CategoryFormValues) => createCategory({ data: input }),
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (input: CategoryUpdateValues) => updateCategory({ data: input }),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: invalidate,
  })
}
