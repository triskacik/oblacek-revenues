import { supabase } from '@/api/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const useSessionUser = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  return user
}

export default useSessionUser
