import type { FixedCostWithAmounts } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

export const fetchFixedCosts = async (): Promise<FixedCostWithAmounts[]> => {
  const { data, error } = await supabase
    .from('fixed_costs')
    .select('*, fixed_cost_amounts(*)')
    .order('sort')
    .order('created_at')
  if (error) throw error
  return data
}

export const useFixedCosts = () =>
  useQuery({ queryKey: queryKeys.fixedCosts.all, queryFn: fetchFixedCosts })

export type FixedCostInput = {
  name: string
  dueDay: number | null
}

/** New fixed cost with its first amount valid from `validFrom` (`yyyy-MM-01`). */
export const useCreateFixedCost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: FixedCostInput & { amount: number; validFrom: string }) => {
      const { data, error } = await supabase
        .from('fixed_costs')
        .insert({ name: input.name, due_day: input.dueDay })
        .select('id')
        .single()
      if (error) throw error
      const { error: amountError } = await supabase
        .from('fixed_cost_amounts')
        .insert({ fixed_cost_id: data.id, valid_from: input.validFrom, amount: input.amount })
      if (amountError) throw amountError
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts.all }),
  })
}

/** Renames a fixed cost or changes its due day. Amounts are changed via `useSetFixedCostAmount`. */
export const useUpdateFixedCost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: FixedCostInput & { id: string }) => {
      const { error } = await supabase
        .from('fixed_costs')
        .update({ name: input.name, due_day: input.dueDay })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts.all }),
  })
}

/**
 * Amount valid from a month onwards (0 ends the cost). Earlier months keep their amounts;
 * choosing a month that already has an amount replaces just that month's value.
 */
export const useSetFixedCostAmount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { fixedCostId: string; validFrom: string; amount: number }) => {
      const { error } = await supabase
        .from('fixed_cost_amounts')
        .upsert(
          { fixed_cost_id: input.fixedCostId, valid_from: input.validFrom, amount: input.amount },
          { onConflict: 'fixed_cost_id,valid_from' }
        )
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts.all }),
  })
}

/**
 * Deletes a fixed cost created by mistake, with its amount history. Only for costs without any
 * payment (the UI hides it otherwise) — paid costs are part of the money history and can only be
 * ended (amount 0). The DB enforces this too: payments reference the cost with `on delete restrict`.
 */
export const useDeleteFixedCost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // Check first, so a paid cost never loses its amounts before the delete gets refused.
      const { count, error: countError } = await supabase
        .from('fixed_cost_payments')
        .select('id', { count: 'exact', head: true })
        .eq('fixed_cost_id', id)
      if (countError) throw countError
      if (count) throw new Error('Fixed cost has payments and can only be ended.')

      const { error: amountsError } = await supabase
        .from('fixed_cost_amounts')
        .delete()
        .eq('fixed_cost_id', id)
      if (amountsError) throw amountsError
      const { error } = await supabase.from('fixed_costs').delete().eq('id', id)
      if (error) throw error
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.fixedCosts.all }),
  })
}
