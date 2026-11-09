import useNavItems, { type NavItem } from '@/hooks/useNavItems'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import AddMenu from '../AddMenu/AddMenu'

const NavLink = ({ item }: { item: NavItem }) => (
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
)

/** Mobile-only navigation, floating above the bottom edge; desktop uses the header pills. */
const BottomNav = () => {
  const items = useNavItems().filter(item => item.inBottomNav)
  const left = items.slice(0, 2)
  const right = items.slice(2)

  return (
    <nav className='glass fixed inset-x-3 bottom-3 z-40 mb-[env(safe-area-inset-bottom)] rounded-full border border-white/60 p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_12px_32px_-12px_rgb(70_76_50/0.4)] md:hidden'>
      {/* Two equal halves around a fixed-width centre, so the + sits exactly in the middle. */}
      <div className='grid grid-cols-[1fr_4rem_1fr] items-center'>
        <ul className='grid grid-cols-2 gap-1'>
          {left.map(item => (
            <li key={item.title}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
        <div className='flex justify-center'>
          <AddMenu variant='fab' />
        </div>
        <ul className='grid grid-cols-2 gap-1'>
          {right.map(item => (
            <li key={item.title}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default BottomNav
