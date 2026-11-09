import { Link } from '@tanstack/react-router'
import type { NavItem } from '../AppSidebar/hooks/useNavItems'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui'

type Props = {
  items: NavItem[]
}

const NavMain = ({ items }: Props) => (
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map(item => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
              <Link {...item.link}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
)

export default NavMain
