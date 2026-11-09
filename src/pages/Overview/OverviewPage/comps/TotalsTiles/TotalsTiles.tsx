import { StatTile } from '@/components'
import type { getTotalsSinceOpening } from '@/utils/envelopeUtils'
import { formatMoney } from '@/utils/moneyUtils'
import { HandCoins, House, Package, ShoppingBasket } from 'lucide-react'

type Props = {
  totals: ReturnType<typeof getTotalsSinceOpening>
}

const TotalsTiles = ({ totals }: Props) => (
  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
    <StatTile
      hint='za ukončené týdny'
      icon={ShoppingBasket}
      label='Průměrná týdenní tržba'
      tone='terracotta'
      value={totals.averageWeeklySales === null ? '- Kč' : formatMoney(totals.averageWeeklySales)}
    />
    <StatTile
      hint='od otevření'
      icon={HandCoins}
      label='Vyplaceno prodavačce'
      tone='olive'
      value={formatMoney(totals.payouts)}
    />
    <StatTile
      hint='od otevření'
      icon={House}
      label='Zaplaceno fixních nákladů'
      tone='honey'
      value={formatMoney(totals.fixedPaid)}
    />
    <StatTile
      hint='od otevření'
      icon={Package}
      label='Zásilkovna'
      tone='sage'
      value={formatMoney(totals.zasilkovna)}
    />
  </div>
)

export default TotalsTiles
