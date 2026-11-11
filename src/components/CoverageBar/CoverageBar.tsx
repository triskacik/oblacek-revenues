import { cn } from '@/lib/utils'
import { parseDbDate } from '@/utils/dateUtils'
import { formatMoney } from '@/utils/moneyUtils'
import type { MonthTracker, TrackerWeekStatus } from '@/utils/trackerUtils'
import { toWeekId } from '@/utils/weekUtils'
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'

type Props = {
  tracker: MonthTracker
  /** Week dots with labels under the bar (off in tight spaces). */
  showWeeks?: boolean
  className?: string
}

const weekDot: Record<TrackerWeekStatus, string> = {
  closed: 'bg-olive text-cream',
  unclosed: 'bg-honey-soft text-warning-foreground ring-1 ring-honey/60',
  current: 'bg-terracotta text-cream ring-4 ring-terracotta/15',
  upcoming: 'bg-card text-muted-foreground ring-1 ring-border',
}

const weekTitle: Record<TrackerWeekStatus, string> = {
  closed: 'Uzavřený týden',
  unclosed: 'Skončil, ale není uzavřený',
  current: 'Tento týden',
  upcoming: 'Teprve bude',
}

/**
 * How much of the month's fixed costs is put aside: a bar with a notch per week and a terracotta
 * marker where the plan says we should be after the weeks that already ended.
 */
const CoverageBar = ({ tracker, showWeeks = true, className }: Props) => {
  const { fixed, timeline } = tracker
  const percent = fixed.monthDue > 0 ? (fixed.covered / fixed.monthDue) * 100 : 0
  const planPercent = fixed.monthDue > 0 ? (fixed.expected / fixed.monthDue) * 100 : 0
  const showPlan =
    tracker.phase === 'current' &&
    planPercent > 0 &&
    (fixed.status === 'behind' || fixed.status === 'onTrack')

  return (
    <div className={className}>
      <div className='relative h-4 rounded-full bg-secondary shadow-[inset_0_1px_2px_rgb(70_76_50/0.12)]'>
        <div
          className='absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--sage),var(--olive))] transition-[width] duration-700 ease-out'
          style={{ width: `${Math.max(percent, percent > 0 ? 4 : 0)}%` }}
        />
        {timeline.slice(1).map((week, index) => (
          <span
            aria-hidden
            className='absolute inset-y-0 w-0.5 bg-cream/80'
            key={week.monday}
            style={{ left: `${((index + 1) / timeline.length) * 100}%` }}
          />
        ))}
        {showPlan ? (
          <span
            aria-hidden
            className='absolute -top-1.5 -bottom-1.5 w-0.5 rounded-full bg-terracotta'
            style={{ left: `${planPercent}%` }}
            title={`Podle plánu by teď mělo být odloženo ${formatMoney(fixed.expected)}`}
          />
        ) : null}
      </div>
      {showWeeks ? (
        <ol
          className='mt-2.5 grid'
          style={{ gridTemplateColumns: `repeat(${timeline.length}, 1fr)` }}
        >
          {timeline.map(week => {
            const weekId = toWeekId(parseDbDate(week.monday))
            return (
              <li className='flex flex-col items-center gap-1' key={week.monday}>
                <Link
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full transition-transform hover:scale-110',
                    weekDot[week.status]
                  )}
                  params={{ weekId }}
                  title={weekTitle[week.status]}
                  to='/week/$weekId'
                >
                  {week.status === 'closed' ? <Check className='size-3.5' /> : null}
                </Link>
                <span
                  className={cn(
                    'text-[11px] font-semibold text-muted-foreground',
                    week.status === 'current' && 'text-terracotta'
                  )}
                >
                  T{Number(weekId.split('-W')[1])}
                </span>
              </li>
            )
          })}
        </ol>
      ) : null}
    </div>
  )
}

export default CoverageBar
