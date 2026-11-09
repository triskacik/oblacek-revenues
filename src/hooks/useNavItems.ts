import { getCurrentMonthId, getCurrentWeekId } from '@/utils/weekUtils'
import { linkOptions, useLocation, type LinkOptions } from '@tanstack/react-router'
import {
  BookHeart,
  CalendarDays,
  CalendarHeart,
  ChartSpline,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  icon: LucideIcon
  isActive: boolean
  link: LinkOptions
  /** Desktop header pills. Settings live in the user menu there. */
  inHeader: boolean
  /** Mobile bottom bar (4 slots). The guide lives in the user menu there. */
  inBottomNav: boolean
}

/** Shared by the desktop header, the mobile bottom navigation and the user menu. */
const useNavItems = (): NavItem[] => {
  const { pathname } = useLocation()

  return [
    {
      title: 'Týden',
      icon: CalendarDays,
      isActive: pathname.startsWith('/week'),
      link: linkOptions({ to: '/week/$weekId', params: { weekId: getCurrentWeekId() } }),
      inHeader: true,
      inBottomNav: true,
    },
    {
      title: 'Měsíc',
      icon: CalendarHeart,
      isActive: pathname.startsWith('/month'),
      link: linkOptions({ to: '/month/$monthId', params: { monthId: getCurrentMonthId() } }),
      inHeader: true,
      inBottomNav: true,
    },
    {
      title: 'Přehled',
      icon: ChartSpline,
      isActive: pathname.startsWith('/overview'),
      link: linkOptions({ to: '/overview' }),
      inHeader: true,
      inBottomNav: true,
    },
    {
      title: 'Návod',
      icon: BookHeart,
      isActive: pathname.startsWith('/guide'),
      link: linkOptions({ to: '/guide' }),
      inHeader: true,
      inBottomNav: false,
    },
    {
      title: 'Nastavení',
      icon: Settings,
      isActive: pathname.startsWith('/settings'),
      link: linkOptions({ to: '/settings' }),
      inHeader: false,
      inBottomNav: true,
    },
  ]
}

export default useNavItems
