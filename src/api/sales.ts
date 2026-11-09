import type { DatedEntryInput, Sale } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

/** All sales. The data stays small (a few hundred rows a year) and the money calculations need history. */
export const fetchSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase.from('sales').select('*').order('date').order('created_at')
  if (error) throw error
  return data
}

export const useSales = () => useQuery({ queryKey: queryKeys.sales.all, queryFn: fetchSales })

/** Creates the sale, or updates it when `id` is given. */
export const useSaveSale = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: DatedEntryInput & { id?: string }) => {
      const { error } = id
        ? await supabase.from('sales').update(input).eq('id', id)
        : await supabase.from('sales').insert(input)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
  })
}

/** Deletes one sale Sára chose to delete in the UI. */
export const useDeleteSale = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sales').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
  })
}
