import { supabase } from './supabaseClient'

/** True when the signed-in user's email is in `allowed_users` (checked server-side). */
export const fetchIsAllowedUser = async () => {
  const { data, error } = await supabase.rpc('is_allowed_user')
  if (error) throw error
  return data
}
