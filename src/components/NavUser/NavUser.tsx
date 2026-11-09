import useSessionUser from '@/hooks/useSessionUser'
import useTheme from '@/hooks/useTheme'
import { signOut } from '@/auth/session'
import { toast } from '@/lib/toast'
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui'
import useSidebar from '../ui/Sidebar/useSidebar'

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('')

const NavUser = () => {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const user = useSessionUser()

  const name: string = user?.user_metadata.full_name ?? user?.email ?? ''
  const avatarUrl: string | undefined = user?.user_metadata.avatar_url

  const onSignOut = async () => {
    try {
      await signOut()
    } catch {
      toast.error('Odhlášení se nepovedlo')
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              size='lg'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage alt={name} src={avatarUrl} />
                <AvatarFallback className='rounded-lg'>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{name}</span>
                <span className='truncate text-xs text-muted-foreground'>{user?.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs font-normal text-muted-foreground'>
              Vzhled
            </DropdownMenuLabel>
            <DropdownMenuItem disabled={theme === 'light'} onClick={() => setTheme('light')}>
              <Sun /> Světlý
            </DropdownMenuItem>
            <DropdownMenuItem disabled={theme === 'dark'} onClick={() => setTheme('dark')}>
              <Moon /> Tmavý
            </DropdownMenuItem>
            <DropdownMenuItem disabled={theme === 'system'} onClick={() => setTheme('system')}>
              <Monitor /> Podle systému
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut /> Odhlásit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default NavUser
