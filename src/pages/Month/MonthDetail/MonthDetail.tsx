import { Main, PageHeader, PeriodNav } from '@/components'
import useLedger from '@/hooks/useLedger'
import FixedCostsBoard from '@/pages/comps/FixedCostsBoard/FixedCostsBoard'
import { Route } from '@/routes/(app)/month/$monthId'
import { toDbDate } from '@/utils/dateUtils'
import { getMonthSummary } from '@/utils/envelopeUtils'
import {
  formatMonth,
  getCurrentMonthId,
  getMonthWeekStarts,
  parseMonthId,
  shiftMonthId,
} from '@/utils/weekUtils'
import { startOfISOWeek } from 'date-fns'
import { MonthTiles, MonthWeeks, WeeklyChart, ZasilkovnaCard } from './comps'

const MonthDetail = () => {
  const { monthId } = Route.useParams()
  // The route redirects invalid ids, so the month always parses here.
  const firstDay = parseMonthId(monthId) as Date
  const month = `${monthId}-01`
  const currentMonthId = getCurrentMonthId()
  const title = formatMonth(firstDay)

  const { ledger, isError } = useLedger()
  const summary = ledger ? getMonthSummary(ledger, month) : null

  // "Still missing" for fixed costs: as of this week in the current month, otherwise the month's
  // last week (past) or first week (future).
  const weeks = getMonthWeekStarts(firstDay).map(toDbDate)
  const currentMonday = toDbDate(startOfISOWeek(new Date()))
  const statusMonday = weeks.includes(currentMonday)
    ? currentMonday
    : month < `${currentMonthId}-01`
      ? weeks[weeks.length - 1]
      : weeks[0]

  return (
    <Main>
      <PageHeader title={title.charAt(0).toUpperCase() + title.slice(1)}>
        <PeriodNav
          current={
            monthId === currentMonthId
              ? undefined
              : { to: '/month/$monthId', params: { monthId: currentMonthId } }
          }
          currentLabel='Skočit na aktuální měsíc'
          next={{ to: '/month/$monthId', params: { monthId: shiftMonthId(monthId, 1) } }}
          nextLabel='Další měsíc'
          prev={{ to: '/month/$monthId', params: { monthId: shiftMonthId(monthId, -1) } }}
          prevLabel='Předchozí měsíc'
        />
      </PageHeader>
      {isError ? (
        <p className='mb-6 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground'>
          Některá data se nepodařilo načíst. Zkus obnovit stránku.
        </p>
      ) : null}
      <MonthTiles inProgress={monthId >= currentMonthId} summary={summary} />
      <div className='mt-6 grid gap-6 lg:grid-cols-5'>
        <div className='flex flex-col gap-6 lg:col-span-3'>
          <MonthWeeks openDays={ledger?.settings.open_days} summary={summary} />
          {summary && summary.weeks.length > 0 ? (
            <WeeklyChart openDays={ledger?.settings.open_days} summary={summary} />
          ) : null}
        </div>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <FixedCostsBoard ledger={ledger} month={month} statusMonday={statusMonday} />
          <ZasilkovnaCard ledger={ledger} month={month} />
        </div>
      </div>
    </Main>
  )
}

export default MonthDetail
