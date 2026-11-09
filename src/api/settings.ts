import type { Settings } from '@/types'
import type { TablesUpdate } from '@/types/supabase.gen'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { supabase } from './supabaseClient'

// The single settings row is created by the initial migration and is never inserted or deleted here.
const SETTINGS_ID = 1

export const fetchSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase.from('settings').select('*').eq('id', SETTINGS_ID).single()
  if (error) throw error
  return data
}

export const useSettings = () =>
  useQuery({ queryKey: queryKeys.settings.all, queryFn: fetchSettings })

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (changes: Omit<TablesUpdate<'settings'>, 'id'>) => {
      const { error } = await supabase
        .from('settings')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', SETTINGS_ID)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.all }),
  })
}
