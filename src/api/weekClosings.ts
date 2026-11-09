import type { WeekClosing } from '@/types'
import type { TablesInsert } from '@/types/supabase.gen'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

export const fetchWeekClosings = async (): Promise<WeekClosing[]> => {
  const { data, error } = await supabase.from('week_closings').select('*').order('week_start')
  if (error) throw error
  return data
}

export const useWeekClosings = () =>
  useQuery({ queryKey: queryKeys.weekClosings.all, queryFn: fetchWeekClosings })

/** Closes a week, or updates its closing (one row per week, keyed by Monday). */
export const useSaveWeekClosing = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (closing: Omit<TablesInsert<'week_closings'>, 'closed_at'>) => {
      const { error } = await supabase
        .from('week_closings')
        .upsert({ ...closing, closed_at: new Date().toISOString() }, { onConflict: 'week_start' })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.weekClosings.all }),
  })
}

/** Reopens a week Sára chose to reopen (deletes just its closing; records stay). */
export const useReopenWeek = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (weekStart: string) => {
      const { error } = await supabase.from('week_closings').delete().eq('week_start', weekStart)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.weekClosings.all }),
  })
}
