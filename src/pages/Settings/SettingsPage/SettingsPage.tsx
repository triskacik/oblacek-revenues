import { useSettings } from '@/api/settings'
import { Main, PageHeader } from '@/components'
import { Skeleton } from '@/components/ui'
import { FixedCostsCard, OpeningCard, OpeningHoursCard } from './comps'

const SettingsPage = () => {
  const { data: settings, isPending, isError } = useSettings()

  return (
    <Main>
      <PageHeader title='Nastavení' />
      <div className='grid items-start gap-6 lg:grid-cols-2'>
        <FixedCostsCard />
        <div className='flex flex-col gap-6'>
          {isPending ? (
            <>
              <Skeleton className='h-64 rounded-2xl' />
              <Skeleton className='h-56 rounded-2xl' />
            </>
          ) : isError ? (
            <p className='text-sm text-muted-foreground'>Nastavení se nepodařilo načíst.</p>
          ) : (
            <>
              <OpeningHoursCard settings={settings} />
              <OpeningCard settings={settings} />
            </>
          )}
        </div>
      </div>
    </Main>
  )
}

export default SettingsPage
