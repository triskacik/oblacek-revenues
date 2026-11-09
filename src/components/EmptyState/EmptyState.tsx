import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
  children?: React.ReactNode
}

/** Friendly card for a section without data yet. */
const EmptyState = ({ title, description, icon: Icon, className, children }: Props) => (
  <section
    className={cn(
      'flex flex-col gap-3 rounded-2xl border-2 border-dashed border-border bg-card/60 p-5',
      className
    )}
  >
    <div className='flex items-center gap-3'>
      {Icon ? (
        <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-olive-soft'>
          <Icon className='size-5' />
        </span>
      ) : null}
      <h2 className='font-chalk text-2xl leading-none text-olive'>{title}</h2>
    </div>
    {description ? <p className='text-sm text-muted-foreground'>{description}</p> : null}
    {children}
  </section>
)

export default EmptyState
