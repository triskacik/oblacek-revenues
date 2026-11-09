import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { getMonthSummary } from '@/utils/envelopeUtils'
import { formatMoney } from '@/utils/moneyUtils'
import { formatWeekRange, toWeekId } from '@/utils/weekUtils'
import { Link } from '@tanstack/react-router'
import { parseISO, startOfISOWeek } from 'date-fns'
import { toDbDate } from '@/utils/dateUtils'

type Props = {
  summary: ReturnType<typeof getMonthSummary> | null
  openDays?: number[]
}

const MonthWeeks = ({ summary, openDays }: Props) => {
  const currentMonday = toDbDate(startOfISOWeek(new Date()))

  return (
    <section className='rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5'>
      <h2 className='mb-3 font-chalk text-2xl leading-none text-olive'>Týdny v měsíci</h2>
      {!summary ? (
        <Skeleton className='h-32 rounded-xl' />
      ) : summary.weeks.length === 0 ? (
        <p className='text-sm text-muted-foreground'>Tehdy ještě obchod nebyl otevřený.</p>
      ) : (
        <ul className='divide-y divide-border/70'>
          {summary.weeks.map(week => {
            const weekId = toWeekId(parseISO(week.monday))
            const isFuture = week.monday > currentMonday
            return (
              <li key={week.monday}>
                <Link
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg px-2 py-3 text-sm transition-colors hover:bg-secondary/60',
                    isFuture && 'opacity-50'
                  )}
                  params={{ weekId }}
                  to='/week/$weekId'
                >
                  <span>
                    <span className='font-semibold'>Týden {Number(weekId.split('-W')[1])}</span>
                    <span className='ml-2 text-muted-foreground'>
                      {formatWeekRange(parseISO(week.monday), openDays)}
                    </span>
                  </span>
                  <span className='flex items-center gap-3'>
                    <span className='text-muted-foreground tabular-nums'>
                      tržby {formatMoney(week.sales)}
                    </span>
                    {week.closing ? (
                      <span className='rounded-full bg-sage-soft px-2.5 py-0.5 text-xs font-semibold text-success-foreground'>
                        prodavačce {formatMoney(week.closing.seller_payout)}
                      </span>
                    ) : isFuture ? (
                      <span className='text-xs text-muted-foreground'>teprve bude</span>
                    ) : week.monday === currentMonday ? (
                      <span className='rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground'>
                        probíhá
                      </span>
                    ) : (
                      <span className='rounded-full bg-honey-soft px-2.5 py-0.5 text-xs font-semibold text-warning-foreground'>
                        neuzavřeno
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default MonthWeeks
