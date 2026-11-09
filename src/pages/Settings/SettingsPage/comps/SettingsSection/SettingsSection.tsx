import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  description?: string
  icon: LucideIcon
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

const SettingsSection = ({
  title,
  description,
  icon: Icon,
  action,
  className,
  children,
}: Props) => (
  <section
    className={cn(
      'rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5 md:p-6',
      className
    )}
  >
    <header className='mb-5 flex items-start justify-between gap-3'>
      <div className='flex items-start gap-3'>
        <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-olive-soft'>
          <Icon className='size-5' />
        </span>
        <div>
          <h2 className='font-chalk text-2xl leading-none text-olive'>{title}</h2>
          {description ? <p className='mt-1 text-sm text-muted-foreground'>{description}</p> : null}
        </div>
      </div>
      {action}
    </header>
    {children}
  </section>
)

export default SettingsSection
