import { Main, PageHeader } from '@/components'
import { Button } from '@/components/ui'
import { Route } from '@/routes/(app)/week/$weekId'
import { formatWeekRange, getCurrentWeekId, parseWeekId, shiftWeekId } from '@/utils/weekUtils'
import { PlaceholderCard } from '@/pages/comps'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WeekDetail = () => {
  const { weekId } = Route.useParams()
  // The route redirects invalid ids, so the week always parses here.
  const monday = parseWeekId(weekId) as Date
  const weekNumber = Number(weekId.split('-W')[1])
  const isCurrentWeek = weekId === getCurrentWeekId()

  return (
    <>
      <PageHeader title={`Týden ${weekNumber}`}>
        <div className='flex items-center gap-1'>
          <Button asChild size='icon' variant='ghost'>
            <Link params={{ weekId: shiftWeekId(weekId, -1) }} to='/week/$weekId'>
              <ChevronLeft />
              <span className='sr-only'>Předchozí týden</span>
            </Link>
          </Button>
          <span className='text-sm whitespace-nowrap text-muted-foreground'>
            {formatWeekRange(monday)}
          </span>
          <Button asChild size='icon' variant='ghost'>
            <Link params={{ weekId: shiftWeekId(weekId, 1) }} to='/week/$weekId'>
              <ChevronRight />
              <span className='sr-only'>Další týden</span>
            </Link>
          </Button>
          {isCurrentWeek ? null : (
            <Button asChild size='sm' variant='outline'>
              <Link params={{ weekId: getCurrentWeekId() }} to='/week/$weekId'>
                Dnes
              </Link>
            </Button>
          )}
        </div>
      </PageHeader>
      <Main>
        <div className='grid gap-4 lg:grid-cols-3'>
          <div className='flex flex-col gap-4 lg:col-span-2'>
            <PlaceholderCard
              description='Kolik vyplatit prodavačce, aby zbylo na nákupy a fixní náklady.'
              title='Doporučená výplata'
            />
            <div className='grid gap-4 sm:grid-cols-3'>
              <PlaceholderCard description='Součet tržeb za týden.' title='Tržby' />
              <PlaceholderCard description='Součet výdajů za týden.' title='Výdaje' />
              <PlaceholderCard description='Tržby − výdaje.' title='Přebytek' />
            </div>
            <PlaceholderCard description='Tržby a výdaje po dnech.' title='Graf týdne' />
            <PlaceholderCard description='Záznamy po dnech Po–Ne.' title='Dny' />
          </div>
          <div className='flex flex-col gap-4'>
            <PlaceholderCard
              description='Odloženo na fixní náklady a na nákupy.'
              title='Peníze obchodu'
            />
            <PlaceholderCard
              description='Pokrytí a zaplacení v tomto měsíci.'
              title='Fixní náklady'
            />
            <PlaceholderCard description='Co je potřeba udělat.' title='Upozornění' />
          </div>
        </div>
      </Main>
    </>
  )
}

export default WeekDetail
