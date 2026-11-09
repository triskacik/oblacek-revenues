import { getSession } from '@/auth/session'
import Login from '@/pages/Login/Login'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(access)/login')({
  beforeLoad: async () => {
    if (await getSession()) throw redirect({ to: '/' })
  },
  component: Login,
})
