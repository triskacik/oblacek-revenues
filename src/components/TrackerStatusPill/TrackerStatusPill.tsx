import { cn } from '@/lib/utils'
import type { TrackerPhase, TrackerStatus } from '@/utils/trackerUtils'
import { PartyPopper, Sparkles, TrendingDown } from 'lucide-react'

type Props = {
  status: TrackerStatus
  phase: TrackerPhase
  className?: string
}

const pills = {
  covered: {
    label: 'Pokryto',
    className: 'bg-sage-soft text-success-foreground',
    icon: PartyPopper,
  },
  onTrack: {
    label: 'Odkládáš včas',
    className: 'bg-sage-soft text-success-foreground',
    icon: Sparkles,
  },
  behind: {
    label: 'Trochu pozadu',
    className: 'bg-honey-soft text-warning-foreground',
    icon: TrendingDown,
  },
  short: {
    label: 'Něco chybělo',
    className: 'bg-honey-soft text-warning-foreground',
    icon: TrendingDown,
  },
} as const

/** "Pokryto / Odkládáš včas / Trochu pozadu" for the month's fixed costs. Never red. */
const TrackerStatusPill = ({ status, phase, className }: Props) => {
  if (status === 'noFixedCosts') return null
  // A finished month that came up short isn't "behind" anymore, it just ended that way.
  const pill = pills[status === 'behind' && phase === 'past' ? 'short' : status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap',
        pill.className,
        className
      )}
    >
      <pill.icon className='size-3.5' />
      {pill.label}
    </span>
  )
}

export default TrackerStatusPill
