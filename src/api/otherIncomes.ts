import type { OtherIncome } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

export type OtherIncomeInput = {
  /** First day of the month the income belongs to, `yyyy-MM-01`. */
  month: string
  amount: number
  note: string | null
}

/** All monthly incomes (Zásilkovna). */
export const fetchOtherIncomes = async (): Promise<OtherIncome[]> => {
  const { data, error } = await supabase
    .from('other_incomes')
    .select('*')
    .order('month')
    .order('created_at')
  if (error) throw error
  return data
}

export const useOtherIncomes = () =>
  useQuery({ queryKey: queryKeys.otherIncomes.all, queryFn: fetchOtherIncomes })

/** Creates a Zásilkovna income, or updates it when `id` is given. */
export const useSaveZasilkovna = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: OtherIncomeInput & { id?: string }) => {
      const { error } = id
        ? await supabase.from('other_incomes').update(input).eq('id', id)
        : await supabase.from('other_incomes').insert({ ...input, kind: 'zasilkovna' })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.otherIncomes.all }),
  })
}

export const useDeleteOtherIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('other_incomes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.otherIncomes.all }),
  })
}

/** Puts a just-deleted income back exactly as it was, for the "Vrátit" button after deleting. */
export const useRestoreOtherIncome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (row: OtherIncome) => {
      const { error } = await supabase.from('other_incomes').insert(row)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.otherIncomes.all }),
  })
}
