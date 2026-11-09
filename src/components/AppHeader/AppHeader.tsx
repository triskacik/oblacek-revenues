import useNavItems from '@/hooks/useNavItems'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import UserMenu from '../UserMenu/UserMenu'

const AppHeader = () => {
  // Settings live in the user menu on desktop; the header keeps only the everyday screens.
  const items = useNavItems().filter(item => item.title !== 'Nastavení')

  return (
    <header className='sticky top-0 z-40 border-b border-border/70 bg-cream/90 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-20 md:px-8'>
        <Link aria-label='Obláček — domů' className='shrink-0' to='/'>
          <img alt='Potraviny Obláček' className='h-9 w-auto md:h-12' src='/brand/logo.png' />
        </Link>
        <nav className='hidden items-center gap-1 rounded-full bg-secondary/70 p-1 md:flex'>
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
        <UserMenu />
      </div>
    </header>
  )
}

export default AppHeader
