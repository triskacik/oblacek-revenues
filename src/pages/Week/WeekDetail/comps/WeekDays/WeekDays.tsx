import { cn } from '@/lib/utils'
import { DEFAULT_OPEN_DAYS, formatDayShort, getOpenWeekDays } from '@/utils/weekUtils'
import { isToday } from 'date-fns'

type Props = {
  monday: Date
  /** ISO weekdays the shop is open; will come from settings.open_days. */
  openDays?: number[]
}

const WeekDays = ({ monday, openDays = DEFAULT_OPEN_DAYS }: Props) => (
  <section className='rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5'>
    <h2 className='mb-3 font-chalk text-2xl leading-none text-olive'>Otevřeno tento týden</h2>
    <ul className='divide-y divide-border/70'>
      {getOpenWeekDays(monday, openDays).map(day => (
        <li
          className={cn(
            'flex items-center justify-between gap-3 py-2.5 text-sm',
            isToday(day) && 'font-semibold'
          )}
          key={day.toISOString()}
        >
          <span className='flex items-center gap-2 capitalize'>
            {formatDayShort(day)}
            {isToday(day) ? (
              <span className='rounded-full bg-terracotta-soft px-2 py-0.5 text-xs text-terracotta'>
                dnes
              </span>
            ) : null}
          </span>
          <span className='text-muted-foreground'>zatím nic</span>
        </li>
      ))}
    </ul>
  </section>
)

export default WeekDays
