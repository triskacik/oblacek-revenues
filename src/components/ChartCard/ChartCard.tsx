import { cn } from '@/lib/utils'

type Series = { label: string; color: string }

type Props = {
  title: string
  description?: string
  /** Legend chips; shown for two or more series (one series is named by the title). */
  series?: Series[]
  /** When set, the chart is replaced by this friendly note (not enough data yet). */
  emptyText?: string
  className?: string
  children: React.ReactNode
}

/** Card frame for a chart: chalk title, legend chips, the chart itself. */
const ChartCard = ({ title, description, series, emptyText, className, children }: Props) => (
  <section
    className={cn(
      'rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5',
      className
    )}
  >
    <header className='mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2'>
      <div>
        <h2 className='font-chalk text-2xl leading-none text-olive'>{title}</h2>
        {description ? <p className='mt-1 text-sm text-muted-foreground'>{description}</p> : null}
      </div>
      {series && series.length > 1 && !emptyText ? (
        <ul className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
          {series.map(item => (
            <li className='flex items-center gap-1.5' key={item.label}>
              <span className='size-2.5 rounded-[3px]' style={{ backgroundColor: item.color }} />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </header>
    {emptyText ? (
      <div className='flex h-40 items-center justify-center rounded-xl bg-secondary/40 px-6 text-center text-sm text-muted-foreground'>
        {emptyText}
      </div>
    ) : (
      children
    )}
  </section>
)

export default ChartCard
