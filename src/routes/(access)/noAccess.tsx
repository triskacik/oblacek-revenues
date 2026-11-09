import { getSession } from '@/auth/session'
import NoAccess from '@/pages/NoAccess/NoAccess'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(access)/noAccess')({
  beforeLoad: async () => {
    if (!(await getSession())) throw redirect({ to: '/login' })
  },
  component: NoAccess,
})
