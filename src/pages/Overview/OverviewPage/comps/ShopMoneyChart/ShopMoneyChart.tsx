import { ChartCard } from '@/components'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui'
import type { getShopMoneyHistory } from '@/utils/envelopeUtils'
import { formatMoney, formatMoneyCompact } from '@/utils/moneyUtils'
import { formatWeekRange, toWeekId } from '@/utils/weekUtils'
import { parseISO } from 'date-fns'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import type { TooltipProps } from 'recharts'

const config = {
  total: { label: 'Peníze obchodu', color: 'var(--chart-3)' },
} satisfies ChartConfig

type Point = ReturnType<typeof getShopMoneyHistory>[number] & { label: string; range: string }

type Props = {
  history: ReturnType<typeof getShopMoneyHistory>
  openDays?: number[]
}

const MoneyTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  const point = payload?.[0]?.payload as Point | undefined
  if (!active || !point) return null
  return (
    <div className='grid min-w-52 gap-1.5 rounded-xl border border-border/50 bg-popover px-3 py-2 text-xs shadow-xl'>
      <div className='font-medium'>{point.range}</div>
      <div className='flex justify-between gap-6'>
        <span className='text-muted-foreground'>Na fixní náklady</span>
        <span className='font-semibold tabular-nums'>{formatMoney(point.fixed)}</span>
      </div>
      <div className='flex justify-between gap-6'>
        <span className='text-muted-foreground'>Na nákupy</span>
        <span className='font-semibold tabular-nums'>{formatMoney(point.purchases)}</span>
      </div>
      <div className='flex justify-between gap-6 border-t border-border pt-1'>
        <span className='font-semibold'>Celkem</span>
        <span className='font-bold tabular-nums'>{formatMoney(point.total)}</span>
      </div>
    </div>
  )
}

const ShopMoneyChart = ({ history, openDays }: Props) => {
  const data: Point[] = history.map(point => ({
    ...point,
    label: `T${Number(toWeekId(parseISO(point.monday)).split('-W')[1])}`,
    range: formatWeekRange(parseISO(point.monday), openDays),
  }))

  return (
    <ChartCard
      description='Odloženo na fixní náklady a na nákupy, vždy na konci týdne'
      emptyText={
        data.length < 2 || data.every(point => point.total === 0)
          ? 'Vývoj se ukáže, až bude za sebou pár týdnů.'
          : undefined
      }
      title='Peníze obchodu'
    >
      <ChartContainer className='aspect-auto h-56 w-full' config={config}>
        <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
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
            content={<MoneyTooltip />}
            cursor={{ stroke: 'var(--muted-foreground)', strokeOpacity: 0.4 }}
          />
          <Line
            activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }}
            dataKey='total'
            dot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2, fill: 'var(--color-total)' }}
            stroke='var(--color-total)'
            strokeWidth={2}
            type='monotone'
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}

export default ShopMoneyChart
