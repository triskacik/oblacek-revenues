import { AlertsPanel, Main, PageHeader, PeriodNav } from '@/components'
import useShopStatus from '@/hooks/useShopStatus'
import FixedCostsBoard from '@/pages/comps/FixedCostsBoard/FixedCostsBoard'
import { Route } from '@/routes/(app)/week/$weekId'
import { toDbDate } from '@/utils/dateUtils'
import { getWeekMonth } from '@/utils/envelopeUtils'
import { formatWeekRange, getCurrentWeekId, parseWeekId, shiftWeekId } from '@/utils/weekUtils'
import { addDays } from 'date-fns'
import { RecommendationBoard, WeekDays, WeekTotals } from './comps'

const WeekDetail = () => {
  const { weekId } = Route.useParams()
  // The route redirects invalid ids, so the week always parses here.
  const monday = parseWeekId(weekId) as Date
  const mondayDb = toDbDate(monday)
  const sundayDb = toDbDate(addDays(monday, 6))
  const weekNumber = Number(weekId.split('-W')[1])
  const currentWeekId = getCurrentWeekId()

  const { ledger, alerts, isPending, isError } = useShopStatus()
  const inWeek = (date: string) => date >= mondayDb && date <= sundayDb
  const sales = ledger?.sales.filter(s => inWeek(s.date)) ?? []
  const expenses = ledger?.expenses.filter(e => inWeek(e.date)) ?? []
  const openDays = ledger?.settings.open_days

  return (
    <Main>
      <PageHeader subtitle={formatWeekRange(monday, openDays)} title={`Týden ${weekNumber}`}>
        <PeriodNav
          current={
            weekId === currentWeekId
              ? undefined
              : { to: '/week/$weekId', params: { weekId: currentWeekId } }
          }
          currentLabel='Skočit na aktuální týden'
          next={{ to: '/week/$weekId', params: { weekId: shiftWeekId(weekId, 1) } }}
          nextLabel='Další týden'
          prev={{ to: '/week/$weekId', params: { weekId: shiftWeekId(weekId, -1) } }}
          prevLabel='Předchozí týden'
        />
      </PageHeader>
      {isError ? (
        <p className='mb-6 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground'>
          Některá data se nepodařilo načíst. Zkus obnovit stránku.
        </p>
      ) : null}
      {/*
        Order = priority on mobile (columns stack): what to do, the week, day by day, then the payout
        board and the fixed-cost checklist. How the month is going lives in the header tracker.
      */}
      <div className='grid gap-6 lg:grid-cols-5'>
        <div className='flex flex-col gap-6 lg:col-span-3'>
          <AlertsPanel alerts={alerts} />
          <WeekTotals expenses={expenses} isPending={isPending} sales={sales} />
          <WeekDays
            expenses={expenses}
            isPending={isPending}
            monday={monday}
            openDays={openDays}
            sales={sales}
          />
        </div>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          {/* Keyed by week so the "keep for purchases" field starts fresh on every week. */}
          <RecommendationBoard
            key={weekId}
            ledger={ledger}
            monday={mondayDb}
            weekNumber={weekNumber}
          />
          <FixedCostsBoard ledger={ledger} month={getWeekMonth(mondayDb)} statusMonday={mondayDb} />
        </div>
      </div>
    </Main>
  )
}

export default WeekDetail
