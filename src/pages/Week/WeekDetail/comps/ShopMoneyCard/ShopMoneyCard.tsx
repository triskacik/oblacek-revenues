import { HowCalculated } from '@/components'
import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Ledger } from '@/types'
import { todayDbDate } from '@/utils/dateUtils'
import { getShopMoney } from '@/utils/envelopeUtils'
import { formatMoney, sumMoney } from '@/utils/moneyUtils'
import { PiggyBank } from 'lucide-react'

type Props = {
  ledger: Ledger | null
}

const Amount = ({ value }: { value: number }) => (
  <span className={cn('font-semibold tabular-nums', value < 0 && 'text-accent-foreground')}>
    {formatMoney(value)}
  </span>
)

const ShopMoneyCard = ({ ledger }: Props) => {
  const money = ledger ? getShopMoney(ledger, todayDbDate()) : null

  return (
    <section className='rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5'>
      <div className='mb-4 flex items-center gap-3'>
        <span className='flex size-10 items-center justify-center rounded-full bg-sage-soft text-success-foreground'>
          <PiggyBank className='size-5' />
        </span>
        <h2 className='font-chalk text-2xl leading-none text-olive'>Peníze obchodu</h2>
      </div>
      {!ledger || !money ? (
        <Skeleton className='h-20 rounded-xl' />
      ) : (
        <>
          <dl className='space-y-2 text-sm'>
            <div className='flex justify-between gap-3'>
              <dt className='text-muted-foreground'>Odloženo na fixní náklady</dt>
              <dd>
                <Amount value={money.fixed} />
              </dd>
            </div>
            <div className='flex justify-between gap-3'>
              <dt className='text-muted-foreground'>Na nákupy</dt>
              <dd>
                <Amount value={money.purchases} />
              </dd>
            </div>
            <div className='flex justify-between gap-3 border-t border-border pt-2 text-base'>
              <dt className='font-semibold'>Celkem</dt>
              <dd>
                <Amount value={sumMoney([money.fixed, money.purchases])} />
              </dd>
            </div>
          </dl>
          {money.openSurplus !== 0 ? (
            <p className='mt-3 rounded-xl bg-secondary/70 px-3 py-2 text-xs text-muted-foreground'>
              Z neuzavřených týdnů k tomu ještě {money.openSurplus > 0 ? '+' : '-'}
              {formatMoney(Math.abs(money.openSurplus))}. Rozdělíš je při uzávěrce.
            </p>
          ) : null}
          {money.fixed < 0 ? (
            <p className='mt-2 text-xs text-muted-foreground'>
              Fixní náklady jsou zaplacené dřív, než se na ně odložilo. Doplní se z dalších týdnů.
            </p>
          ) : null}
          <HowCalculated
            className='mt-3'
            rows={[
              { kind: 'note', label: 'Odloženo na fixní náklady:' },
              { kind: 'plus', label: 'Počáteční stav', amount: ledger.settings.opening_fixed },
              {
                kind: 'plus',
                label: 'Odloženo při uzávěrkách',
                amount: sumMoney(ledger.closings.map(c => c.to_fixed)),
              },
              {
                kind: 'plus',
                label: 'Zásilkovna',
                amount: sumMoney(ledger.otherIncomes.map(i => i.amount)),
              },
              {
                kind: 'minus',
                label: 'Zaplacené fixní náklady',
                amount: sumMoney([
                  ledger.settings.opening_fixed,
                  ...ledger.closings.map(c => c.to_fixed),
                  ...ledger.otherIncomes.map(i => i.amount),
                  -money.fixed,
                ]),
              },
              { kind: 'total', label: 'Odloženo', amount: money.fixed },
              {
                kind: 'note',
                label:
                  'Na nákupy je to, co zůstalo po poslední uzávěrce: výplaty a odložené peníze jsou už odečtené.',
              },
            ]}
          />
        </>
      )}
    </section>
  )
}

export default ShopMoneyCard
