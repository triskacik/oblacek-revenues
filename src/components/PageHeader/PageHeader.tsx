import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Separator, SidebarTrigger } from '../ui'

type Props = React.HTMLAttributes<HTMLElement> & {
  title: string
  /** Rendered right after the title, e.g. period navigation. */
  children?: React.ReactNode
  /** Pinned to the right side, e.g. the "+ Přidat" menu. */
  actions?: React.ReactNode
  ref?: React.Ref<HTMLElement>
}

const PageHeader = ({ className, title, children, actions, ...props }: Props) => {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-14 border-b bg-topbar',
        offset > 10 && 'shadow-sm',
        className
      )}
      {...props}
    >
      <div className='flex h-full items-center justify-between gap-3 px-4'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <SidebarTrigger className='hidden md:inline-flex' />
          <Separator className='hidden h-6 md:block' orientation='vertical' />
          <h1 className='truncate text-base font-semibold'>{title}</h1>
          {children}
        </div>
        {actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
      </div>
    </header>
  )
}

export default PageHeader
