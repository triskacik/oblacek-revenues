import { Main, PageHeader } from '@/components'
import { Button } from '@/components/ui'
import { Route } from '@/routes/(app)/month/$monthId'
import { formatMonth, getCurrentMonthId, parseMonthId, shiftMonthId } from '@/utils/weekUtils'
import { PlaceholderCard } from '@/pages/comps'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MonthDetail = () => {
  const { monthId } = Route.useParams()
  // The route redirects invalid ids, so the month always parses here.
  const firstDay = parseMonthId(monthId) as Date
  const isCurrentMonth = monthId === getCurrentMonthId()
  const title = formatMonth(firstDay)

  return (
    <>
      <PageHeader title={title.charAt(0).toUpperCase() + title.slice(1)}>
        <div className='flex items-center gap-1'>
          <Button asChild size='icon' variant='ghost'>
            <Link params={{ monthId: shiftMonthId(monthId, -1) }} to='/month/$monthId'>
              <ChevronLeft />
              <span className='sr-only'>Předchozí měsíc</span>
            </Link>
          </Button>
          <Button asChild size='icon' variant='ghost'>
            <Link params={{ monthId: shiftMonthId(monthId, 1) }} to='/month/$monthId'>
              <ChevronRight />
              <span className='sr-only'>Další měsíc</span>
            </Link>
          </Button>
          {isCurrentMonth ? null : (
            <Button asChild size='sm' variant='outline'>
              <Link params={{ monthId: getCurrentMonthId() }} to='/month/$monthId'>
                Tento měsíc
              </Link>
            </Button>
          )}
        </div>
      </PageHeader>
      <Main>
        <div className='grid gap-4 lg:grid-cols-3'>
          <div className='flex flex-col gap-4 lg:col-span-2'>
            <PlaceholderCard
              description='Tržby, výdaje, výplaty, fixní náklady, Zásilkovna a výsledek měsíce.'
              title='Souhrn měsíce'
            />
            <PlaceholderCard
              description='Tržby, výdaje a výplaty po týdnech.'
              title='Graf měsíce'
            />
            <PlaceholderCard description='Uzávěrky jednotlivých týdnů.' title='Týdny' />
          </div>
          <div className='flex flex-col gap-4'>
            <PlaceholderCard description='Odškrtávání zaplacených nákladů.' title='Fixní náklady' />
            <PlaceholderCard description='Příjem za výdejní místo.' title='Zásilkovna' />
          </div>
        </div>
      </Main>
    </>
  )
}

export default MonthDetail
