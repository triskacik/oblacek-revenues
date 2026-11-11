import { Skeleton } from '@/components/ui'
import useAddEntry from '@/hooks/useAddEntry'
import { cn } from '@/lib/utils'
import type { Expense, Sale } from '@/types'
import { toDbDate, todayDbDate } from '@/utils/dateUtils'
import { formatMoney, sumMoney } from '@/utils/moneyUtils'
import { DEFAULT_OPEN_DAYS, formatDayShort, getWeekDays } from '@/utils/weekUtils'
import { getISODay, isToday } from 'date-fns'
import { Plus } from 'lucide-react'
import QuickSaleInput from '../QuickSaleInput/QuickSaleInput'

type Props = {
  monday: Date
  /** ISO weekdays the shop is open (settings.open_days). */
  openDays?: number[]
  sales: Sale[]
  expenses: Expense[]
  isPending: boolean
}

const EntryChip = ({
  label,
  amount,
  tone,
  onClick,
}: {
  label: string
  amount: number
  tone: 'sale' | 'expense'
  onClick: () => void
}) => (
  <button
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors',
      tone === 'sale'
        ? 'bg-terracotta-soft text-accent-foreground hover:bg-terracotta-soft/70'
        : 'bg-honey-soft text-warning-foreground hover:bg-honey-soft/70'
    )}
    type='button'
    onClick={onClick}
  >
    <span className='max-w-40 truncate'>{label}</span>
    <span className='font-bold tabular-nums'>{formatMoney(amount)}</span>
  </button>
)

const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    className='inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-olive-soft hover:text-olive'
    type='button'
    onClick={onClick}
  >
    <Plus className='size-3.5' /> {label}
  </button>
)

const WeekDays = ({ monday, openDays = DEFAULT_OPEN_DAYS, sales, expenses, isPending }: Props) => {
  const { openSale, openExpense } = useAddEntry()
  const today = todayDbDate()

  // Open days, plus any closed day that still has records (e.g. a Saturday stock run).
  const days = getWeekDays(monday).filter(day => {
    const date = toDbDate(day)
    return (
      openDays.includes(getISODay(day)) ||
      sales.some(s => s.date === date) ||
      expenses.some(e => e.date === date)
    )
  })

  return (
    <section className='rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5'>
      <h2 className='mb-3 font-chalk text-2xl leading-none text-olive'>Den po dni</h2>
      {isPending ? (
        <div className='space-y-3'>
          {[0, 1, 2].map(i => (
            <Skeleton className='h-12 rounded-xl' key={i} />
          ))}
        </div>
      ) : (
        <ul className='divide-y divide-border/70'>
          {days.map(day => {
            const date = toDbDate(day)
            const daySales = sales.filter(s => s.date === date)
            const dayExpenses = expenses.filter(e => e.date === date)
            const isFuture = date > today
            const isOpenDay = openDays.includes(getISODay(day))

            return (
              <li
                className={cn(
                  'flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-4',
                  isFuture && 'opacity-50'
                )}
                key={date}
              >
                <div className='flex w-28 shrink-0 items-center gap-2 pt-1 text-sm font-semibold capitalize'>
                  {formatDayShort(day)}
                  {isToday(day) ? (
                    <span className='rounded-full bg-terracotta-soft px-2 py-0.5 text-xs text-terracotta normal-case'>
                      dnes
                    </span>
                  ) : null}
                </div>
                <div className='flex flex-1 flex-wrap items-center gap-2'>
                  {daySales.map(sale => (
                    <EntryChip
                      amount={sale.amount}
                      key={sale.id}
                      label={sale.amount === 0 ? 'Zavřeno' : 'Tržba'}
                      tone='sale'
                      onClick={() => openSale({ entry: sale })}
                    />
                  ))}
                  {dayExpenses.map(expense => (
                    <EntryChip
                      amount={expense.amount}
                      key={expense.id}
                      label={expense.note ?? 'Výdaj'}
                      tone='expense'
                      onClick={() => openExpense({ entry: expense })}
                    />
                  ))}
                  {isFuture ? (
                    daySales.length + dayExpenses.length === 0 ? (
                      <span className='pt-1 text-sm text-muted-foreground'>teprve bude</span>
                    ) : null
                  ) : (
                    <>
                      {daySales.length === 0 && isOpenDay ? (
                        date === today ? (
                          <QuickSaleInput date={date} />
                        ) : (
                          <AddButton label='tržba' onClick={() => openSale({ date })} />
                        )
                      ) : null}
                      <AddButton label='výdaj' onClick={() => openExpense({ date })} />
                    </>
                  )}
                </div>
                {daySales.length > 1 ? (
                  <div className='pt-1 text-sm font-semibold text-muted-foreground tabular-nums sm:text-right'>
                    {formatMoney(sumMoney(daySales.map(s => s.amount)))}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default WeekDays
