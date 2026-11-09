import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const toneClasses = {
  olive: 'bg-secondary text-olive',
  terracotta: 'bg-terracotta-soft text-terracotta',
  honey: 'bg-honey-soft text-warning-foreground',
  sage: 'bg-sage-soft text-success-foreground',
} as const

type Props = {
  label: string
  value: string
  icon: LucideIcon
  tone?: keyof typeof toneClasses
  hint?: string
  className?: string
}

/**
 * A number with a label. Sizes itself to its own width (container queries): in a narrow column
 * the icon moves above the text so amounts like `11 384,78 Kč` never overflow.
 */
const StatTile = ({ label, value, icon: Icon, tone = 'olive', hint, className }: Props) => (
  <div
    className={cn(
      '@container rounded-2xl border border-border bg-card p-4 shadow-sm shadow-olive/5',
      className
    )}
  >
    <div className='flex flex-col gap-2 @[16rem]:flex-row @[16rem]:items-center @[16rem]:gap-4'>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full @[16rem]:size-11',
          toneClasses[tone]
        )}
      >
        <Icon className='size-4 @[16rem]:size-5' />
      </span>
      <div className='min-w-0'>
        <div className='text-sm font-semibold text-muted-foreground'>{label}</div>
        <div className='text-xl font-bold tracking-tight whitespace-nowrap tabular-nums @[12rem]:text-2xl'>
          {value}
        </div>
        {hint ? <div className='text-xs text-muted-foreground'>{hint}</div> : null}
      </div>
    </div>
  </div>
)

export default StatTile
