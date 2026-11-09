import WeekDetail from '@/pages/Week/WeekDetail/WeekDetail'
import { getCurrentWeekId, isValidWeekId } from '@/utils/weekUtils'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/week/$weekId')({
  beforeLoad: ({ params }) => {
    if (!isValidWeekId(params.weekId)) {
      throw redirect({ to: '/week/$weekId', params: { weekId: getCurrentWeekId() } })
    }
  },
  component: WeekDetail,
})
