import { cn } from '@/lib/utils'
import { parseDbDate } from '@/utils/dateUtils'
import type { MonthTracker } from '@/utils/trackerUtils'
import { format } from 'date-fns'
import { Check, Circle } from 'lucide-react'

type Props = {
  bills: MonthTracker['bills']
  className?: string
}

/** The month's fixed costs at a glance: paid ones ticked, unpaid ones with their due date. */
const BillsChips = ({ bills, className }: Props) => {
  if (bills.length === 0) return null
  const paidCount = bills.filter(bill => bill.paid).length
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className='mr-1 text-xs font-semibold text-muted-foreground'>
        Zaplaceno {paidCount} z {bills.length}
      </span>
      {bills.map(bill => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            bill.paid
              ? 'bg-sage-soft text-success-foreground'
              : 'bg-card text-foreground ring-1 ring-border'
          )}
          key={bill.id}
        >
          {bill.paid ? <Check className='size-3.5' /> : <Circle className='size-3' />}
          {bill.name}
          {!bill.paid && bill.dueDate ? (
            <span className='font-normal text-muted-foreground'>
              do {format(parseDbDate(bill.dueDate), 'dd.MM.')}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  )
}

export default BillsChips
