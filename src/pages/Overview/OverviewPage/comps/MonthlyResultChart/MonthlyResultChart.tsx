import { ChartCard } from '@/components'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui'
import type { getMonthlyHistory } from '@/utils/envelopeUtils'
import { formatMoney, formatMoneyCompact } from '@/utils/moneyUtils'
import { formatMonth } from '@/utils/weekUtils'
import { format, parseISO } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from 'recharts'

const config = {
  result: { label: 'Měsíc celkem', color: 'var(--chart-3)' },
} satisfies ChartConfig

type Props = {
  history: ReturnType<typeof getMonthlyHistory>
}

/** One bar per month above or below zero; position carries the sign, colour only supports it. */
const MonthlyResultChart = ({ history }: Props) => {
  const data = history.map(m => ({
    label: format(parseISO(m.month), 'LLL', { locale: cs }),
    name: formatMonth(parseISO(m.month)) + (m.inProgress ? ' (zatím)' : ''),
    result: m.result,
    inProgress: m.inProgress,
  }))

  return (
    <ChartCard
      description='Co obchodu zůstalo po výplatách a fixních nákladech'
      emptyText={
        !history.some(m => !m.inProgress) && history.every(m => m.sales === 0)
          ? 'Výsledek se ukáže, až budou za měsíc zapsané tržby.'
          : undefined
      }
      title='Výsledek měsíců'
    >
      <ChartContainer className='aspect-auto h-56 w-full' config={config}>
        <BarChart data={data} margin={{ left: 4, right: 4 }}>
          <CartesianGrid stroke='var(--border)' strokeDasharray='3 4' vertical={false} />
          <XAxis axisLine={false} dataKey='label' tickLine={false} tickMargin={8} />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            domain={[(min: number) => Math.min(0, min), (max: number) => Math.max(0, max)]}
            tickFormatter={formatMoneyCompact}
            tickLine={false}
            width={48}
          />
          <ReferenceLine stroke='var(--muted-foreground)' strokeOpacity={0.5} y={0} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => payload?.[0]?.payload.name}
                valueFormatter={formatMoney}
              />
            }
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
          />
          <Bar dataKey='result' maxBarSize={36} radius={4}>
            {/* The running month is only "so far": drawn lighter. */}
            {data.map(entry => (
              <Cell
                fill={entry.result < 0 ? 'var(--chart-1)' : 'var(--chart-3)'}
                fillOpacity={entry.inProgress ? 0.45 : 1}
                key={entry.label}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

export default MonthlyResultChart
