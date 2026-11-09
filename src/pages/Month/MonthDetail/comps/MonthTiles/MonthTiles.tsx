import { HowCalculated, StatTile } from '@/components'
import type { getMonthSummary } from '@/utils/envelopeUtils'
import { formatMoney } from '@/utils/moneyUtils'
import { HandCoins, ReceiptText, ShoppingBasket, Sprout } from 'lucide-react'

type Props = {
  summary: ReturnType<typeof getMonthSummary> | null
  /** The month isn't over yet: the result is only "so far". */
  inProgress: boolean
}

const MonthTiles = ({ summary, inProgress }: Props) => {
  const show = (amount: number | undefined) =>
    summary && amount !== undefined ? formatMoney(amount) : '- Kč'
  const isMinus = !!summary && summary.result < 0

  return (
    <div className='flex flex-col gap-2'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatTile
          icon={ShoppingBasket}
          label='Tržby'
          tone='terracotta'
          value={show(summary?.sales)}
        />
        <StatTile icon={ReceiptText} label='Výdaje' tone='honey' value={show(summary?.expenses)} />
        <StatTile
          hint='z uzavřených týdnů'
          icon={HandCoins}
          label='Prodavačce'
          tone='olive'
          value={show(summary?.payouts)}
        />
        {inProgress ? (
          <StatTile
            hint='Měsíc ještě běží, fixní náklady jsou započtené celé.'
            icon={Sprout}
            label='Měsíc zatím'
            tone='olive'
            value={show(summary?.result)}
          />
        ) : (
          <StatTile
            hint={isMinus ? 'Tenhle měsíc se tolik nedařilo.' : 'Co obchodu zůstalo'}
            icon={Sprout}
            label='Měsíc celkem'
            tone={isMinus ? 'terracotta' : 'sage'}
            value={show(summary?.result)}
          />
        )}
      </div>
      {summary ? (
        <HowCalculated
          className='self-end'
          rows={[
            { kind: 'plus', label: 'Tržby', amount: summary.sales },
            { kind: 'minus', label: 'Výdaje', amount: summary.expenses },
            { kind: 'plus', label: 'Zásilkovna', amount: summary.zasilkovna },
            { kind: 'minus', label: 'Vyplaceno prodavačce', amount: summary.payouts },
            ...(summary.ownerTake > 0
              ? [{ kind: 'minus' as const, label: 'Vzala sis', amount: summary.ownerTake }]
              : []),
            { kind: 'minus', label: 'Fixní náklady měsíce', amount: summary.fixedCosts },
            { kind: 'total', label: 'Měsíc celkem', amount: summary.result },
            { kind: 'note', label: 'Týden patří k měsíci podle svého čtvrtka.' },
          ]}
        />
      ) : null}
    </div>
  )
}

export default MonthTiles
