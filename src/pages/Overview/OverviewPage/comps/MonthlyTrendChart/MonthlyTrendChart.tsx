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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const config = {
  sales: { label: 'Tržby', color: 'var(--chart-1)' },
  expenses: { label: 'Výdaje', color: 'var(--chart-2)' },
} satisfies ChartConfig

type Props = {
  history: ReturnType<typeof getMonthlyHistory>
}

const MonthlyTrendChart = ({ history }: Props) => {
  const data = history.map(m => ({
    label: format(parseISO(m.month), 'LLL', { locale: cs }),
    name: formatMonth(parseISO(m.month)) + (m.inProgress ? ' (zatím)' : ''),
    sales: m.sales,
    expenses: m.expenses,
  }))

  return (
    <ChartCard
      description='Tržby a výdaje po měsících'
      emptyText={
        data.every(d => d.sales === 0 && d.expenses === 0)
          ? 'Graf se ukáže, jakmile budou zapsané tržby a výdaje.'
          : undefined
      }
      series={[
        { label: 'Tržby', color: 'var(--chart-1)' },
        { label: 'Výdaje', color: 'var(--chart-2)' },
      ]}
      title='Měsíc po měsíci'
    >
      <ChartContainer className='aspect-auto h-64 w-full' config={config}>
        <BarChart barCategoryGap='30%' barGap={2} data={data} margin={{ left: 4, right: 4 }}>
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
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => payload?.[0]?.payload.name}
                valueFormatter={formatMoney}
              />
            }
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
          />
          <Bar dataKey='sales' fill='var(--color-sales)' maxBarSize={32} radius={[4, 4, 0, 0]} />
          <Bar
            dataKey='expenses'
            fill='var(--color-expenses)'
            maxBarSize={32}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

export default MonthlyTrendChart
