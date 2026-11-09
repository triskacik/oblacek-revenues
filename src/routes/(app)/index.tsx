import { getCurrentWeekId } from '@/utils/weekUtils'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/')({
  beforeLoad: () => {
    throw redirect({ to: '/week/$weekId', params: { weekId: getCurrentWeekId() } })
  },
})
