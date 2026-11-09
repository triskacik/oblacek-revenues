import { fetchIsAllowedUser } from '@/api/access'
import { queryKeys } from '@/api/queryKeys'
import { getSession } from '@/auth/session'
import { AppHeader, BottomNav } from '@/components'
import AddEntryProvider from '@/contexts/AddEntry/AddEntryProvider'
import useRedirectOnSignOut from '@/hooks/useRedirectOnSignOut'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

const Layout = () => {
  useRedirectOnSignOut()

  return (
    <AddEntryProvider>
      <div className='min-h-svh'>
        <AppHeader />
        <Outlet />
        <BottomNav />
      </div>
    </AddEntryProvider>
  )
}

export const Route = createFileRoute('/(app)')({
  beforeLoad: async ({ context }) => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })

    // RLS is the real guard; this only gives a friendly screen instead of empty data.
    const isAllowed = await context.queryClient.ensureQueryData({
      queryKey: queryKeys.access.byUser(session.user.id),
      queryFn: fetchIsAllowedUser,
    })
    if (!isAllowed) throw redirect({ to: '/noAccess' })
  },
  component: Layout,
})
