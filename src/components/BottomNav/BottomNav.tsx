import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import useNavItems from '../AppSidebar/hooks/useNavItems'

/** Mobile-only navigation; on desktop the sidebar takes over. */
const BottomNav = () => {
  const items = useNavItems()

  return (
    <nav className='fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden'>
      <ul className='grid grid-cols-4'>
        {items.map(item => (
          <li key={item.title}>
            <Link
              {...item.link}
              className={cn(
                'flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground',
                item.isActive && 'font-medium text-foreground'
              )}
            >
              <item.icon className='size-5' />
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNav
