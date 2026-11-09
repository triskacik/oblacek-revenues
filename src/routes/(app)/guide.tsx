import GuidePage from '@/pages/Guide/GuidePage/GuidePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/guide')({
  component: GuidePage,
})
