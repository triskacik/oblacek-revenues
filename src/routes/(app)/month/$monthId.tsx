import MonthDetail from '@/pages/Month/MonthDetail/MonthDetail'
import { getCurrentMonthId, isValidMonthId } from '@/utils/weekUtils'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/month/$monthId')({
  beforeLoad: ({ params }) => {
    if (!isValidMonthId(params.monthId)) {
      throw redirect({ to: '/month/$monthId', params: { monthId: getCurrentMonthId() } })
    }
  },
  component: MonthDetail,
})
