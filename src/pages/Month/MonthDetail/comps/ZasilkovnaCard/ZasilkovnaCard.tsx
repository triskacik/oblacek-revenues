import { Button, Skeleton } from '@/components/ui'
import useAddEntry from '@/hooks/useAddEntry'
import type { Ledger } from '@/types'
import { toDbMonth } from '@/utils/dateUtils'
import { formatMoney } from '@/utils/moneyUtils'
import { Package, Plus } from 'lucide-react'

type Props = {
  ledger: Ledger | null
  /** `yyyy-MM-01` */
  month: string
}

const ZasilkovnaCard = ({ ledger, month }: Props) => {
  const { openZasilkovna } = useAddEntry()
  const entries = ledger?.otherIncomes.filter(i => i.month === month) ?? []
  const canAdd = month <= toDbMonth(new Date())

  return (
    <section className='rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <span className='flex size-10 items-center justify-center rounded-full bg-secondary text-olive-soft'>
            <Package className='size-5' />
          </span>
          <h2 className='font-chalk text-2xl leading-none text-olive'>Zásilkovna</h2>
        </div>
        {canAdd ? (
          <Button
            className='rounded-full'
            size='sm'
            variant='secondary'
            onClick={() => openZasilkovna({ month })}
          >
            <Plus /> Zapsat
          </Button>
        ) : null}
      </div>
      {!ledger ? (
        <Skeleton className='h-10 rounded-xl' />
      ) : entries.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          Za tenhle měsíc zatím nic. Platba za výdejní místo obvykle přijde v dalším měsíci.
        </p>
      ) : (
        <ul className='flex flex-col gap-2'>
          {entries.map(entry => (
            <li key={entry.id}>
              <button
                className='flex w-full items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary'
                type='button'
                onClick={() => openZasilkovna({ entry })}
              >
                <span className='truncate text-muted-foreground'>
                  {entry.note ?? 'Výdejní místo'}
                </span>
                <span className='font-bold tabular-nums'>{formatMoney(entry.amount)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ZasilkovnaCard
