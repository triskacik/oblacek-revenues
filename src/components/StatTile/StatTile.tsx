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

const StatTile = ({ label, value, icon: Icon, tone = 'olive', hint, className }: Props) => (
  <div
    className={cn(
      'flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-olive/5',
      className
    )}
  >
    <span
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full',
        toneClasses[tone]
      )}
    >
      <Icon className='size-5' />
    </span>
    <div className='min-w-0'>
      <div className='text-sm font-semibold text-muted-foreground'>{label}</div>
      <div className='text-2xl font-bold tracking-tight tabular-nums'>{value}</div>
      {hint ? <div className='text-xs text-muted-foreground'>{hint}</div> : null}
    </div>
  </div>
)

export default StatTile
