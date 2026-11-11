import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

/** Ids of info alerts Sára chose to hide (shared by both users). */
export const fetchDismissedAlertIds = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('dismissed_alerts').select('id')
  if (error) throw error
  return data.map(row => row.id)
}

export const useDismissedAlertIds = () =>
  useQuery({ queryKey: queryKeys.dismissedAlerts.all, queryFn: fetchDismissedAlertIds })

export const useDismissAlert = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dismissed_alerts')
        .upsert({ id }, { onConflict: 'id', ignoreDuplicates: true })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.dismissedAlerts.all }),
  })
}

/** Shows all hidden alerts again (Settings). Only touches the hide list, never shop data. */
export const useRestoreDismissedAlerts = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('dismissed_alerts').delete().neq('id', '')
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.dismissedAlerts.all }),
  })
}
