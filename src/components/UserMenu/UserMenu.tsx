import useSessionUser from '@/hooks/useSessionUser'
import { signOut } from '@/auth/session'
import { toast } from '@/lib/toast'
import { Link } from '@tanstack/react-router'
import { LogOut, Settings } from 'lucide-react'
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
} from '../ui'

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('')

const UserMenu = () => {
  const user = useSessionUser()

  const name: string = user?.user_metadata.full_name ?? user?.email ?? ''
  const firstName = name.split(' ')[0]
  const avatarUrl: string | undefined = user?.user_metadata.avatar_url

  const onSignOut = async () => {
    try {
      await signOut()
    } catch {
      toast.error('Odhlášení se nepovedlo, zkus to prosím znovu.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='flex items-center gap-2 rounded-full p-1 pr-1 transition-colors hover:bg-secondary md:pr-3'>
        <Avatar className='size-9 border-2 border-tan/60'>
          <AvatarImage alt={name} src={avatarUrl} />
          <AvatarFallback className='bg-terracotta-soft text-sm font-semibold text-terracotta'>
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <span className='hidden text-sm font-semibold md:inline'>{firstName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-60 rounded-xl'>
        <DropdownMenuLabel className='font-normal'>
          <div className='truncate font-semibold'>{name}</div>
          <div className='truncate text-xs text-muted-foreground'>{user?.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to='/settings'>
            <Settings /> Nastavení
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut /> Odhlásit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
