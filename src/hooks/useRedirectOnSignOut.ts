import { supabase } from '@/api/supabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

/** Leaves the app (and drops cached data) when the session ends — sign-out or expired refresh. */
const useRedirectOnSignOut = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event !== 'SIGNED_OUT') return
      // Supabase advises against awaiting inside this callback; defer the navigation.
      setTimeout(() => {
        queryClient.clear()
        navigate({ to: '/login' })
      })
    })
    return () => subscription.unsubscribe()
  }, [navigate, queryClient])
}

export default useRedirectOnSignOut
