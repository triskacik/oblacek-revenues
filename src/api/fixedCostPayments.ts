import type { FixedCostPayment } from '@/types'
import { todayDbDate } from '@/utils/dateUtils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

export const fetchFixedCostPayments = async (): Promise<FixedCostPayment[]> => {
  const { data, error } = await supabase.from('fixed_cost_payments').select('*').order('month')
  if (error) throw error
  return data
}

export const useFixedCostPayments = () =>
  useQuery({ queryKey: queryKeys.fixedCostPayments.all, queryFn: fetchFixedCostPayments })

/** Ticks (paid) or unticks a fixed cost for a month (`yyyy-MM-01`). */
export const useSetFixedCostPaid = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      fixedCostId,
      month,
      paid,
    }: {
      fixedCostId: string
      month: string
      paid: boolean
    }) => {
      const { error } = paid
        ? await supabase
            .from('fixed_cost_payments')
            .upsert(
              { fixed_cost_id: fixedCostId, month, paid_at: todayDbDate() },
              { onConflict: 'fixed_cost_id,month' }
            )
        : await supabase
            .from('fixed_cost_payments')
            .delete()
            .eq('fixed_cost_id', fixedCostId)
            .eq('month', month)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.fixedCostPayments.all }),
  })
}
