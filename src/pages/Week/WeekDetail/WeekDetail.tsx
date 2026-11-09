import { Main, PageHeader, PeriodNav, StatTile } from '@/components'
import { Route } from '@/routes/(app)/week/$weekId'
import { formatWeekRange, getCurrentWeekId, parseWeekId, shiftWeekId } from '@/utils/weekUtils'
import { ReceiptText, ShoppingBasket, Sparkles } from 'lucide-react'
import { FixedCostsBoard, NoticesCard, RecommendationBoard, ShopMoneyCard, WeekDays } from './comps'

const WeekDetail = () => {
  const { weekId } = Route.useParams()
  // The route redirects invalid ids, so the week always parses here.
  const monday = parseWeekId(weekId) as Date
  const weekNumber = Number(weekId.split('-W')[1])
  const currentWeekId = getCurrentWeekId()

  return (
    <Main>
      <PageHeader subtitle={formatWeekRange(monday)} title={`Týden ${weekNumber}`}>
        <PeriodNav
          current={
            weekId === currentWeekId
              ? undefined
              : { to: '/week/$weekId', params: { weekId: currentWeekId } }
          }
          currentLabel='Tento týden'
          next={{ to: '/week/$weekId', params: { weekId: shiftWeekId(weekId, 1) } }}
          nextLabel='Další týden'
          prev={{ to: '/week/$weekId', params: { weekId: shiftWeekId(weekId, -1) } }}
          prevLabel='Předchozí týden'
        />
      </PageHeader>
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <RecommendationBoard />
          <div className='grid gap-4 sm:grid-cols-3'>
            <StatTile icon={ShoppingBasket} label='Tržby' tone='terracotta' value='— Kč' />
            <StatTile icon={ReceiptText} label='Výdaje' tone='honey' value='— Kč' />
            <StatTile icon={Sparkles} label='Navíc' tone='sage' value='— Kč' />
          </div>
          <WeekDays monday={monday} />
        </div>
        <div className='flex flex-col gap-6 lg:pt-16'>
          <ShopMoneyCard />
          <FixedCostsBoard />
          <NoticesCard />
        </div>
      </div>
    </Main>
  )
}

export default WeekDetail
