import { Main, PageHeader } from '@/components'
import { PlaceholderCard } from '@/pages/comps'

const SettingsPage = () => (
  <>
    <PageHeader title='Nastavení' />
    <Main>
      <div className='grid gap-4 lg:grid-cols-2'>
        <PlaceholderCard
          description='Nájem, služby… částka od měsíce, splatnost.'
          title='Fixní náklady'
        />
        <PlaceholderCard
          description='Od kdy aplikaci používáte a kolik peněz obchod měl.'
          title='Počáteční stav'
        />
      </div>
    </Main>
  </>
)

export default SettingsPage
