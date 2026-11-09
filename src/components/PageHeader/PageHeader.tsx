import { cn } from '@/lib/utils'

type Props = {
  title: string
  subtitle?: string
  /** Rendered next to the title, e.g. period navigation. */
  children?: React.ReactNode
  /** Pinned to the right on desktop, below the title on mobile. */
  actions?: React.ReactNode
  className?: string
}

/** Page title in chalk lettering. Sits inside <Main>, under the sticky app header. */
const PageHeader = ({ title, subtitle, children, actions, className }: Props) => (
  <div
    className={cn(
      'mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between',
      className
    )}
  >
    <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
      <div>
        <h1 className='font-chalk text-4xl leading-none text-olive md:text-5xl'>{title}</h1>
        {subtitle ? <p className='mt-1 text-sm text-muted-foreground'>{subtitle}</p> : null}
      </div>
      {children}
    </div>
    {actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
  </div>
)

export default PageHeader
