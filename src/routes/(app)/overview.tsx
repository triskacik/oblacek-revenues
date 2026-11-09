import OverviewPage from '@/pages/Overview/OverviewPage/OverviewPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/overview')({
  component: OverviewPage,
})
