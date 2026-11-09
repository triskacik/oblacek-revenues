import { ChartCard } from '@/components'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui'
import type { getMonthSummary } from '@/utils/envelopeUtils'
import { formatMoney, formatMoneyCompact } from '@/utils/moneyUtils'
import { formatWeekRange, toWeekId } from '@/utils/weekUtils'
import { parseISO } from 'date-fns'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const config = {
  sales: { label: 'Tržby', color: 'var(--chart-1)' },
  expenses: { label: 'Výdaje', color: 'var(--chart-2)' },
} satisfies ChartConfig

type Props = {
  summary: ReturnType<typeof getMonthSummary>
  openDays?: number[]
}

const WeeklyChart = ({ summary, openDays }: Props) => {
  const data = summary.weeks.map(week => ({
    label: `T${Number(toWeekId(parseISO(week.monday)).split('-W')[1])}`,
    range: formatWeekRange(parseISO(week.monday), openDays),
    sales: week.sales,
    expenses: week.expenses,
  }))

  return (
    <ChartCard
      description='Tržby a výdaje po týdnech'
      emptyText={
        data.every(d => d.sales === 0 && d.expenses === 0)
          ? 'Graf se ukáže, jakmile budou zapsané tržby a výdaje.'
          : undefined
      }
      series={[
        { label: 'Tržby', color: 'var(--chart-1)' },
        { label: 'Výdaje', color: 'var(--chart-2)' },
      ]}
      title='Jak šel měsíc'
    >
      <ChartContainer className='aspect-auto h-56 w-full' config={config}>
        <BarChart barCategoryGap='28%' barGap={2} data={data} margin={{ left: 4, right: 4 }}>
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
                labelFormatter={(_, payload) => payload?.[0]?.payload.range}
                valueFormatter={formatMoney}
              />
            }
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
          />
          <Bar dataKey='sales' fill='var(--color-sales)' maxBarSize={28} radius={[4, 4, 0, 0]} />
          <Bar
            dataKey='expenses'
            fill='var(--color-expenses)'
            maxBarSize={28}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

export default WeeklyChart
