import { Chalkboard, EmptyState, Main, PageHeader, PeriodNav, StatTile } from '@/components'
import { Route } from '@/routes/(app)/month/$monthId'
import {
  formatMonth,
  formatWeekRange,
  getCurrentMonthId,
  getMonthWeekStarts,
  parseMonthId,
  shiftMonthId,
  toWeekId,
} from '@/utils/weekUtils'
import { Link } from '@tanstack/react-router'
import { ChartColumn, HandCoins, Package, ReceiptText, ShoppingBasket, Sprout } from 'lucide-react'

const MonthDetail = () => {
  const { monthId } = Route.useParams()
  // The route redirects invalid ids, so the month always parses here.
  const firstDay = parseMonthId(monthId) as Date
  const currentMonthId = getCurrentMonthId()
  const title = formatMonth(firstDay)

  return (
    <Main>
      <PageHeader title={title.charAt(0).toUpperCase() + title.slice(1)}>
        <PeriodNav
          current={
            monthId === currentMonthId
              ? undefined
              : { to: '/month/$monthId', params: { monthId: currentMonthId } }
          }
          currentLabel='Tento měsíc'
          next={{ to: '/month/$monthId', params: { monthId: shiftMonthId(monthId, 1) } }}
          nextLabel='Další měsíc'
          prev={{ to: '/month/$monthId', params: { monthId: shiftMonthId(monthId, -1) } }}
          prevLabel='Předchozí měsíc'
        />
      </PageHeader>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatTile icon={ShoppingBasket} label='Tržby' tone='terracotta' value='— Kč' />
        <StatTile icon={ReceiptText} label='Výdaje' tone='honey' value='— Kč' />
        <StatTile icon={HandCoins} label='Prodavačce' tone='olive' value='— Kč' />
        <StatTile icon={Sprout} label='Měsíc celkem' tone='sage' value='— Kč' />
      </div>
      <div className='mt-6 grid gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <EmptyState
            className='min-h-56'
            description='Tržby, výdaje a výplaty po týdnech, jakmile budou data.'
            icon={ChartColumn}
            title='Jak šel měsíc'
          />
          <section className='rounded-2xl border border-border bg-card p-5 shadow-sm shadow-olive/5'>
            <h2 className='mb-3 font-chalk text-2xl leading-none text-olive'>Týdny v měsíci</h2>
            <ul className='divide-y divide-border/70'>
              {getMonthWeekStarts(firstDay).map(monday => {
                const weekId = toWeekId(monday)
                return (
                  <li key={weekId}>
                    <Link
                      className='flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-secondary/60'
                      params={{ weekId }}
                      to='/week/$weekId'
                    >
                      <span className='font-semibold'>Týden {Number(weekId.split('-W')[1])}</span>
                      <span className='text-muted-foreground'>{formatWeekRange(monday)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
        <div className='flex flex-col gap-6'>
          <Chalkboard title='Zaplaceno?'>
            <p className='text-sm text-chalk-dim'>
              Tady si budeš odškrtávat nájem a další fixní platby za {title}.
            </p>
          </Chalkboard>
          <EmptyState
            description='Až přijde platba za výdejní místo, zapíšeš ji k měsíci, za který je.'
            icon={Package}
            title='Zásilkovna'
          />
        </div>
      </div>
    </Main>
  )
}

export default MonthDetail
