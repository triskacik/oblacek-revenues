import type { DatedEntryInput, Expense } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

/** All expenses. The data stays small (a few hundred rows a year) and the money calculations need history. */
export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date')
    .order('created_at')
  if (error) throw error
  return data
}

export const useExpenses = () =>
  useQuery({ queryKey: queryKeys.expenses.all, queryFn: fetchExpenses })

/** Creates the expense, or updates it when `id` is given. */
export const useSaveExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: DatedEntryInput & { id?: string }) => {
      const { error } = id
        ? await supabase.from('expenses').update(input).eq('id', id)
        : await supabase.from('expenses').insert(input)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all }),
  })
}

/** Deletes one expense Sára chose to delete in the UI. */
export const useDeleteExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all }),
  })
}

/**
 * Puts a just-deleted expense back exactly as it was (same id and created_at), for the
 * "Vrátit" button in the toast after deleting.
 */
export const useRestoreExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (row: Expense) => {
      const { error } = await supabase.from('expenses').insert(row)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all }),
  })
}
