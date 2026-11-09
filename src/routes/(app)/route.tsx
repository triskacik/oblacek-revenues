import { fetchIsAllowedUser } from '@/api/access'
import { queryKeys } from '@/api/queryKeys'
import { getSession } from '@/auth/session'
import { AppSidebar, BottomNav } from '@/components'
import { SidebarInset } from '@/components/ui'
import SidebarProvider from '@/components/ui/Sidebar/context/SidebarProvider'
import useRedirectOnSignOut from '@/hooks/useRedirectOnSignOut'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

const Layout = () => {
  useRedirectOnSignOut()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='@container/content'>
        <Outlet />
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
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
