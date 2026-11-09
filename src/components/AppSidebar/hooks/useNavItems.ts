import { getCurrentMonthId, getCurrentWeekId } from '@/utils/weekUtils'
import { linkOptions, useLocation, type LinkOptions } from '@tanstack/react-router'
import { CalendarDays, CalendarRange, ChartLine, Settings, type LucideIcon } from 'lucide-react'

export type NavItem = {
  title: string
  icon: LucideIcon
  isActive: boolean
  link: LinkOptions
}

/** Shared by the desktop sidebar and the mobile bottom navigation. */
const useNavItems = (): NavItem[] => {
  const { pathname } = useLocation()

  return [
    {
      title: 'Týden',
      icon: CalendarDays,
      isActive: pathname.startsWith('/week'),
      link: linkOptions({ to: '/week/$weekId', params: { weekId: getCurrentWeekId() } }),
    },
    {
      title: 'Měsíc',
      icon: CalendarRange,
      isActive: pathname.startsWith('/month'),
      link: linkOptions({ to: '/month/$monthId', params: { monthId: getCurrentMonthId() } }),
    },
    {
      title: 'Přehled',
      icon: ChartLine,
      isActive: pathname.startsWith('/overview'),
      link: linkOptions({ to: '/overview' }),
    },
    {
      title: 'Nastavení',
      icon: Settings,
      isActive: pathname.startsWith('/settings'),
      link: linkOptions({ to: '/settings' }),
    },
  ]
}

export default useNavItems
