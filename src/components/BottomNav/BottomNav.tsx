import useNavItems from '@/hooks/useNavItems'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

/** Mobile-only navigation, floating above the bottom edge; desktop uses the header pills. */
const BottomNav = () => {
  const items = useNavItems()

  return (
    <nav className='fixed inset-x-3 bottom-3 z-40 mb-[env(safe-area-inset-bottom)] rounded-full border border-border bg-card/95 p-1.5 shadow-lg shadow-olive/10 backdrop-blur md:hidden'>
      <ul className='grid grid-cols-4 gap-1'>
        {items.map(item => (
          <li key={item.title}>
            <Link
              {...item.link}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-semibold text-olive-soft transition-colors',
                item.isActive && 'bg-olive text-cream'
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
