import { useSetFixedCostPaid } from '@/api/fixedCostPayments'
import { ChalkCheck, Chalkboard } from '@/components'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { Ledger } from '@/types'
import { parseDbDate, todayDbDate } from '@/utils/dateUtils'
import { getFixedStatus } from '@/utils/envelopeUtils'
import { getAmountForMonth, isActiveInMonth } from '@/utils/fixedCostUtils'
import { formatMoney } from '@/utils/moneyUtils'
import { formatMonth } from '@/utils/weekUtils'
import { Link } from '@tanstack/react-router'
import { format, getDaysInMonth } from 'date-fns'

type Props = {
  ledger: Ledger | null
  /** Month of the checklist, `yyyy-MM-01`. */
  month: string
  /** Week from which "still missing" is computed (the shown week, or the relevant week of a month). */
  statusMonday: string
}

const FixedCostsBoard = ({ ledger, month, statusMonday }: Props) => {
  const setPaid = useSetFixedCostPaid()
  const monthName = formatMonth(parseDbDate(month)).split(' ')[0]

  const toggle = async (fixedCostId: string, paid: boolean) => {
    try {
      await setPaid.mutateAsync({ fixedCostId, month, paid })
    } catch {
      toast.error('Nepovedlo se uložit, zkus to prosím znovu.')
    }
  }

  const renderContent = () => {
    if (!ledger) return null
    const active = ledger.fixedCosts.filter(cost => isActiveInMonth(cost, month))

    if (active.length === 0) {
      return (
        <>
          <p className='text-sm text-chalk-dim'>
            Zatím tu nic není. Nájem, elektřinu a další pravidelné platby si přidáš v nastavení.
          </p>
          <Link
            className='font-chalk chalk-text mt-4 inline-block rounded-full border-2 border-chalk/60 px-4 py-1 text-xl transition-colors hover:bg-chalk/10'
            to='/settings'
          >
            Přidat fixní náklady
          </Link>
        </>
      )
    }

    const status = getFixedStatus(ledger, statusMonday)
    const today = todayDbDate()

    return (
      <>
        <ul className='flex flex-col gap-1'>
          {active.map(cost => {
            const paid = ledger.payments.some(p => p.fixed_cost_id === cost.id && p.month === month)
            const dueDate = cost.due_day
              ? `${month.slice(0, 8)}${String(Math.min(cost.due_day, getDaysInMonth(parseDbDate(month)))).padStart(2, '0')}`
              : null
            const isOverdue = !paid && dueDate !== null && dueDate < today
            return (
              <li key={cost.id}>
                <button
                  aria-pressed={paid}
                  className='flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-chalk/5'
                  disabled={setPaid.isPending}
                  type='button'
                  onClick={() => toggle(cost.id, !paid)}
                >
                  <ChalkCheck checked={paid} />
                  <span className='min-w-0 flex-1'>
                    <span
                      className={cn(
                        'font-chalk chalk-text block truncate text-xl leading-tight',
                        paid && 'line-through decoration-chalk/60 decoration-2 opacity-70'
                      )}
                    >
                      {cost.name}
                    </span>
                    {dueDate && !paid ? (
                      <span
                        className={cn('block text-xs', isOverdue ? 'text-blush' : 'text-chalk-dim')}
                      >
                        {isOverdue ? 'po splatnosti' : 'splatné do'}{' '}
                        {format(parseDbDate(dueDate), 'dd.MM.')}
                      </span>
                    ) : null}
                  </span>
                  <span className='font-chalk chalk-text text-xl tabular-nums'>
                    {formatMoney(getAmountForMonth(cost, month) ?? 0)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className='mt-3 border-t border-chalk/15 pt-3 text-sm text-chalk-dim'>
          {status.missing > 0
            ? `Na ${monthName} ještě chybí odložit ${formatMoney(status.missing)}.`
            : `Na ${monthName} je odloženo dost.`}
        </p>
      </>
    )
  }

  return <Chalkboard title={`Fixní náklady · ${monthName}`}>{renderContent()}</Chalkboard>
}

export default FixedCostsBoard
