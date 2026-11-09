import { EmptyState, Main, Mascot, PageHeader } from '@/components'
import { Button, Skeleton } from '@/components/ui'
import useLedger from '@/hooks/useLedger'
import { todayDbDate } from '@/utils/dateUtils'
import {
  getMonthlyHistory,
  getShopMoneyHistory,
  getTotalsSinceOpening,
} from '@/utils/envelopeUtils'
import { Link } from '@tanstack/react-router'
import { ChartSpline } from 'lucide-react'
import { MonthlyResultChart, MonthlyTrendChart, ShopMoneyChart, TotalsTiles } from './comps'

const OverviewPage = () => {
  const { ledger, isError } = useLedger()
  const today = todayDbDate()

  const renderContent = () => {
    if (isError) {
      return (
        <p className='rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground'>
          Data se nepodařilo načíst. Zkus obnovit stránku.
        </p>
      )
    }
    if (!ledger) {
      return (
        <div className='grid gap-6'>
          <Skeleton className='h-24 rounded-2xl' />
          <Skeleton className='h-72 rounded-2xl' />
        </div>
      )
    }
    if (!ledger.settings.opening_date) {
      return (
        <EmptyState
          description='Přehled začne od dne, kdy obchod otevřel. Zadej ho prosím v nastavení.'
          icon={ChartSpline}
          title='Nejdřív nastavení'
        >
          <Button asChild className='self-start rounded-full' variant='secondary'>
            <Link to='/settings'>Do nastavení</Link>
          </Button>
          <Mascot className='mx-auto w-24 opacity-80' />
        </EmptyState>
      )
    }

    const history = getMonthlyHistory(ledger, today)
    return (
      <div className='flex flex-col gap-6'>
        <TotalsTiles totals={getTotalsSinceOpening(ledger, today)} />
        <MonthlyTrendChart history={history} />
        <div className='grid gap-6 lg:grid-cols-2'>
          <MonthlyResultChart history={history} />
          <ShopMoneyChart
            history={getShopMoneyHistory(ledger, today)}
            openDays={ledger.settings.open_days}
          />
        </div>
      </div>
    )
  }

  return (
    <Main>
      <PageHeader subtitle='Jak se obchodu daří v delším čase' title='Přehled' />
      {renderContent()}
    </Main>
  )
}

export default OverviewPage
