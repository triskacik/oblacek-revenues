import SettingsPage from '@/pages/Settings/SettingsPage/SettingsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/settings')({
  component: SettingsPage,
})
