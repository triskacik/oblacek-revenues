import useIsScrolled from '@/hooks/useIsScrolled'
import useNavItems from '@/hooks/useNavItems'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import AddMenu from '../AddMenu/AddMenu'
import HeaderTracker from '../HeaderTracker/HeaderTracker'
import UserMenu from '../UserMenu/UserMenu'

const AppHeader = () => {
  // Settings live in the user menu on desktop; the header keeps the everyday screens + guide.
  const items = useNavItems().filter(item => item.inHeader)
  const isScrolled = useIsScrolled()

  return (
    <header
      className={cn(
        'glass sticky top-0 z-40 border-b transition-[border-color,box-shadow] duration-300',
        // At the top it melts into the page; once content slides under it, it lifts off.
        isScrolled
          ? 'border-white/50 shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_10px_30px_-18px_rgb(70_76_50/0.45)]'
          : 'border-transparent'
      )}
    >
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-20 md:px-8'>
        <Link aria-label='Obláček - domů' className='shrink-0' to='/'>
          <img alt='Potraviny Obláček' className='h-9 w-auto md:h-12' src='/brand/logo.png' />
        </Link>
        <nav className='hidden items-center gap-1 rounded-full bg-secondary/60 p-1 ring-1 ring-white/50 md:flex'>
          {items.map(item => (
            <Link
              key={item.title}
              {...item.link}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-olive-soft transition-colors hover:text-olive',
                item.isActive && 'bg-olive text-cream shadow-sm hover:text-cream'
              )}
            >
              <item.icon className='size-4' />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className='flex items-center gap-2 md:gap-3'>
          <HeaderTracker />
          <div className='hidden md:block'>
            <AddMenu />
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

export default AppHeader
