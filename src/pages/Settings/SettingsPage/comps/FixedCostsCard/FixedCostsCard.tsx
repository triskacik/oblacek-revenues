import { useFixedCosts } from '@/api/fixedCosts'
import { Button, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { FixedCostWithAmounts } from '@/types'
import { toDbMonth } from '@/utils/dateUtils'
import { getAmountForMonth, sortAmounts } from '@/utils/fixedCostUtils'
import { formatMoney } from '@/utils/moneyUtils'
import { format, parseISO } from 'date-fns'
import { House, Pencil, Plus, Repeat } from 'lucide-react'
import { useState } from 'react'
import FixedCostAmountModal from '../FixedCostAmountModal/FixedCostAmountModal'
import FixedCostModal from '../FixedCostModal/FixedCostModal'
import SettingsSection from '../SettingsSection/SettingsSection'

const formatMonthShort = (month: string) => format(parseISO(month), 'MM/yyyy')

const FixedCostsCard = () => {
  const { data: costs, isPending, isError } = useFixedCosts()
  const [editing, setEditing] = useState<FixedCostWithAmounts | 'new' | null>(null)
  const [changingAmount, setChangingAmount] = useState<FixedCostWithAmounts | null>(null)

  const currentMonth = toDbMonth(new Date())

  return (
    <SettingsSection
      action={
        <Button className='rounded-full' size='sm' onClick={() => setEditing('new')}>
          <Plus /> Přidat
        </Button>
      }
      description='Nájem, elektřina, internet… Změna částky nepřepíše minulé měsíce.'
      icon={House}
      title='Fixní náklady'
    >
      {isPending ? (
        <div className='space-y-3'>
          <Skeleton className='h-16 rounded-xl' />
          <Skeleton className='h-16 rounded-xl' />
        </div>
      ) : isError ? (
        <p className='text-sm text-muted-foreground'>Fixní náklady se nepodařilo načíst.</p>
      ) : costs.length === 0 ? (
        <p className='rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground'>
          Zatím žádné. Přidej první, třeba nájem.
        </p>
      ) : (
        <ul className='flex flex-col gap-3'>
          {costs.map(cost => {
            const amount = getAmountForMonth(cost, currentMonth)
            const isEnded = amount === 0
            const upcoming = sortAmounts(cost.fixed_cost_amounts).find(
              a => a.valid_from > currentMonth
            )
            return (
              <li
                className={cn(
                  'flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between',
                  isEnded && 'opacity-60'
                )}
                key={cost.id}
              >
                <div className='min-w-0'>
                  <div className='font-bold'>{cost.name}</div>
                  <div className='text-sm text-muted-foreground'>
                    {amount === null
                      ? 'Začne platit později'
                      : isEnded
                        ? 'Už se neplatí'
                        : `${formatMoney(amount)} měsíčně`}
                    {cost.due_day ? ` · splatnost k ${cost.due_day}. dni` : null}
                  </div>
                  {upcoming ? (
                    <div className='text-xs text-muted-foreground'>
                      Od {formatMonthShort(upcoming.valid_from)}:{' '}
                      {upcoming.amount === 0 ? 'konec' : formatMoney(upcoming.amount)}
                    </div>
                  ) : null}
                </div>
                <div className='flex shrink-0 gap-2'>
                  <Button
                    className='rounded-full'
                    size='sm'
                    variant='outline'
                    onClick={() => setChangingAmount(cost)}
                  >
                    <Repeat /> Změnit částku
                  </Button>
                  <Button
                    aria-label={`Upravit ${cost.name}`}
                    className='rounded-full'
                    size='icon'
                    variant='ghost'
                    onClick={() => setEditing(cost)}
                  >
                    <Pencil />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <FixedCostModal
        cost={editing === 'new' || editing === null ? undefined : editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
      />
      <FixedCostAmountModal
        cost={changingAmount}
        open={changingAmount !== null}
        onClose={() => setChangingAmount(null)}
      />
    </SettingsSection>
  )
}

export default FixedCostsCard
