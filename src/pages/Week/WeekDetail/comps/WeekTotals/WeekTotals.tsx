import { StatTile } from '@/components'
import type { Expense, Sale } from '@/types'
import { formatMoney, sumMoney } from '@/utils/moneyUtils'
import { ReceiptText, ShoppingBasket, Sparkles } from 'lucide-react'

type Props = {
  sales: Sale[]
  expenses: Expense[]
  isPending: boolean
}

const WeekTotals = ({ sales, expenses, isPending }: Props) => {
  const salesTotal = sumMoney(sales.map(s => s.amount))
  const expensesTotal = sumMoney(expenses.map(e => e.amount))
  const surplus = sumMoney([salesTotal, -expensesTotal])
  const show = (amount: number) => (isPending ? '- Kč' : formatMoney(amount))

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <StatTile icon={ShoppingBasket} label='Tržby' tone='terracotta' value={show(salesTotal)} />
      <StatTile icon={ReceiptText} label='Výdaje' tone='honey' value={show(expensesTotal)} />
      <StatTile
        hint={!isPending && surplus < 0 ? 'Víc výdajů než tržeb, to se stává.' : 'Tržby - výdaje'}
        icon={Sparkles}
        label={!isPending && surplus < 0 ? 'Chybí' : 'Navíc'}
        tone={!isPending && surplus < 0 ? 'terracotta' : 'sage'}
        value={show(Math.abs(surplus))}
      />
    </div>
  )
}

export default WeekTotals
